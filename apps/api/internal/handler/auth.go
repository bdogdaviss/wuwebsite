package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"wakeup/api/internal/auth"
	"wakeup/api/internal/config"
	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"
	"wakeup/api/internal/storage"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthHandler struct {
	db    *pgxpool.Pool
	cfg   *config.Config
	minio *storage.MinioClient
}

func NewAuthHandler(db *pgxpool.Pool, cfg *config.Config, minio *storage.MinioClient) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg, minio: minio}
}

// resolveAvatarURL replaces an object_key stored in avatar_url with an API proxy URL
func (h *AuthHandler) resolveAvatarURL(r *http.Request, profile *model.Profile) {
	ResolveAvatarURL(r, profile)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.DisplayName == "" {
		writeError(w, "email, password, and display_name are required", http.StatusBadRequest)
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Check if email already exists
	var exists bool
	err := h.db.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM profiles WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		writeError(w, "database error", http.StatusInternalServerError)
		return
	}
	if exists {
		writeError(w, "email already registered", http.StatusConflict)
		return
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		writeError(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	// Insert profile
	var profile model.Profile
	err = h.db.QueryRow(r.Context(),
		`INSERT INTO profiles (email, password_hash, display_name)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, display_name, avatar_url, created_at, updated_at`,
		req.Email, passwordHash, req.DisplayName,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "failed to create profile", http.StatusInternalServerError)
		return
	}

	// Generate tokens
	accessToken, refreshToken, err := h.generateTokens(r.Context(), &profile, r)
	if err != nil {
		writeError(w, "failed to generate tokens", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusCreated, model.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         &profile,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Find profile
	var profile model.Profile
	err := h.db.QueryRow(r.Context(),
		`SELECT id, email, password_hash, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE email = $1`,
		req.Email,
	).Scan(&profile.ID, &profile.Email, &profile.PasswordHash, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check password
	if !auth.CheckPassword(req.Password, profile.PasswordHash) {
		writeError(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	// Generate tokens
	accessToken, refreshToken, err := h.generateTokens(r.Context(), &profile, r)
	if err != nil {
		writeError(w, "failed to generate tokens", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, model.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         &profile,
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req model.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	tokenHash := auth.HashRefreshToken(req.RefreshToken)

	// Find and validate refresh token
	var userID string
	var expiresAt time.Time
	err := h.db.QueryRow(r.Context(),
		`SELECT user_id, expires_at FROM refresh_tokens
		 WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
		tokenHash,
	).Scan(&userID, &expiresAt)
	if err != nil {
		writeError(w, "invalid or expired refresh token", http.StatusUnauthorized)
		return
	}

	// Revoke old token
	_, err = h.db.Exec(r.Context(),
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
		tokenHash,
	)
	if err != nil {
		writeError(w, "failed to revoke old token", http.StatusInternalServerError)
		return
	}

	// Get user profile
	var profile model.Profile
	err = h.db.QueryRow(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`,
		userID,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "user not found", http.StatusUnauthorized)
		return
	}

	// Generate new tokens
	accessToken, refreshToken, err := h.generateTokens(r.Context(), &profile, r)
	if err != nil {
		writeError(w, "failed to generate tokens", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, model.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         &profile,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req model.LogoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	tokenHash := auth.HashRefreshToken(req.RefreshToken)

	// Revoke token
	_, err := h.db.Exec(r.Context(),
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
		tokenHash,
	)
	if err != nil {
		writeError(w, "failed to revoke token", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var profile model.Profile
	err := h.db.QueryRow(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`,
		userID,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "user not found", http.StatusNotFound)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, profile)
}

func (h *AuthHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req model.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Build dynamic update query
	setClauses := []string{"updated_at = NOW()"}
	args := []interface{}{}
	argIdx := 1

	if req.DisplayName != nil {
		setClauses = append(setClauses, fmt.Sprintf("display_name = $%d", argIdx))
		args = append(args, *req.DisplayName)
		argIdx++
	}
	if req.AvatarURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("avatar_url = $%d", argIdx))
		args = append(args, *req.AvatarURL)
		argIdx++
	}
	if req.Email != nil {
		setClauses = append(setClauses, fmt.Sprintf("email = $%d", argIdx))
		args = append(args, *req.Email)
		argIdx++
	}

	if len(args) == 0 {
		writeError(w, "no fields to update", http.StatusBadRequest)
		return
	}

	args = append(args, userID)
	query := fmt.Sprintf(
		"UPDATE profiles SET %s WHERE id = $%d RETURNING id, email, display_name, avatar_url, created_at, updated_at",
		strings.Join(setClauses, ", "),
		argIdx,
	)

	var profile model.Profile
	err := h.db.QueryRow(r.Context(), query, args...).
		Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "failed to update profile", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, profile)
}

func (h *AuthHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if h.minio == nil {
		writeError(w, "file storage not available", http.StatusServiceUnavailable)
		return
	}

	// Parse multipart form (max 5MB)
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		writeError(w, "file too large (max 5MB)", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		writeError(w, "avatar file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate content type
	contentType := header.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/gif" && contentType != "image/webp" {
		writeError(w, "invalid image type (jpeg, png, gif, webp allowed)", http.StatusBadRequest)
		return
	}

	// Generate object key
	objectKey := userID.String() + "/avatars/" + header.Filename

	// Upload to MinIO
	_, err = h.minio.PutObject(r.Context(), objectKey, file, header.Size, contentType)
	if err != nil {
		writeError(w, "failed to upload file", http.StatusInternalServerError)
		return
	}

	// Update profile avatar_url with object key
	var profile model.Profile
	err = h.db.QueryRow(r.Context(),
		`UPDATE profiles SET avatar_url = $1, updated_at = NOW()
		 WHERE id = $2
		 RETURNING id, email, display_name, avatar_url, created_at, updated_at`,
		objectKey, userID,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "failed to update profile", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, profile)
}

func (h *AuthHandler) generateTokens(ctx context.Context, profile *model.Profile, r *http.Request) (string, string, error) {
	// Generate access token
	accessToken, err := auth.GenerateAccessToken(
		profile.ID,
		profile.Email,
		profile.DisplayName,
		h.cfg.JWTSecret,
		h.cfg.AccessTokenExpiry,
	)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		return "", "", err
	}

	tokenHash := auth.HashRefreshToken(refreshToken)
	expiresAt := time.Now().Add(h.cfg.RefreshTokenExpiry)

	// Get request metadata
	userAgent := r.UserAgent()
	ip := r.RemoteAddr
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		ip = strings.Split(forwarded, ",")[0]
	}

	// Store refresh token
	_, err = h.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip)
		 VALUES ($1, $2, $3, $4, $5)`,
		profile.ID, tokenHash, expiresAt, userAgent, ip,
	)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(model.ErrorResponse{Error: message})
}

// Extension auth - generate one-time code
func (h *AuthHandler) ExtensionCode(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Generate random code
	code, err := auth.GenerateRefreshToken() // Reuse the random token generator
	if err != nil {
		writeError(w, "failed to generate code", http.StatusInternalServerError)
		return
	}

	// Short code for easier handling (first 32 chars)
	code = code[:32]

	// Store code with 60 second expiry
	expiresAt := time.Now().Add(60 * time.Second)
	_, err = h.db.Exec(r.Context(),
		`INSERT INTO extension_codes (user_id, code, expires_at)
		 VALUES ($1, $2, $3)`,
		userID, code, expiresAt,
	)
	if err != nil {
		writeError(w, "failed to store code", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"code": code})
}

// Extension auth - exchange code for tokens
func (h *AuthHandler) ExtensionExchange(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Code == "" {
		writeError(w, "code is required", http.StatusBadRequest)
		return
	}

	// Find and validate code
	var userID string
	err := h.db.QueryRow(r.Context(),
		`SELECT user_id FROM extension_codes
		 WHERE code = $1 AND expires_at > NOW() AND used_at IS NULL`,
		req.Code,
	).Scan(&userID)
	if err != nil {
		writeError(w, "invalid or expired code", http.StatusUnauthorized)
		return
	}

	// Mark code as used
	_, err = h.db.Exec(r.Context(),
		`UPDATE extension_codes SET used_at = NOW() WHERE code = $1`,
		req.Code,
	)
	if err != nil {
		writeError(w, "failed to consume code", http.StatusInternalServerError)
		return
	}

	// Get user profile
	var profile model.Profile
	err = h.db.QueryRow(r.Context(),
		`SELECT id, email, display_name, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`,
		userID,
	).Scan(&profile.ID, &profile.Email, &profile.DisplayName, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		writeError(w, "user not found", http.StatusUnauthorized)
		return
	}

	// Generate tokens
	accessToken, refreshToken, err := h.generateTokens(r.Context(), &profile, r)
	if err != nil {
		writeError(w, "failed to generate tokens", http.StatusInternalServerError)
		return
	}

	h.resolveAvatarURL(r, &profile)
	writeJSON(w, http.StatusOK, model.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         &profile,
	})
}
