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

type BlockRuleHandler struct {
	db *pgxpool.Pool
}

func NewBlockRuleHandler(db *pgxpool.Pool) *BlockRuleHandler {
	return &BlockRuleHandler{db: db}
}

func (h *BlockRuleHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(),
		`SELECT id, user_id, pattern, enabled, created_at
		 FROM block_rules
		 WHERE user_id = $1
		 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		writeError(w, "failed to fetch block rules", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	rules := []model.BlockRule{}
	for rows.Next() {
		var rule model.BlockRule
		if err := rows.Scan(&rule.ID, &rule.UserID, &rule.Pattern, &rule.Enabled, &rule.CreatedAt); err != nil {
			writeError(w, "failed to scan block rule", http.StatusInternalServerError)
			return
		}
		rules = append(rules, rule)
	}

	writeJSON(w, http.StatusOK, model.BlockRulesResponse{Rules: rules})
}

func (h *BlockRuleHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.CreateBlockRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Pattern == "" {
		writeError(w, "pattern is required", http.StatusBadRequest)
		return
	}

	var rule model.BlockRule
	err := h.db.QueryRow(r.Context(),
		`INSERT INTO block_rules (user_id, pattern)
		 VALUES ($1, $2)
		 RETURNING id, user_id, pattern, enabled, created_at`,
		userID, req.Pattern,
	).Scan(&rule.ID, &rule.UserID, &rule.Pattern, &rule.Enabled, &rule.CreatedAt)

	if err != nil {
		writeError(w, "failed to create block rule", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, rule)
}

func (h *BlockRuleHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	ruleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid rule id", http.StatusBadRequest)
		return
	}

	var req model.UpdateBlockRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Build dynamic update query
	var rule model.BlockRule
	err = h.db.QueryRow(r.Context(),
		`SELECT id, user_id, pattern, enabled, created_at
		 FROM block_rules
		 WHERE id = $1 AND user_id = $2`,
		ruleID, userID,
	).Scan(&rule.ID, &rule.UserID, &rule.Pattern, &rule.Enabled, &rule.CreatedAt)

	if err != nil {
		writeError(w, "block rule not found", http.StatusNotFound)
		return
	}

	// Apply updates
	if req.Pattern != nil {
		rule.Pattern = *req.Pattern
	}
	if req.Enabled != nil {
		rule.Enabled = *req.Enabled
	}

	// Save updates
	_, err = h.db.Exec(r.Context(),
		`UPDATE block_rules
		 SET pattern = $1, enabled = $2
		 WHERE id = $3 AND user_id = $4`,
		rule.Pattern, rule.Enabled, ruleID, userID,
	)

	if err != nil {
		writeError(w, "failed to update block rule", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, rule)
}

func (h *BlockRuleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	ruleID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, "invalid rule id", http.StatusBadRequest)
		return
	}

	result, err := h.db.Exec(r.Context(),
		`DELETE FROM block_rules WHERE id = $1 AND user_id = $2`,
		ruleID, userID,
	)

	if err != nil {
		writeError(w, "failed to delete block rule", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		writeError(w, "block rule not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
