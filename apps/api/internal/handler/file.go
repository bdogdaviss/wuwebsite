package handler

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"wakeup/api/internal/middleware"
	"wakeup/api/internal/model"
	"wakeup/api/internal/storage"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FileHandler struct {
	db    *pgxpool.Pool
	minio *storage.MinioClient
}

func NewFileHandler(db *pgxpool.Pool, minio *storage.MinioClient) *FileHandler {
	return &FileHandler{db: db, minio: minio}
}

// Presign generates a presigned URL for uploading a file to MinIO
func (h *FileHandler) Presign(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	var req model.PresignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Filename == "" {
		writeError(w, "filename is required", http.StatusBadRequest)
		return
	}

	// Generate a unique object key: user_id/uuid/filename
	objectKey := userID.String() + "/" + uuid.New().String() + "/" + req.Filename

	// Generate presigned URL (valid for 15 minutes)
	uploadURL, err := h.minio.PresignPutURL(r.Context(), objectKey, req.ContentType, 15*time.Minute)
	if err != nil {
		writeError(w, "failed to generate upload URL", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(model.PresignResponse{
		UploadURL: uploadURL,
		ObjectKey: objectKey,
	})
}

// Complete stores the file metadata in the database after upload is complete
func (h *FileHandler) Complete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	var req model.CompleteUploadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ObjectKey == "" || req.Filename == "" {
		writeError(w, "object_key and filename are required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	bucket := h.minio.Bucket()

	var file model.File
	err := h.db.QueryRow(ctx, `
		INSERT INTO files (user_id, object_key, bucket, filename, content_type, size_bytes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, object_key, bucket, filename, content_type, size_bytes, created_at
	`, userID, req.ObjectKey, bucket, req.Filename, req.ContentType, req.SizeBytes).Scan(
		&file.ID, &file.UserID, &file.ObjectKey, &file.Bucket, &file.Filename,
		&file.ContentType, &file.SizeBytes, &file.CreatedAt,
	)

	if err != nil {
		writeError(w, "failed to save file metadata", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(file)
}

// List returns all files for the current user
func (h *FileHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	rows, err := h.db.Query(r.Context(), `
		SELECT id, user_id, object_key, bucket, filename, content_type, size_bytes, created_at
		FROM files
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		writeError(w, "failed to list files", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	files := []model.File{}
	for rows.Next() {
		var f model.File
		if err := rows.Scan(&f.ID, &f.UserID, &f.ObjectKey, &f.Bucket, &f.Filename,
			&f.ContentType, &f.SizeBytes, &f.CreatedAt); err != nil {
			writeError(w, "failed to scan file", http.StatusInternalServerError)
			return
		}
		files = append(files, f)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(model.FilesResponse{Files: files})
}

// GetDownloadURL returns a presigned download URL for a file
func (h *FileHandler) GetDownloadURL(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	fileID := r.PathValue("id")

	if fileID == "" {
		writeError(w, "file ID is required", http.StatusBadRequest)
		return
	}

	fileUUID, err := uuid.Parse(fileID)
	if err != nil {
		writeError(w, "invalid file ID", http.StatusBadRequest)
		return
	}

	// Get file metadata and verify ownership
	var file model.File
	err = h.db.QueryRow(r.Context(), `
		SELECT id, user_id, object_key, bucket, filename, content_type, size_bytes, created_at
		FROM files
		WHERE id = $1 AND user_id = $2
	`, fileUUID, userID).Scan(
		&file.ID, &file.UserID, &file.ObjectKey, &file.Bucket, &file.Filename,
		&file.ContentType, &file.SizeBytes, &file.CreatedAt,
	)

	if err != nil {
		writeError(w, "file not found", http.StatusNotFound)
		return
	}

	// Generate presigned download URL (valid for 1 hour)
	downloadURL, err := h.minio.PresignGetURL(r.Context(), file.ObjectKey, 1*time.Hour)
	if err != nil {
		writeError(w, "failed to generate download URL", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"download_url": downloadURL,
	})
}

// Delete removes a file from storage and database
func (h *FileHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	fileID := r.PathValue("id")

	if fileID == "" {
		writeError(w, "file ID is required", http.StatusBadRequest)
		return
	}

	fileUUID, err := uuid.Parse(fileID)
	if err != nil {
		writeError(w, "invalid file ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Get object key before deletion
	var objectKey string
	err = h.db.QueryRow(ctx, `
		SELECT object_key FROM files WHERE id = $1 AND user_id = $2
	`, fileUUID, userID).Scan(&objectKey)

	if err != nil {
		writeError(w, "file not found", http.StatusNotFound)
		return
	}

	// Delete from MinIO
	if err := h.minio.DeleteObject(ctx, objectKey); err != nil {
		writeError(w, "failed to delete file from storage", http.StatusInternalServerError)
		return
	}

	// Delete from database
	_, err = h.db.Exec(ctx, `DELETE FROM files WHERE id = $1 AND user_id = $2`, fileUUID, userID)
	if err != nil {
		writeError(w, "failed to delete file metadata", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func deleteFileFromMinio(ctx context.Context, minio *storage.MinioClient, objectKey string) error {
	return minio.DeleteObject(ctx, objectKey)
}

// ServeAvatar proxies an avatar image from MinIO so clients don't need direct MinIO access.
// This endpoint is public (no auth) since avatar URLs are embedded in API responses.
func (h *FileHandler) ServeAvatar(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "missing key", http.StatusBadRequest)
		return
	}

	obj, err := h.minio.GetObject(r.Context(), key)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	defer obj.Close()

	info, err := obj.Stat()
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", info.ContentType)
	w.Header().Set("Cache-Control", "public, max-age=3600")
	io.Copy(w, obj)
}
