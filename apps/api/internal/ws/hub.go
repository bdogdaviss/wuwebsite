package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"wakeup/api/internal/auth"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (CORS handled at HTTP level)
	},
}

// Event types sent over WebSocket
type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// Client represents a single WebSocket connection
type Client struct {
	UserID uuid.UUID
	Conn   *websocket.Conn
	Send   chan []byte
}

// Hub manages all active WebSocket connections
type Hub struct {
	mu         sync.RWMutex
	clients    map[uuid.UUID]map[*Client]bool // userID -> set of clients
	register   chan *Client
	unregister chan *Client
	broadcast  chan *BroadcastMessage
}

// BroadcastMessage targets specific users
type BroadcastMessage struct {
	UserIDs []uuid.UUID
	Event   Event
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uuid.UUID]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *BroadcastMessage, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.UserID] == nil {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("WebSocket: user %s connected", client.UserID)

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.UserID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.clients, client.UserID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("WebSocket: user %s disconnected", client.UserID)

		case msg := <-h.broadcast:
			data, err := json.Marshal(msg.Event)
			if err != nil {
				continue
			}
			h.mu.RLock()
			for _, userID := range msg.UserIDs {
				if clients, ok := h.clients[userID]; ok {
					for client := range clients {
						select {
						case client.Send <- data:
						default:
							// Client buffer full, drop message
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends an event to specific users
func (h *Hub) Broadcast(userIDs []uuid.UUID, event Event) {
	h.broadcast <- &BroadcastMessage{
		UserIDs: userIDs,
		Event:   event,
	}
}

// IsOnline checks if a user has active connections
func (h *Hub) IsOnline(userID uuid.UUID) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	clients, ok := h.clients[userID]
	return ok && len(clients) > 0
}

// WSHandler handles WebSocket upgrade requests
type WSHandler struct {
	hub       *Hub
	jwtSecret string
}

func NewWSHandler(hub *Hub, jwtSecret string) *WSHandler {
	return &WSHandler{hub: hub, jwtSecret: jwtSecret}
}

func (h *WSHandler) Connect(w http.ResponseWriter, r *http.Request) {
	// Auth via query param (WebSocket can't send custom headers)
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateAccessToken(token, h.jwtSecret)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		UserID: claims.UserID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	h.hub.register <- client

	go h.writePump(client)
	go h.readPump(client)
}

func (h *WSHandler) writePump(client *Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *WSHandler) readPump(client *Client) {
	defer func() {
		h.hub.unregister <- client
		client.Conn.Close()
	}()

	client.Conn.SetReadLimit(4096)
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}
		// Future: handle client-sent events (typing indicators, etc.)
	}
}
