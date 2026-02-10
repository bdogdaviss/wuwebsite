package storage

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"time"

	"wakeup/api/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioClient struct {
	client *minio.Client
	bucket string
}

func NewMinioClient(cfg *config.Config) (*MinioClient, error) {
	client, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	// Ensure bucket exists
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, cfg.MinioBucket)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket: %w", err)
	}

	if !exists {
		err = client.MakeBucket(ctx, cfg.MinioBucket, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket: %w", err)
		}
	}

	return &MinioClient{
		client: client,
		bucket: cfg.MinioBucket,
	}, nil
}

// PresignPutURL generates a presigned URL for uploading an object
func (m *MinioClient) PresignPutURL(ctx context.Context, objectKey string, contentType string, expiry time.Duration) (string, error) {
	reqParams := make(url.Values)
	if contentType != "" {
		reqParams.Set("Content-Type", contentType)
	}

	presignedURL, err := m.client.PresignedPutObject(ctx, m.bucket, objectKey, expiry)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.String(), nil
}

// PresignGetURL generates a presigned URL for downloading an object
func (m *MinioClient) PresignGetURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
	presignedURL, err := m.client.PresignedGetObject(ctx, m.bucket, objectKey, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.String(), nil
}

// PutObject uploads an object directly to MinIO
func (m *MinioClient) PutObject(ctx context.Context, objectKey string, reader io.Reader, size int64, contentType string) (minio.UploadInfo, error) {
	return m.client.PutObject(ctx, m.bucket, objectKey, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
}

// DeleteObject removes an object from storage
func (m *MinioClient) DeleteObject(ctx context.Context, objectKey string) error {
	return m.client.RemoveObject(ctx, m.bucket, objectKey, minio.RemoveObjectOptions{})
}

// GetObject retrieves an object from storage for proxying
func (m *MinioClient) GetObject(ctx context.Context, objectKey string) (*minio.Object, error) {
	return m.client.GetObject(ctx, m.bucket, objectKey, minio.GetObjectOptions{})
}

// Bucket returns the bucket name
func (m *MinioClient) Bucket() string {
	return m.bucket
}
