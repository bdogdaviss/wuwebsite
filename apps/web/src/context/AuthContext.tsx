import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { createApiClient, WakeupSocket, type User, type ApiClient, type Message, type ChannelMessage } from '@wakeup/api-client'
import { useSocialStore } from '../state/socialStore'
import { useMessageStore } from '../state/messageStore'
import { useNestStore } from '../state/nestStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace('http', 'ws') + '/ws'

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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [api] = useState(() => createApiClient(API_URL))
  const wsRef = useRef<WakeupSocket | null>(null)

  const initSocialData = useCallback(async () => {
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
      useMessageStore.getState().addIncomingMessage(data as Message)
    })

    ws.on('channel_message.new', (data) => {
      useMessageStore.getState().addIncomingChannelMessage(data as ChannelMessage)
    })

    ws.on('friend.request', () => {
      useSocialStore.getState().fetchPending(api)
    })

    ws.on('friend.accepted', () => {
      useSocialStore.getState().fetchFriends(api)
      useSocialStore.getState().fetchPending(api)
      useSocialStore.getState().fetchOnlineFriends(api)
    })

    ws.on('status.update', () => {
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
