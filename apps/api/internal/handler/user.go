package handler

import (
	"net/http"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserHandler struct {
	db *pgxpool.Pool
}

func NewUserHandler(db *pgxpool.Pool) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	q := r.URL.Query().Get("q")
	if q == "" || len(q) < 2 {
		writeJSON(w, http.StatusOK, model.SearchUsersResponse{Users: []model.Profile{}})
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles
		 WHERE id != $1
		   AND (display_name ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%')
		 ORDER BY display_name
		 LIMIT 20`,
		userID, q,
	)
	if err != nil {
		writeError(w, "failed to search users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	users := []model.Profile{}
	for rows.Next() {
		var p model.Profile
		if err := rows.Scan(&p.ID, &p.Email, &p.DisplayName, &p.AvatarURL, &p.CreatedAt, &p.UpdatedAt); err != nil {
			writeError(w, "failed to scan user", http.StatusInternalServerError)
			return
		}
		users = append(users, p)
	}

	writeJSON(w, http.StatusOK, model.SearchUsersResponse{Users: users})
}
