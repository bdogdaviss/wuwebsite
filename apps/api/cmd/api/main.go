package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"wakeup/api/internal/config"
	"wakeup/api/internal/database"
	"wakeup/api/internal/handler"
	"wakeup/api/internal/middleware"
	"wakeup/api/internal/storage"
	"wakeup/api/internal/ws"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	godotenv.Load()

	cfg := config.Load()

	// Connect to database
	ctx := context.Background()
	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Could not connect to database: %v", err)
		log.Println("Running in limited mode (health check only)")
	}
	if db != nil {
		defer db.Close()
	}

	// Connect to MinIO
	var minioClient *storage.MinioClient
	minioClient, err = storage.NewMinioClient(cfg)
	if err != nil {
		log.Printf("Warning: Could not connect to MinIO: %v", err)
	}

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	// Build allowed origins from env (comma-separated) + localhost defaults
	allowedOrigins := map[string]bool{
		"http://localhost:3000": true,
		"http://localhost:3001": true,
		"http://localhost:3002": true,
		"http://localhost:8081": true,
	}
	if extra := os.Getenv("ALLOWED_ORIGINS"); extra != "" {
		for _, o := range strings.Split(extra, ",") {
			allowedOrigins[strings.TrimSpace(o)] = true
		}
	}

	r.Use(cors.Handler(cors.Options{
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			if allowedOrigins[origin] {
				return true
			}
			// Allow chrome-extension:// origins
			if len(origin) > 19 && origin[:19] == "chrome-extension://" {
				return true
			}
			return false
		},
	}))

	// Health check (always available)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})

	// Auth routes (only if database is connected)
	if db != nil {
		authHandler := handler.NewAuthHandler(db, cfg, minioClient)

		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/refresh", authHandler.Refresh)
		r.Post("/auth/logout", authHandler.Logout)
		r.Post("/auth/extension/exchange", authHandler.ExtensionExchange)

		// WebSocket hub
		hub := ws.NewHub()
		go hub.Run()
		wsHandler := ws.NewWSHandler(hub, cfg.JWTSecret)
		r.Get("/ws", wsHandler.Connect)

		// Avatar proxy (public - no auth needed, URLs are in API responses)
		if minioClient != nil {
			fileHandlerPublic := handler.NewFileHandler(db, minioClient)
			r.Get("/files/avatar", fileHandlerPublic.ServeAvatar)
		}

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Get("/me", authHandler.Me)
			r.Patch("/me", authHandler.UpdateMe)
			r.Post("/me/avatar", authHandler.UploadAvatar)
			r.Post("/auth/extension/code", authHandler.ExtensionCode)

			// Focus sessions
			sessionHandler := handler.NewSessionHandler(db)
			r.Post("/focus/sessions/start", sessionHandler.StartSession)
			r.Post("/focus/sessions/stop", sessionHandler.StopSession)
			r.Get("/focus/sessions", sessionHandler.ListSessions)
			r.Get("/focus/sessions/active", sessionHandler.GetActiveSession)

			// Block rules
			blockRuleHandler := handler.NewBlockRuleHandler(db)
			r.Get("/block-rules", blockRuleHandler.List)
			r.Post("/block-rules", blockRuleHandler.Create)
			r.Patch("/block-rules/{id}", blockRuleHandler.Update)
			r.Delete("/block-rules/{id}", blockRuleHandler.Delete)

			// Files (only if MinIO is connected)
			if minioClient != nil {
				fileHandler := handler.NewFileHandler(db, minioClient)
				r.Post("/files/presign", fileHandler.Presign)
				r.Post("/files/complete", fileHandler.Complete)
				r.Get("/files", fileHandler.List)
				r.Get("/files/{id}/download", fileHandler.GetDownloadURL)
				r.Delete("/files/{id}", fileHandler.Delete)
			}

			// Users
			userHandler := handler.NewUserHandler(db)
			r.Get("/users/search", userHandler.SearchUsers)

			// Friends
			friendshipHandler := handler.NewFriendshipHandler(db, hub)
			r.Route("/friends", func(r chi.Router) {
				r.Get("/", friendshipHandler.ListFriends)
				r.Get("/pending", friendshipHandler.ListPending)
				r.Post("/request", friendshipHandler.SendRequest)
				r.Post("/{id}/accept", friendshipHandler.AcceptRequest)
				r.Post("/{id}/reject", friendshipHandler.RejectRequest)
				r.Delete("/{id}", friendshipHandler.RemoveFriend)
			})

			// Status
			statusHandler := handler.NewStatusHandler(db, hub)
			r.Patch("/me/status", statusHandler.UpdateStatus)
			r.Get("/friends/online", statusHandler.GetOnlineFriends)

			// Conversations (DMs and groups)
			conversationHandler := handler.NewConversationHandler(db)
			messageHandler := handler.NewMessageHandler(db)
			r.Route("/conversations", func(r chi.Router) {
				r.Get("/", conversationHandler.List)
				r.Post("/", conversationHandler.CreateDM)
				r.Post("/group", conversationHandler.CreateGroup)
				r.Get("/{id}", conversationHandler.Get)
				r.Get("/{id}/messages", messageHandler.ListMessages)
				r.Post("/{id}/messages", messageHandler.SendMessage)
			})

			// Nests
			nestHandler := handler.NewNestHandler(db)
			r.Route("/nests", func(r chi.Router) {
				r.Get("/", nestHandler.List)
				r.Post("/", nestHandler.Create)
				r.Get("/{id}", nestHandler.Get)
				r.Post("/{id}/join", nestHandler.Join)
				r.Post("/{id}/leave", nestHandler.Leave)
			})

			// Channel messages
			r.Route("/channels", func(r chi.Router) {
				r.Get("/{id}/messages", messageHandler.ListChannelMessages)
				r.Post("/{id}/messages", messageHandler.SendChannelMessage)
			})
		})
	}

	// Start server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	log.Printf("Starting API server on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
