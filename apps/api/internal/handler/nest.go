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

type NestHandler struct {
	db *pgxpool.Pool
}

func NewNestHandler(db *pgxpool.Pool) *NestHandler {
	return &NestHandler{db: db}
}

func (h *NestHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.CreateNestRequest
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

	// Create nest
	var nest model.Nest
	err = tx.QueryRow(r.Context(),
		`INSERT INTO nests (name, owner_id)
		 VALUES ($1, $2)
		 RETURNING id, name, icon_url, owner_id, created_at`,
		req.Name, userID,
	).Scan(&nest.ID, &nest.Name, &nest.IconURL, &nest.OwnerID, &nest.CreatedAt)
	if err != nil {
		writeError(w, "failed to create nest", http.StatusInternalServerError)
		return
	}

	// Add owner as member
	_, err = tx.Exec(r.Context(),
		`INSERT INTO nest_members (nest_id, user_id, role) VALUES ($1, $2, 'owner')`,
		nest.ID, userID,
	)
	if err != nil {
		writeError(w, "failed to add owner", http.StatusInternalServerError)
		return
	}

	// Create default channels
	defaultChannels := []struct {
		name     string
		chanType string
		category string
		position int
	}{
		{"general", "text", "Text Channels", 0},
		{"off-topic", "text", "Text Channels", 1},
		{"General", "voice", "Voice Channels", 0},
	}

	for _, ch := range defaultChannels {
		_, err = tx.Exec(r.Context(),
			`INSERT INTO nest_channels (nest_id, name, type, category, position)
			 VALUES ($1, $2, $3, $4, $5)`,
			nest.ID, ch.name, ch.chanType, ch.category, ch.position,
		)
		if err != nil {
			writeError(w, "failed to create default channels", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, "failed to commit", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, nest)
}

func (h *NestHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT n.id, n.name, n.icon_url, n.owner_id, n.created_at
		 FROM nests n
		 JOIN nest_members nm ON nm.nest_id = n.id
		 WHERE nm.user_id = $1
		 ORDER BY n.created_at`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch nests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	nests := []model.Nest{}
	for rows.Next() {
		var n model.Nest
		if err := rows.Scan(&n.ID, &n.Name, &n.IconURL, &n.OwnerID, &n.CreatedAt); err != nil {
			writeError(w, "failed to scan nest", http.StatusInternalServerError)
			return
		}
		nests = append(nests, n)
	}

	writeJSON(w, http.StatusOK, model.NestsResponse{Nests: nests})
}

func (h *NestHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	nestID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid nest id", http.StatusBadRequest)
		return
	}

	// Verify membership
	var isMember bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM nest_members WHERE nest_id = $1 AND user_id = $2)`,
		nestID, userID,
	).Scan(&isMember)
	if err != nil || !isMember {
		writeError(w, "not a member of this nest", http.StatusForbidden)
		return
	}

	var nest model.NestWithChannels
	err = h.db.QueryRow(r.Context(),
		`SELECT id, name, icon_url, owner_id, created_at FROM nests WHERE id = $1`,
		nestID,
	).Scan(&nest.ID, &nest.Name, &nest.IconURL, &nest.OwnerID, &nest.CreatedAt)
	if err != nil {
		writeError(w, "nest not found", http.StatusNotFound)
		return
	}

	// Fetch channels
	channelRows, err := h.db.Query(r.Context(),
		`SELECT id, nest_id, name, type, category, position, created_at
		 FROM nest_channels
		 WHERE nest_id = $1
		 ORDER BY category, position`,
		nestID,
	)
	if err != nil {
		writeError(w, "failed to fetch channels", http.StatusInternalServerError)
		return
	}
	defer channelRows.Close()

	nest.Channels = []model.NestChannel{}
	for channelRows.Next() {
		var ch model.NestChannel
		if err := channelRows.Scan(&ch.ID, &ch.NestID, &ch.Name, &ch.Type, &ch.Category, &ch.Position, &ch.CreatedAt); err != nil {
			writeError(w, "failed to scan channel", http.StatusInternalServerError)
			return
		}
		nest.Channels = append(nest.Channels, ch)
	}

	// Fetch members
	memberRows, err := h.db.Query(r.Context(),
		`SELECT nm.nest_id, nm.user_id, nm.role, nm.joined_at,
		        p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
		 FROM nest_members nm
		 JOIN profiles p ON p.id = nm.user_id
		 WHERE nm.nest_id = $1
		 ORDER BY nm.role, p.display_name`,
		nestID,
	)
	if err != nil {
		writeError(w, "failed to fetch members", http.StatusInternalServerError)
		return
	}
	defer memberRows.Close()

	nest.Members = []model.NestMember{}
	for memberRows.Next() {
		var m model.NestMember
		var p model.Profile
		if err := memberRows.Scan(
			&m.NestID, &m.UserID, &m.Role, &m.JoinedAt,
			&p.ID, &p.Email, &p.DisplayName, &p.AvatarURL, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			writeError(w, "failed to scan member", http.StatusInternalServerError)
			return
		}
		m.User = &p
		nest.Members = append(nest.Members, m)
	}

	writeJSON(w, http.StatusOK, nest)
}

func (h *NestHandler) Join(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	nestID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid nest id", http.StatusBadRequest)
		return
	}

	// Check nest exists
	var exists bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM nests WHERE id = $1)`,
		nestID,
	).Scan(&exists)
	if err != nil || !exists {
		writeError(w, "nest not found", http.StatusNotFound)
		return
	}

	// Add member (ignore if already exists)
	_, err = h.db.Exec(r.Context(),
		`INSERT INTO nest_members (nest_id, user_id, role) VALUES ($1, $2, 'member')
		 ON CONFLICT DO NOTHING`,
		nestID, userID,
	)
	if err != nil {
		writeError(w, "failed to join nest", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NestHandler) Leave(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	nestID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid nest id", http.StatusBadRequest)
		return
	}

	// Don't allow owner to leave (must transfer or delete)
	var role string
	err = h.db.QueryRow(r.Context(),
		`SELECT role FROM nest_members WHERE nest_id = $1 AND user_id = $2`,
		nestID, userID,
	).Scan(&role)
	if err != nil {
		writeError(w, "not a member of this nest", http.StatusNotFound)
		return
	}

	if role == "owner" {
		writeError(w, "owner cannot leave the nest", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(r.Context(),
		`DELETE FROM nest_members WHERE nest_id = $1 AND user_id = $2`,
		nestID, userID,
	)
	if err != nil {
		writeError(w, "failed to leave nest", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
