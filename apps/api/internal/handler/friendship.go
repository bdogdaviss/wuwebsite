package handler

import (
	"encoding/json"
	"net/http"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"
	"wakeup/api/internal/ws"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FriendshipHandler struct {
	db  *pgxpool.Pool
	hub *ws.Hub
}

func NewFriendshipHandler(db *pgxpool.Pool, hub *ws.Hub) *FriendshipHandler {
	return &FriendshipHandler{db: db, hub: hub}
}

func (h *FriendshipHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.SendFriendRequestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		writeError(w, "user_id is required", http.StatusBadRequest)
		return
	}

	addresseeID, err := uuid.Parse(req.UserID)
	if err != nil {
		writeError(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	if addresseeID == userID {
		writeError(w, "cannot send friend request to yourself", http.StatusBadRequest)
		return
	}

	// Check if friendship already exists in either direction
	var exists bool
	err = h.db.QueryRow(r.Context(),
		`SELECT EXISTS(
			SELECT 1 FROM friendships
			WHERE (requester_id = $1 AND addressee_id = $2)
			   OR (requester_id = $2 AND addressee_id = $1)
		)`,
		userID, addresseeID,
	).Scan(&exists)
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}
	if exists {
		writeError(w, "friendship already exists or pending", http.StatusConflict)
		return
	}

	// Create friendship request
	var friendship model.Friendship
	err = h.db.QueryRow(r.Context(),
		`INSERT INTO friendships (requester_id, addressee_id, status)
		 VALUES ($1, $2, 'pending')
		 RETURNING id, requester_id, addressee_id, status, created_at, updated_at`,
		userID, addresseeID,
	).Scan(&friendship.ID, &friendship.RequesterID, &friendship.AddresseeID,
		&friendship.Status, &friendship.CreatedAt, &friendship.UpdatedAt)
	if err != nil {
		writeError(w, "failed to create friend request", http.StatusInternalServerError)
		return
	}

	// Notify the addressee via WebSocket
	if h.hub != nil {
		h.hub.Broadcast([]uuid.UUID{addresseeID}, ws.Event{
			Type: "friend.request",
			Data: friendship,
		})
	}

	writeJSON(w, http.StatusCreated, friendship)
}

func (h *FriendshipHandler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	friendshipID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid friendship id", http.StatusBadRequest)
		return
	}

	// Only the addressee can accept
	var friendship model.Friendship
	err = h.db.QueryRow(r.Context(),
		`UPDATE friendships
		 SET status = 'accepted', updated_at = NOW()
		 WHERE id = $1 AND addressee_id = $2 AND status = 'pending'
		 RETURNING id, requester_id, addressee_id, status, created_at, updated_at`,
		friendshipID, userID,
	).Scan(&friendship.ID, &friendship.RequesterID, &friendship.AddresseeID,
		&friendship.Status, &friendship.CreatedAt, &friendship.UpdatedAt)
	if err != nil {
		writeError(w, "friend request not found or already handled", http.StatusNotFound)
		return
	}

	// Notify the requester that their request was accepted
	if h.hub != nil {
		h.hub.Broadcast([]uuid.UUID{friendship.RequesterID}, ws.Event{
			Type: "friend.accepted",
			Data: friendship,
		})
	}

	writeJSON(w, http.StatusOK, friendship)
}

func (h *FriendshipHandler) RejectRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	friendshipID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid friendship id", http.StatusBadRequest)
		return
	}

	// Only the addressee can reject
	result, err := h.db.Exec(r.Context(),
		`DELETE FROM friendships
		 WHERE id = $1 AND addressee_id = $2 AND status = 'pending'`,
		friendshipID, userID,
	)
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		writeError(w, "friend request not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FriendshipHandler) RemoveFriend(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	friendshipID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid friendship id", http.StatusBadRequest)
		return
	}

	// Either party can remove
	result, err := h.db.Exec(r.Context(),
		`DELETE FROM friendships
		 WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2) AND status = 'accepted'`,
		friendshipID, userID,
	)
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		writeError(w, "friendship not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FriendshipHandler) ListFriends(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT f.id, f.requester_id, f.addressee_id, f.status, f.created_at, f.updated_at,
		        p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
		 FROM friendships f
		 JOIN profiles p ON p.id = CASE
		     WHEN f.requester_id = $1 THEN f.addressee_id
		     ELSE f.requester_id
		 END
		 WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
		 ORDER BY f.created_at DESC`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch friends", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	friends := []model.FriendshipWithProfile{}
	for rows.Next() {
		var fp model.FriendshipWithProfile
		var profile model.Profile
		if err := rows.Scan(
			&fp.ID, &fp.RequesterID, &fp.AddresseeID, &fp.Status, &fp.CreatedAt, &fp.UpdatedAt,
			&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt,
		); err != nil {
			writeError(w, "failed to scan friendship", http.StatusInternalServerError)
			return
		}
		ResolveAvatarURL(r, &profile)
		fp.User = &profile
		friends = append(friends, fp)
	}

	writeJSON(w, http.StatusOK, model.FriendsResponse{Friends: friends})
}

func (h *FriendshipHandler) ListPending(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT f.id, f.requester_id, f.addressee_id, f.status, f.created_at, f.updated_at,
		        p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
		 FROM friendships f
		 JOIN profiles p ON p.id = f.requester_id
		 WHERE f.addressee_id = $1 AND f.status = 'pending'
		 ORDER BY f.created_at DESC`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch pending requests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	pending := []model.FriendshipWithProfile{}
	for rows.Next() {
		var fp model.FriendshipWithProfile
		var profile model.Profile
		if err := rows.Scan(
			&fp.ID, &fp.RequesterID, &fp.AddresseeID, &fp.Status, &fp.CreatedAt, &fp.UpdatedAt,
			&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt,
		); err != nil {
			writeError(w, "failed to scan pending request", http.StatusInternalServerError)
			return
		}
		ResolveAvatarURL(r, &profile)
		fp.User = &profile
		pending = append(pending, fp)
	}

	writeJSON(w, http.StatusOK, model.FriendsResponse{Friends: pending})
}
