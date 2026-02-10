package handler

import (
	"encoding/json"
	"net/http"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"
	"wakeup/api/internal/ws"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type StatusHandler struct {
	db  *pgxpool.Pool
	hub *ws.Hub
}

func NewStatusHandler(db *pgxpool.Pool, hub *ws.Hub) *StatusHandler {
	return &StatusHandler{db: db, hub: hub}
}

func (h *StatusHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate status
	validStatuses := map[string]bool{"online": true, "idle": true, "dnd": true, "offline": true}
	if !validStatuses[req.Status] {
		writeError(w, "invalid status (must be online, idle, dnd, or offline)", http.StatusBadRequest)
		return
	}

	var profile model.Profile
	err := h.db.QueryRow(r.Context(),
		`UPDATE profiles SET status = $1, updated_at = NOW()
		 WHERE id = $2
		 RETURNING id, email, display_name, avatar_url, created_at, updated_at`,
		req.Status, userID,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "failed to update status", http.StatusInternalServerError)
		return
	}

	// Broadcast status change to all friends
	if h.hub != nil {
		rows, err := h.db.Query(r.Context(),
			`SELECT CASE WHEN requester_id = $1 THEN addressee_id ELSE requester_id END
			 FROM friendships
			 WHERE (requester_id = $1 OR addressee_id = $1) AND status = 'accepted'`,
			userID,
		)
		if err == nil {
			var friendIDs []uuid.UUID
			for rows.Next() {
				var fid uuid.UUID
				if err := rows.Scan(&fid); err == nil {
					friendIDs = append(friendIDs, fid)
				}
			}
			rows.Close()
			if len(friendIDs) > 0 {
				h.hub.Broadcast(friendIDs, ws.Event{
					Type: "status.update",
					Data: map[string]interface{}{"user_id": userID.String(), "status": req.Status},
				})
			}
		}
	}

	writeJSON(w, http.StatusOK, profile)
}

func (h *StatusHandler) GetOnlineFriends(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT p.id, p.email, p.display_name, p.avatar_url, p.status, p.created_at, p.updated_at
		 FROM profiles p
		 JOIN friendships f ON (
		     (f.requester_id = $1 AND f.addressee_id = p.id)
		     OR (f.addressee_id = $1 AND f.requester_id = p.id)
		 )
		 WHERE f.status = 'accepted' AND p.status != 'offline'
		 ORDER BY p.display_name`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch online friends", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type OnlineProfile struct {
		model.Profile
		Status string `json:"status"`
	}

	friends := []OnlineProfile{}
	for rows.Next() {
		var p OnlineProfile
		if err := rows.Scan(&p.ID, &p.Email, &p.DisplayName, &p.AvatarURL, &p.Status, &p.CreatedAt, &p.UpdatedAt); err != nil {
			writeError(w, "failed to scan friend", http.StatusInternalServerError)
			return
		}
		ResolveAvatarURL(r, &p.Profile)
		friends = append(friends, p)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"friends": friends})
}
