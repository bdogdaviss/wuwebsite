package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MessageHandler struct {
	db *pgxpool.Pool
}

func NewMessageHandler(db *pgxpool.Pool) *MessageHandler {
	return &MessageHandler{db: db}
}

// SendMessage sends a message to a DM/group conversation
func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
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

	// Verify user is a member of this conversation
	var isMember bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM conversation_members
			WHERE conversation_id = $1 AND user_id = $2
		)`,
		convID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		writeError(w, "not a member of this conversation", http.StatusForbidden)
		return
	}

	var req model.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Content == "" {
		writeError(w, "content is required", http.StatusBadRequest)
		return
	}

	var msg model.Message
	err = h.db.QueryRow(r.Context(),
		`INSERT INTO messages (conversation_id, sender_id, content)
		 VALUES ($1, $2, $3)
		 RETURNING id, conversation_id, sender_id, content, created_at, updated_at`,
		convID, userID, req.Content,
	).Scan(&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Content, &msg.CreatedAt, &msg.UpdatedAt)
	if err != nil {
		writeError(w, "failed to send message", http.StatusInternalServerError)
		return
	}

	// Attach sender profile
	var sender model.Profile
	err = h.db.QueryRow(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`,
		userID,
	).Scan(&sender.ID, &sender.Email, &sender.DisplayName, &sender.AvatarURL, &sender.CreatedAt, &sender.UpdatedAt)
	if err == nil {
		ResolveAvatarURL(r, &sender)
		msg.Sender = &sender
	}

	writeJSON(w, http.StatusCreated, msg)
}

// ListMessages lists messages in a DM/group conversation
func (h *MessageHandler) ListMessages(w http.ResponseWriter, r *http.Request) {
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

	// Verify membership
	var isMember bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM conversation_members
			WHERE conversation_id = $1 AND user_id = $2
		)`,
		convID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		writeError(w, "not a member of this conversation", http.StatusForbidden)
		return
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	query := `SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at, m.updated_at,
	                 p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
	          FROM messages m
	          JOIN profiles p ON p.id = m.sender_id
	          WHERE m.conversation_id = $1`
	args := []interface{}{convID}
	argIdx := 2

	if before := r.URL.Query().Get("before"); before != "" {
		beforeID, err := uuid.Parse(before)
		if err == nil {
			query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $` + strconv.Itoa(argIdx) + `)`
			args = append(args, beforeID)
			argIdx++
		}
	}

	query += ` ORDER BY m.created_at DESC LIMIT $` + strconv.Itoa(argIdx)
	args = append(args, limit)

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, "failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	messages := []model.Message{}
	for rows.Next() {
		var m model.Message
		var sender model.Profile
		if err := rows.Scan(
			&m.ID, &m.ConversationID, &m.SenderID, &m.Content, &m.CreatedAt, &m.UpdatedAt,
			&sender.ID, &sender.Email, &sender.DisplayName, &sender.AvatarURL, &sender.CreatedAt, &sender.UpdatedAt,
		); err != nil {
			writeError(w, "failed to scan message", http.StatusInternalServerError)
			return
		}
		ResolveAvatarURL(r, &sender)
		m.Sender = &sender
		messages = append(messages, m)
	}

	writeJSON(w, http.StatusOK, model.MessagesResponse{Messages: messages})
}

// SendChannelMessage sends a message to a nest channel
func (h *MessageHandler) SendChannelMessage(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	channelID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid channel id", http.StatusBadRequest)
		return
	}

	// Verify user is a member of the nest that owns this channel
	var isMember bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM nest_members nm
			JOIN nest_channels nc ON nc.nest_id = nm.nest_id
			WHERE nc.id = $1 AND nm.user_id = $2
		)`,
		channelID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		writeError(w, "not a member of this nest", http.StatusForbidden)
		return
	}

	var req model.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Content == "" {
		writeError(w, "content is required", http.StatusBadRequest)
		return
	}

	var msg model.ChannelMessage
	err = h.db.QueryRow(r.Context(),
		`INSERT INTO channel_messages (channel_id, sender_id, content)
		 VALUES ($1, $2, $3)
		 RETURNING id, channel_id, sender_id, content, created_at`,
		channelID, userID, req.Content,
	).Scan(&msg.ID, &msg.ChannelID, &msg.SenderID, &msg.Content, &msg.CreatedAt)
	if err != nil {
		writeError(w, "failed to send message", http.StatusInternalServerError)
		return
	}

	// Attach sender
	var sender model.Profile
	err = h.db.QueryRow(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`,
		userID,
	).Scan(&sender.ID, &sender.Email, &sender.DisplayName, &sender.AvatarURL, &sender.CreatedAt, &sender.UpdatedAt)
	if err == nil {
		ResolveAvatarURL(r, &sender)
		msg.Sender = &sender
	}

	writeJSON(w, http.StatusCreated, msg)
}

// ListChannelMessages lists messages in a nest channel
func (h *MessageHandler) ListChannelMessages(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	channelID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid channel id", http.StatusBadRequest)
		return
	}

	// Verify nest membership
	var isMember bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM nest_members nm
			JOIN nest_channels nc ON nc.nest_id = nm.nest_id
			WHERE nc.id = $1 AND nm.user_id = $2
		)`,
		channelID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		writeError(w, "not a member of this nest", http.StatusForbidden)
		return
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	query := `SELECT cm.id, cm.channel_id, cm.sender_id, cm.content, cm.created_at,
	                 p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
	          FROM channel_messages cm
	          JOIN profiles p ON p.id = cm.sender_id
	          WHERE cm.channel_id = $1`
	args := []interface{}{channelID}
	argIdx := 2

	if before := r.URL.Query().Get("before"); before != "" {
		beforeID, err := uuid.Parse(before)
		if err == nil {
			query += ` AND cm.created_at < (SELECT created_at FROM channel_messages WHERE id = $` + strconv.Itoa(argIdx) + `)`
			args = append(args, beforeID)
			argIdx++
		}
	}

	query += ` ORDER BY cm.created_at DESC LIMIT $` + strconv.Itoa(argIdx)
	args = append(args, limit)

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, "failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	messages := []model.ChannelMessage{}
	for rows.Next() {
		var m model.ChannelMessage
		var sender model.Profile
		if err := rows.Scan(
			&m.ID, &m.ChannelID, &m.SenderID, &m.Content, &m.CreatedAt,
			&sender.ID, &sender.Email, &sender.DisplayName, &sender.AvatarURL, &sender.CreatedAt, &sender.UpdatedAt,
		); err != nil {
			writeError(w, "failed to scan message", http.StatusInternalServerError)
			return
		}
		ResolveAvatarURL(r, &sender)
		m.Sender = &sender
		messages = append(messages, m)
	}

	writeJSON(w, http.StatusOK, model.ChannelMessagesResponse{Messages: messages})
}
