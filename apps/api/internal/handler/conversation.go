package handler

import (
	"encoding/json"
	"net/http"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ConversationHandler struct {
	db *pgxpool.Pool
}

func NewConversationHandler(db *pgxpool.Pool) *ConversationHandler {
	return &ConversationHandler{db: db}
}

func (h *ConversationHandler) CreateDM(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.CreateDMRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	otherID, err := uuid.Parse(req.UserID)
	if err != nil {
		writeError(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	if otherID == userID {
		writeError(w, "cannot create DM with yourself", http.StatusBadRequest)
		return
	}

	// Check if DM already exists between these two users
	var existingID uuid.UUID
	err = h.db.QueryRow(r.Context(),
		`SELECT c.id FROM conversations c
		 JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = $1
		 JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = $2
		 WHERE c.type = 'dm'
		 LIMIT 1`,
		userID, otherID,
	).Scan(&existingID)

	if err == nil {
		// DM already exists, return it
		conv := h.getConversationByID(r, existingID, userID)
		if conv != nil {
			writeJSON(w, http.StatusOK, conv)
			return
		}
	}

	// Create new DM conversation
	tx, err := h.db.Begin(r.Context())
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	var conv model.Conversation
	err = tx.QueryRow(r.Context(),
		`INSERT INTO conversations (type) VALUES ('dm')
		 RETURNING id, type, name, created_at`,
	).Scan(&conv.ID, &conv.Type, &conv.Name, &conv.CreatedAt)
	if err != nil {
		writeError(w, "failed to create conversation", http.StatusInternalServerError)
		return
	}

	// Add both members
	_, err = tx.Exec(r.Context(),
		`INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
		conv.ID, userID, otherID,
	)
	if err != nil {
		writeError(w, "failed to add members", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, "failed to commit", http.StatusInternalServerError)
		return
	}

	// Fetch full conversation with members
	result := h.getConversationByID(r, conv.ID, userID)
	if result == nil {
		writeJSON(w, http.StatusCreated, conv)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (h *ConversationHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		writeError(w, "name is required", http.StatusBadRequest)
		return
	}

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	var conv model.Conversation
	err = tx.QueryRow(r.Context(),
		`INSERT INTO conversations (type, name) VALUES ('group', $1)
		 RETURNING id, type, name, created_at`,
		req.Name,
	).Scan(&conv.ID, &conv.Type, &conv.Name, &conv.CreatedAt)
	if err != nil {
		writeError(w, "failed to create group", http.StatusInternalServerError)
		return
	}

	// Add creator as member
	_, err = tx.Exec(r.Context(),
		`INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)`,
		conv.ID, userID,
	)
	if err != nil {
		writeError(w, "failed to add creator", http.StatusInternalServerError)
		return
	}

	// Add other members
	for _, memberIDStr := range req.MemberIDs {
		memberID, err := uuid.Parse(memberIDStr)
		if err != nil {
			continue
		}
		if memberID == userID {
			continue
		}
		_, err = tx.Exec(r.Context(),
			`INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)
			 ON CONFLICT DO NOTHING`,
			conv.ID, memberID,
		)
		if err != nil {
			writeError(w, "failed to add member", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, "failed to commit", http.StatusInternalServerError)
		return
	}

	result := h.getConversationByID(r, conv.ID, userID)
	if result == nil {
		writeJSON(w, http.StatusCreated, conv)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (h *ConversationHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT c.id, c.type, c.name, c.created_at
		 FROM conversations c
		 JOIN conversation_members cm ON cm.conversation_id = c.id
		 WHERE cm.user_id = $1
		 ORDER BY c.created_at DESC`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch conversations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	conversations := []model.Conversation{}
	for rows.Next() {
		var c model.Conversation
		if err := rows.Scan(&c.ID, &c.Type, &c.Name, &c.CreatedAt); err != nil {
			writeError(w, "failed to scan conversation", http.StatusInternalServerError)
			return
		}

		// Fetch members for each conversation
		memberRows, err := h.db.Query(r.Context(),
			`SELECT p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
			 FROM profiles p
			 JOIN conversation_members cm ON cm.user_id = p.id
			 WHERE cm.conversation_id = $1`,
			c.ID,
		)
		if err == nil {
			var members []model.Profile
			for memberRows.Next() {
				var p model.Profile
				if err := memberRows.Scan(&p.ID, &p.Email, &p.DisplayName, &p.AvatarURL, &p.CreatedAt, &p.UpdatedAt); err == nil {
					ResolveAvatarURL(r, &p)
					members = append(members, p)
				}
			}
			memberRows.Close()
			c.Members = members
		}

		conversations = append(conversations, c)
	}

	writeJSON(w, http.StatusOK, model.ConversationsResponse{Conversations: conversations})
}

func (h *ConversationHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	convID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid conversation id", http.StatusBadRequest)
		return
	}

	conv := h.getConversationByID(r, convID, userID)
	if conv == nil {
		writeError(w, "conversation not found", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, conv)
}

func (h *ConversationHandler) getConversationByID(r *http.Request, convID uuid.UUID, userID uuid.UUID) *model.Conversation {
	// Verify user is a member
	var isMember bool
	err := h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM conversation_members
			WHERE conversation_id = $1 AND user_id = $2
		)`,
		convID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		return nil
	}

	var conv model.Conversation
	err = h.db.QueryRow(r.Context(),
		`SELECT id, type, name, created_at FROM conversations WHERE id = $1`,
		convID,
	).Scan(&conv.ID, &conv.Type, &conv.Name, &conv.CreatedAt)
	if err != nil {
		return nil
	}

	// Fetch members
	memberRows, err := h.db.Query(r.Context(),
		`SELECT p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
		 FROM profiles p
		 JOIN conversation_members cm ON cm.user_id = p.id
		 WHERE cm.conversation_id = $1`,
		convID,
	)
	if err == nil {
		var members []model.Profile
		for memberRows.Next() {
			var p model.Profile
			if err := memberRows.Scan(&p.ID, &p.Email, &p.DisplayName, &p.AvatarURL, &p.CreatedAt, &p.UpdatedAt); err == nil {
				ResolveAvatarURL(r, &p)
				members = append(members, p)
			}
		}
		memberRows.Close()
		conv.Members = members
	}

	return &conv
}
