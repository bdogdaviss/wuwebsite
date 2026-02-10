import { ApiClient, createApiClient } from '@wakeup/api-client'
import type { AuthResponse } from '@wakeup/api-client'
import { getTokens, setTokens, clearTokens } from '../auth/tokenStore'

// API URL - configurable via environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'

// Create the shared ApiClient instance
const apiClient = createApiClient(API_BASE_URL)

/**
 * Mobile-specific wrapper that adds SecureStore-based token management
 * and automatic token refresh on 401 responses.
 */
class MobileApiWrapper {
  private client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  /** Ensure the access token from SecureStore is set on the client */
  private async ensureToken(): Promise<void> {
    const tokens = await getTokens()
    if (tokens?.accessToken) {
      this.client.setAccessToken(tokens.accessToken)
    }
  }

  /** Attempt to refresh the access token using the stored refresh token */
  private async refreshAccessToken(): Promise<boolean> {
    const tokens = await getTokens()
    if (!tokens?.refreshToken) return false

    try {
      const response = await this.client.refresh({ refresh_token: tokens.refreshToken })
      await setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      })
      this.client.setAccessToken(response.access_token)
      return true
    } catch {
      await clearTokens()
      return false
    }
  }

  /** Execute an API call with automatic token loading and refresh on 401 */
  async withAuth<T>(fn: (client: ApiClient) => Promise<T>): Promise<T> {
    await this.ensureToken()
    try {
      return await fn(this.client)
    } catch (error: any) {
      if (error?.status === 401) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return await fn(this.client)
        }
      }
      throw error
    }
  }

  // Auth methods (no withAuth needed — these set tokens themselves)
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.login({ email, password })
    await setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })
    this.client.setAccessToken(response.access_token)
    return response
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const response = await this.client.register({ email, password, display_name: displayName })
    await setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })
    this.client.setAccessToken(response.access_token)
    return response
  }

  async logout(): Promise<void> {
    const tokens = await getTokens()
    if (tokens?.refreshToken) {
      try {
        await this.client.logout({ refresh_token: tokens.refreshToken })
      } catch {
        // ignore logout API errors
      }
    }
    await clearTokens()
    this.client.setAccessToken(null)
  }

  // Convenience wrappers for commonly used endpoints
  me() { return this.withAuth((c) => c.me()) }
  startFocusSession() { return this.withAuth((c) => c.startFocusSession()) }
  stopFocusSession() { return this.withAuth((c) => c.stopFocusSession()) }
  listFocusSessions(limit = 10) { return this.withAuth((c) => c.listFocusSessions(limit)) }
  getActiveFocusSession() { return this.withAuth((c) => c.getActiveFocusSession()) }

  // Social
  listFriends() { return this.withAuth((c) => c.listFriends()) }
  listPendingRequests() { return this.withAuth((c) => c.listPendingRequests()) }
  sendFriendRequest(userId: string) { return this.withAuth((c) => c.sendFriendRequest(userId)) }
  acceptFriendRequest(id: string) { return this.withAuth((c) => c.acceptFriendRequest(id)) }
  rejectFriendRequest(id: string) { return this.withAuth((c) => c.rejectFriendRequest(id)) }
  removeFriend(id: string) { return this.withAuth((c) => c.removeFriend(id)) }
  getOnlineFriends() { return this.withAuth((c) => c.getOnlineFriends()) }

  // Conversations
  listConversations() { return this.withAuth((c) => c.listConversations()) }
  createDM(userId: string) { return this.withAuth((c) => c.createDM(userId)) }
  createGroup(name: string, memberIds: string[]) { return this.withAuth((c) => c.createGroup(name, memberIds)) }
  getConversation(id: string) { return this.withAuth((c) => c.getConversation(id)) }

  // Messages
  listMessages(convId: string, opts?: { before?: string; limit?: number }) {
    return this.withAuth((c) => c.listMessages(convId, opts))
  }
  sendMessage(convId: string, content: string) { return this.withAuth((c) => c.sendMessage(convId, content)) }
  listChannelMessages(channelId: string, opts?: { before?: string; limit?: number }) {
    return this.withAuth((c) => c.listChannelMessages(channelId, opts))
  }
  sendChannelMessage(channelId: string, content: string) {
    return this.withAuth((c) => c.sendChannelMessage(channelId, content))
  }

  // Nests
  listNests() { return this.withAuth((c) => c.listNests()) }
  createNest(name: string) { return this.withAuth((c) => c.createNest(name)) }
  getNest(id: string) { return this.withAuth((c) => c.getNest(id)) }
  joinNest(id: string) { return this.withAuth((c) => c.joinNest(id)) }
  leaveNest(id: string) { return this.withAuth((c) => c.leaveNest(id)) }

  // Status
  updateStatus(status: 'online' | 'idle' | 'dnd' | 'offline') {
    return this.withAuth((c) => c.updateStatus(status))
  }

  /** Get the underlying ApiClient (e.g. for WebSocket token) */
  get rawClient(): ApiClient { return this.client }
}

export const api = new MobileApiWrapper(apiClient)
export const API_URL = API_BASE_URL
