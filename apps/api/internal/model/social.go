package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Friendships ─────────────────────────────────────────────

type Friendship struct {
	ID          uuid.UUID `json:"id"`
	RequesterID uuid.UUID `json:"requester_id"`
	AddresseeID uuid.UUID `json:"addressee_id"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type FriendshipWithProfile struct {
	Friendship
	User *Profile `json:"user"`
}

type SendFriendRequestRequest struct {
	UserID string `json:"user_id"`
}

type FriendsResponse struct {
	Friends []FriendshipWithProfile `json:"friends"`
}

// ─── Conversations ───────────────────────────────────────────

type Conversation struct {
	ID        uuid.UUID  `json:"id"`
	Type      string     `json:"type"`
	Name      *string    `json:"name,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	Members   []Profile  `json:"members,omitempty"`
}

type ConversationMember struct {
	ConversationID uuid.UUID `json:"conversation_id"`
	UserID         uuid.UUID `json:"user_id"`
	JoinedAt       time.Time `json:"joined_at"`
}

type CreateDMRequest struct {
	UserID string `json:"user_id"`
}

type CreateGroupRequest struct {
	Name      string   `json:"name"`
	MemberIDs []string `json:"member_ids"`
}

type ConversationsResponse struct {
	Conversations []Conversation `json:"conversations"`
}

// ─── Messages ────────────────────────────────────────────────

type Message struct {
	ID             uuid.UUID `json:"id"`
	ConversationID uuid.UUID `json:"conversation_id"`
	SenderID       uuid.UUID `json:"sender_id"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Sender         *Profile  `json:"sender,omitempty"`
}

type SendMessageRequest struct {
	Content string `json:"content"`
}

type MessagesResponse struct {
	Messages []Message `json:"messages"`
}

// ─── Nests ───────────────────────────────────────────────────

type Nest struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	IconURL   *string   `json:"icon_url,omitempty"`
	OwnerID   uuid.UUID `json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
}

type NestChannel struct {
	ID        uuid.UUID `json:"id"`
	NestID    uuid.UUID `json:"nest_id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Category  string    `json:"category"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}

type NestMember struct {
	NestID   uuid.UUID `json:"nest_id"`
	UserID   uuid.UUID `json:"user_id"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
	User     *Profile  `json:"user,omitempty"`
}

type NestWithChannels struct {
	Nest
	Channels []NestChannel `json:"channels"`
	Members  []NestMember  `json:"members"`
}

type ChannelMessage struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channel_id"`
	SenderID  uuid.UUID `json:"sender_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	Sender    *Profile  `json:"sender,omitempty"`
}

type CreateNestRequest struct {
	Name string `json:"name"`
}

type CreateChannelRequest struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Category string `json:"category"`
}

type NestsResponse struct {
	Nests []Nest `json:"nests"`
}

type ChannelMessagesResponse struct {
	Messages []ChannelMessage `json:"messages"`
}

// ─── Users ──────────────────────────────────────────────────

type SearchUsersResponse struct {
	Users []Profile `json:"users"`
}

// ─── Status ──────────────────────────────────────────────────

type UpdateStatusRequest struct {
	Status       string  `json:"status"`
	CustomStatus *string `json:"custom_status,omitempty"`
}
