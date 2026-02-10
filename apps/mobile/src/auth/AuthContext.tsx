import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { useRouter, useSegments } from 'expo-router'
import type { User } from '@wakeup/api-client'
import { WakeupSocket } from '@wakeup/api-client'
import { api, API_URL } from '../api/client'
import { getTokens, clearTokens } from './tokenStore'

const WS_URL = API_URL.replace('http', 'ws') + '/ws'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  socket: WakeupSocket | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [socket, setSocket] = useState<WakeupSocket | null>(null)
  const wsInstanceRef = useRef<WakeupSocket | null>(null)
  const segments = useSegments()
  const router = useRouter()

  const connectWebSocket = useCallback((token: string) => {
    if (wsInstanceRef.current) {
      wsInstanceRef.current.disconnect()
    }
    const ws = new WakeupSocket()
    wsInstanceRef.current = ws
    ws.connect(WS_URL, token)
    setSocket(ws)
  }, [])

  const disconnectWebSocket = useCallback(() => {
    if (wsInstanceRef.current) {
      wsInstanceRef.current.disconnect()
      wsInstanceRef.current = null
    }
    setSocket(null)
  }, [])

  // Load user on mount
  useEffect(() => {
    loadUser()
    return () => disconnectWebSocket()
  }, [])

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === 'login'

    if (!user && !inAuthGroup) {
      router.replace('/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [user, segments, isLoading])

  async function loadUser() {
    try {
      const tokens = await getTokens()
      if (tokens) {
        const userData = await api.me()
        setUser(userData)
        connectWebSocket(tokens.accessToken)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      await clearTokens()
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await api.login(email, password)
    setUser(response.user)
    const tokens = await getTokens()
    if (tokens) {
      connectWebSocket(tokens.accessToken)
    }
  }

  async function register(email: string, password: string, displayName: string) {
    const response = await api.register(email, password, displayName)
    setUser(response.user)
    const tokens = await getTokens()
    if (tokens) {
      connectWebSocket(tokens.accessToken)
    }
  }

  async function logout() {
    disconnectWebSocket()
    await api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        socket,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
