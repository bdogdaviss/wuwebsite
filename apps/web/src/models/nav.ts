export interface NestChannel {
  id: string
  name: string
  type: 'text' | 'voice'
  category: string
}

export interface Nest {
  id: string
  name: string
  icon: string
  notifications?: number
  channels: NestChannel[]
}

export interface NavItem {
  id: string
  label: string
  route: string
  icon?: string
}

export interface DmConversation {
  id: string
  name: string
  subtitle: string
  avatarColor: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  isGroup?: boolean
  memberCount?: number
}

export interface NightOwl {
  id: string
  name: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  activity: string
  timezone?: string
  avatarUrl?: string
  interests?: string[]
  sleepSchedule?: string
}

export interface MatchSuggestion {
  owl: NightOwl
  compatibility: number
  reasons: string[]
  mutualInterests: string[]
}

export type FriendsTab = 'online' | 'all' | 'pending' | 'add'

export interface MockMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

export interface InboxNotification {
  id: string
  type: 'friend_accepted' | 'new_message' | 'mention' | 'server_message'
  title: string
  description: string
  avatarColor: string
  timeAgo: string
  read: boolean
}

export type NavKey = 'friends' | 'discover' | 'rituals' | 'settings'
