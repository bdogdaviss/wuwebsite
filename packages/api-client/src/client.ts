// Types matching OpenAPI schema
export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  display_name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface ErrorResponse {
  error: string
}

// Focus Session types
export interface FocusSession {
  id: string
  user_id: string
  started_at: string
  ended_at?: string | null
  status: 'active' | 'completed' | 'canceled'
  created_at: string
}

export interface FocusSessionsResponse {
  sessions: FocusSession[]
}

export interface ActiveSessionResponse {
  session: FocusSession | null
}

// Block Rule types
export interface BlockRule {
  id: string
  user_id: string
  pattern: string
  enabled: boolean
  created_at: string
}

export interface CreateBlockRuleRequest {
  pattern: string
}

export interface UpdateBlockRuleRequest {
  pattern?: string
  enabled?: boolean
}

export interface BlockRulesResponse {
  rules: BlockRule[]
}

// File types
export interface File {
  id: string
  user_id: string
  object_key: string
  bucket: string
  filename: string
  content_type?: string | null
  size_bytes?: number | null
  created_at: string
}

export interface PresignRequest {
  filename: string
  content_type?: string
}

export interface PresignResponse {
  upload_url: string
  object_key: string
}

export interface CompleteUploadRequest {
  object_key: string
  filename: string
  content_type?: string
  size_bytes?: number
}

export interface FilesResponse {
  files: File[]
}

export interface DownloadUrlResponse {
  download_url: string
}

// Profile update types
export interface UpdateProfileRequest {
  display_name?: string
  avatar_url?: string
  email?: string
}

// Extension auth types
export interface ExtensionCodeResponse {
  code: string
}

export interface ExtensionExchangeRequest {
  code: string
}

export interface ExtensionExchangeResponse {
  access_token: string
  refresh_token: string
  user: User
}

// Friendship types
export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  user?: User
}

export interface FriendsResponse {
  friends: Friendship[]
}

export interface SendFriendRequestRequest {
  user_id: string
}

// Conversation types
export interface Conversation {
  id: string
  type: 'dm' | 'group'
  name?: string | null
  created_at: string
  members?: User[]
}

export interface ConversationsResponse {
  conversations: Conversation[]
}

export interface CreateDMRequest {
  user_id: string
}

export interface CreateGroupRequest {
  name: string
  member_ids: string[]
}

// Message types
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  updated_at: string
  sender?: User
}

export interface MessagesResponse {
  messages: Message[]
}

export interface SendMessageRequest {
  content: string
}

// Nest types
export interface Nest {
  id: string
  name: string
  icon_url?: string | null
  owner_id: string
  created_at: string
}

export interface NestChannel {
  id: string
  nest_id: string
  name: string
  type: 'text' | 'voice'
  category: string
  position: number
  created_at: string
}

export interface NestMember {
  nest_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: User
}

export interface NestWithChannels extends Nest {
  channels: NestChannel[]
  members: NestMember[]
}

export interface NestsResponse {
  nests: Nest[]
}

export interface CreateNestRequest {
  name: string
}

// Channel message types
export interface ChannelMessage {
  id: string
  channel_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: User
}

export interface ChannelMessagesResponse {
  messages: ChannelMessage[]
}

// Status types
export interface UpdateStatusRequest {
  status: 'online' | 'idle' | 'dnd' | 'offline'
  custom_status?: string
}

export interface OnlineFriendsResponse {
  friends: (User & { status: string })[]
}

// User search types
export interface SearchUsersResponse {
  users: User[]
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    requiresAuth = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (requiresAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const errorData = (await response.json()) as ErrorResponse
        errorMessage = errorData.error
      } catch {
        errorMessage = response.statusText
      }
      throw new ApiError(response.status, errorMessage)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // Health
  async health(): Promise<{ ok: boolean }> {
    return this.request('GET', '/health')
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request('POST', '/auth/register', data)
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('POST', '/auth/login', data)
  }

  async refresh(data: RefreshRequest): Promise<AuthResponse> {
    return this.request('POST', '/auth/refresh', data)
  }

  async logout(data: LogoutRequest): Promise<void> {
    return this.request('POST', '/auth/logout', data)
  }

  // User
  async me(): Promise<User> {
    return this.request('GET', '/me', undefined, true)
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return this.request('PATCH', '/me', data, true)
  }

