import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { createApiClient, WakeupSocket, type User, type ApiClient, type Message, type ChannelMessage } from '@wakeup/api-client'
import { useSocialStore } from '../state/socialStore'
import { useMessageStore } from '../state/messageStore'
import { useNestStore } from '../state/nestStore'
import { useUIStore } from '../state/uiStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace('http', 'ws') + '/ws'
const DEV_MOCK = import.meta.env.VITE_DEV_MOCK === 'true'

const MOCK_USER: User = {
  id: 'dev-mock-user-001',
  email: 'dev@wakeup.test',
  display_name: 'Dev Tester',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  api: ApiClient
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'wakeup_access_token'
const REFRESH_KEY = 'wakeup_refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_MOCK ? MOCK_USER : null)
  const [isLoading, setIsLoading] = useState(DEV_MOCK ? false : true)
  const [api] = useState(() => createApiClient(API_URL))
  const wsRef = useRef<WakeupSocket | null>(null)

  // In dev mock mode, mark YouWake as completed so we skip that screen
  if (DEV_MOCK && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('wakeup-you-wake-done', '1')
  }

  const initSocialData = useCallback(async () => {
    if (DEV_MOCK) return // Skip API calls in mock mode
    const { fetchFriends, fetchPending, fetchOnlineFriends } = useSocialStore.getState()
    const { fetchConversations } = useMessageStore.getState()
    const { fetchNests } = useNestStore.getState()

    // Fetch all initial data in parallel
    await Promise.allSettled([
      fetchFriends(api),
      fetchPending(api),
      fetchOnlineFriends(api),
      fetchConversations(api),
      fetchNests(api),
    ])
  }, [api])

  const connectWebSocket = useCallback((token: string) => {
    if (wsRef.current) {
      wsRef.current.disconnect()
    }

    const ws = new WakeupSocket()
    wsRef.current = ws

    ws.on('message.new', (data) => {
      const message = data as Message
      useMessageStore.getState().addIncomingMessage(message)

      // Increment unread if message is not from current user and conversation is not currently open
      const currentUserId = user?.id
      const currentPath = window.location.pathname
      const isCurrentConversation = currentPath === `/dm/${message.conversation_id}`

      if (message.sender_id !== currentUserId && !isCurrentConversation) {
        useUIStore.getState().incrementUnread('conversation', message.conversation_id)
      }
    })

    ws.on('channel_message.new', (data) => {
      const message = data as ChannelMessage
      useMessageStore.getState().addIncomingChannelMessage(message)

      // Increment unread if message is not from current user and channel is not currently open
      const currentUserId = user?.id
      const currentPath = window.location.pathname
      const isCurrentChannel = currentPath.includes(`/${message.channel_id}`)

      if (message.sender_id !== currentUserId && !isCurrentChannel) {
        useUIStore.getState().incrementUnread('channel', message.channel_id)
      }
    })

    ws.on('friend.request', () => {
      useSocialStore.getState().fetchPending(api)
    })

    ws.on('friend.accepted', () => {
      useSocialStore.getState().fetchFriends(api)
      useSocialStore.getState().fetchPending(api)
      useSocialStore.getState().fetchOnlineFriends(api)
    })

    ws.on('status.update', (data: any) => {
      // Real-time status update
      const { user_id, status } = data
      useSocialStore.getState().updateFriendStatus(user_id, status)
      // Also refresh online friends to ensure consistency
      useSocialStore.getState().fetchOnlineFriends(api)
    })

    ws.connect(WS_URL, token)
  }, [api])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }
  }, [])

  const loadUser = useCallback(async () => {
    if (DEV_MOCK) return // Already set mock user in state init

    const accessToken = localStorage.getItem(TOKEN_KEY)
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    api.setAccessToken(accessToken)
    try {
      const userData = await api.me()
      setUser(userData)
      connectWebSocket(accessToken)
      initSocialData()
    } catch {
      // Token invalid, try refresh
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (refreshToken) {
        try {
          const response = await api.refresh({ refresh_token: refreshToken })
          localStorage.setItem(TOKEN_KEY, response.access_token)
          localStorage.setItem(REFRESH_KEY, response.refresh_token)
          api.setAccessToken(response.access_token)
          setUser(response.user)
          connectWebSocket(response.access_token)
          initSocialData()
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_KEY)
          api.setAccessToken(null)
        }
      }
    }
    setIsLoading(false)
  }, [api, connectWebSocket, initSocialData])

  useEffect(() => {
    loadUser()
    return () => disconnectWebSocket()
  }, [loadUser, disconnectWebSocket])

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password })
    localStorage.setItem(TOKEN_KEY, response.access_token)
    localStorage.setItem(REFRESH_KEY, response.refresh_token)
    api.setAccessToken(response.access_token)
    setUser(response.user)
    connectWebSocket(response.access_token)
    initSocialData()
  }

  const register = async (email: string, password: string, displayName: string) => {
    const response = await api.register({ email, password, display_name: displayName })
    localStorage.setItem(TOKEN_KEY, response.access_token)
    localStorage.setItem(REFRESH_KEY, response.refresh_token)
    api.setAccessToken(response.access_token)
    setUser(response.user)
    connectWebSocket(response.access_token)
    initSocialData()
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (refreshToken) {
      try {
        await api.logout({ refresh_token: refreshToken })
      } catch {
        // Ignore logout errors
      }
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    api.setAccessToken(null)
    setUser(null)
    disconnectWebSocket()
    useSocialStore.getState().clear()
    useMessageStore.getState().clear()
    useNestStore.getState().clear()
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
