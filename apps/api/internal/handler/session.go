package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionHandler struct {
	db *pgxpool.Pool
}

func NewSessionHandler(db *pgxpool.Pool) *SessionHandler {
	return &SessionHandler{db: db}
}

func (h *SessionHandler) StartSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if user already has an active session
	var existingSession model.FocusSession
	err := h.db.QueryRow(r.Context(),
		`SELECT id, user_id, started_at, ended_at, status, created_at
		 FROM focus_sessions
		 WHERE user_id = $1 AND status = 'active'
		 LIMIT 1`,
		userID,
	).Scan(&existingSession.ID, &existingSession.UserID, &existingSession.StartedAt,
		&existingSession.EndedAt, &existingSession.Status, &existingSession.CreatedAt)

	if err == nil {
		// Return existing active session
		writeJSON(w, http.StatusOK, existingSession)
		return
	}

	// Create new session
	var session model.FocusSession
	err = h.db.QueryRow(r.Context(),
		`INSERT INTO focus_sessions (user_id, status)
		 VALUES ($1, 'active')
		 RETURNING id, user_id, started_at, ended_at, status, created_at`,
		userID,
	).Scan(&session.ID, &session.UserID, &session.StartedAt, &session.EndedAt, &session.Status, &session.CreatedAt)

	if err != nil {
		writeError(w, "failed to create session", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, session)
}

func (h *SessionHandler) StopSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Find and stop active session
	var session model.FocusSession
	now := time.Now()
	err := h.db.QueryRow(r.Context(),
		`UPDATE focus_sessions
		 SET ended_at = $1, status = 'completed'
		 WHERE user_id = $2 AND status = 'active'
		 RETURNING id, user_id, started_at, ended_at, status, created_at`,
		now, userID,
	).Scan(&session.ID, &session.UserID, &session.StartedAt, &session.EndedAt, &session.Status, &session.CreatedAt)

	if err != nil {
		writeError(w, "no active session found", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, session)
}

func (h *SessionHandler) ListSessions(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse limit from query params
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT id, user_id, started_at, ended_at, status, created_at
		 FROM focus_sessions
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2`,
		userID, limit,
	)
	if err != nil {
		writeError(w, "failed to fetch sessions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	sessions := []model.FocusSession{}
	for rows.Next() {
		var s model.FocusSession
		if err := rows.Scan(&s.ID, &s.UserID, &s.StartedAt, &s.EndedAt, &s.Status, &s.CreatedAt); err != nil {
			writeError(w, "failed to scan session", http.StatusInternalServerError)
			return
		}
		sessions = append(sessions, s)
	}

	writeJSON(w, http.StatusOK, model.FocusSessionsResponse{Sessions: sessions})
}

func (h *SessionHandler) GetActiveSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var session model.FocusSession
	err := h.db.QueryRow(r.Context(),
		`SELECT id, user_id, started_at, ended_at, status, created_at
		 FROM focus_sessions
		 WHERE user_id = $1 AND status = 'active'
		 LIMIT 1`,
		userID,
	).Scan(&session.ID, &session.UserID, &session.StartedAt, &session.EndedAt, &session.Status, &session.CreatedAt)

	if err != nil {
		// No active session - return null
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"session": nil})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"session": session})
}