  async uploadAvatar(file: Blob): Promise<User> {
    const formData = new FormData()
    formData.append('avatar', file)

    const headers: Record<string, string> = {}
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${this.baseUrl}/me/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const errorData = (await response.json()) as ErrorResponse
        errorMessage = errorData.error
      } catch {
        errorMessage = response.statusText
      }
      throw new ApiError(response.status, errorMessage)
    }

    return response.json()
  }

  // Focus Sessions
  async startFocusSession(): Promise<FocusSession> {
    return this.request('POST', '/focus/sessions/start', undefined, true)
  }

  async stopFocusSession(): Promise<FocusSession> {
    return this.request('POST', '/focus/sessions/stop', undefined, true)
  }

  async listFocusSessions(limit = 50): Promise<FocusSessionsResponse> {
    return this.request('GET', `/focus/sessions?limit=${limit}`, undefined, true)
  }

  async getActiveFocusSession(): Promise<ActiveSessionResponse> {
    return this.request('GET', '/focus/sessions/active', undefined, true)
  }

  // Block Rules
  async listBlockRules(): Promise<BlockRulesResponse> {
    return this.request('GET', '/block-rules', undefined, true)
  }

  async createBlockRule(data: CreateBlockRuleRequest): Promise<BlockRule> {
    return this.request('POST', '/block-rules', data, true)
  }

  async updateBlockRule(id: string, data: UpdateBlockRuleRequest): Promise<BlockRule> {
    return this.request('PATCH', `/block-rules/${id}`, data, true)
  }

  async deleteBlockRule(id: string): Promise<void> {
    return this.request('DELETE', `/block-rules/${id}`, undefined, true)
  }

  // Files
  async presignUpload(data: PresignRequest): Promise<PresignResponse> {
    return this.request('POST', '/files/presign', data, true)
  }

  async completeUpload(data: CompleteUploadRequest): Promise<File> {
    return this.request('POST', '/files/complete', data, true)
  }

  async listFiles(): Promise<FilesResponse> {
    return this.request('GET', '/files', undefined, true)
  }

  async getFileDownloadUrl(id: string): Promise<DownloadUrlResponse> {
    return this.request('GET', `/files/${id}/download`, undefined, true)
  }

  async deleteFile(id: string): Promise<void> {
    return this.request('DELETE', `/files/${id}`, undefined, true)
  }

  // Extension Auth
  async extensionCode(): Promise<ExtensionCodeResponse> {
    return this.request('POST', '/auth/extension/code', undefined, true)
  }

  async extensionExchange(data: ExtensionExchangeRequest): Promise<ExtensionExchangeResponse> {
    return this.request('POST', '/auth/extension/exchange', data)
  }

  // Users
  async searchUsers(query: string): Promise<SearchUsersResponse> {
    return this.request('GET', `/users/search?q=${encodeURIComponent(query)}`, undefined, true)
  }

  // Friends
  async listFriends(): Promise<FriendsResponse> {
    return this.request('GET', '/friends', undefined, true)
  }

  async listPendingRequests(): Promise<FriendsResponse> {
    return this.request('GET', '/friends/pending', undefined, true)
  }

  async sendFriendRequest(userId: string): Promise<Friendship> {
    return this.request('POST', '/friends/request', { user_id: userId }, true)
  }

  async acceptFriendRequest(id: string): Promise<Friendship> {
    return this.request('POST', `/friends/${id}/accept`, undefined, true)
  }

  async rejectFriendRequest(id: string): Promise<void> {
    return this.request('POST', `/friends/${id}/reject`, undefined, true)
  }

  async removeFriend(id: string): Promise<void> {
    return this.request('DELETE', `/friends/${id}`, undefined, true)
  }

  async getOnlineFriends(): Promise<OnlineFriendsResponse> {
    return this.request('GET', '/friends/online', undefined, true)
  }

  // Conversations
  async listConversations(): Promise<ConversationsResponse> {
    return this.request('GET', '/conversations', undefined, true)
  }

  async createDM(userId: string): Promise<Conversation> {
    return this.request('POST', '/conversations', { user_id: userId }, true)
  }

  async createGroup(name: string, memberIds: string[]): Promise<Conversation> {
    return this.request('POST', '/conversations/group', { name, member_ids: memberIds }, true)
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request('GET', `/conversations/${id}`, undefined, true)
  }

  // Messages
  async listMessages(conversationId: string, opts?: { before?: string; limit?: number }): Promise<MessagesResponse> {
    const params = new URLSearchParams()
    if (opts?.before) params.set('before', opts.before)
    if (opts?.limit) params.set('limit', String(opts.limit))
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request('GET', `/conversations/${conversationId}/messages${query}`, undefined, true)
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.request('POST', `/conversations/${conversationId}/messages`, { content }, true)
  }

  async listChannelMessages(channelId: string, opts?: { before?: string; limit?: number }): Promise<ChannelMessagesResponse> {
    const params = new URLSearchParams()
    if (opts?.before) params.set('before', opts.before)
    if (opts?.limit) params.set('limit', String(opts.limit))
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request('GET', `/channels/${channelId}/messages${query}`, undefined, true)
  }

  async sendChannelMessage(channelId: string, content: string): Promise<ChannelMessage> {
    return this.request('POST', `/channels/${channelId}/messages`, { content }, true)
  }

  // Nests
  async listNests(): Promise<NestsResponse> {
    return this.request('GET', '/nests', undefined, true)
  }

  async createNest(name: string): Promise<Nest> {
    return this.request('POST', '/nests', { name }, true)
  }

  async getNest(id: string): Promise<NestWithChannels> {
    return this.request('GET', `/nests/${id}`, undefined, true)
  }

  async joinNest(id: string): Promise<void> {
    return this.request('POST', `/nests/${id}/join`, undefined, true)
  }

  async leaveNest(id: string): Promise<void> {
    return this.request('POST', `/nests/${id}/leave`, undefined, true)
  }

  // Status
  async updateStatus(status: 'online' | 'idle' | 'dnd' | 'offline'): Promise<User> {
    return this.request('PATCH', '/me/status', { status }, true)
  }
}

export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl)
}
