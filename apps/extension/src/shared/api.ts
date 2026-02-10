import { getTokens, setTokens, clearTokens } from './storage'

const API_BASE = 'http://localhost:8080'

interface ApiError {
  error: string
}

class ApiClient {
  private async refreshAccessToken(): Promise<boolean> {
    const tokens = await getTokens()
    if (!tokens?.refreshToken) return false

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      })

      if (!response.ok) {
        await clearTokens()
        return false
      }

      const data = await response.json()
      await setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      })
      return true
    } catch {
      return false
    }
  }

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const tokens = await getTokens()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`
    }

    let response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    // If 401, try refresh and retry once
    if (response.status === 401 && tokens) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        const newTokens = await getTokens()
        headers['Authorization'] = `Bearer ${newTokens?.accessToken}`
        response = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
        })
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(error.error)
    }

    return response.json() as Promise<{
      access_token: string
      refresh_token: string
      user: { id: string; email: string; display_name: string }
    }>
  }

  async exchangeCode(code: string) {
    return this.fetch<{
      access_token: string
      refresh_token: string
      user: { id: string; email: string; display_name: string }
    }>('/auth/extension/exchange', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  // User
  async me() {
    return this.fetch<{
      id: string
      email: string
      display_name: string
    }>('/me')
  }

  // Focus Sessions
  async startSession() {
    return this.fetch<{
      id: string
      status: string
      started_at: string
    }>('/focus/sessions/start', { method: 'POST' })
  }

  async stopSession() {
    return this.fetch<{
      id: string
      status: string
      ended_at: string
    }>('/focus/sessions/stop', { method: 'POST' })
  }

  async getActiveSession() {
    return this.fetch<{
      session: { id: string; status: string; started_at: string } | null
    }>('/focus/sessions/active')
  }

  // Block Rules
  async listBlockRules() {
    return this.fetch<{
      rules: Array<{
        id: string
        pattern: string
        enabled: boolean
      }>
    }>('/block-rules')
  }
}

export const api = new ApiClient()
