import { create } from 'zustand'
import type { ApiClient, Friendship, User } from '@wakeup/api-client'

interface SocialState {
  friends: Friendship[]
  pendingRequests: Friendship[]
  onlineFriends: (User & { status: string })[]
  isLoading: boolean

  fetchFriends: (api: ApiClient) => Promise<void>
  fetchPending: (api: ApiClient) => Promise<void>
  fetchOnlineFriends: (api: ApiClient) => Promise<void>
  updateFriendStatus: (userId: string, status: string) => void
  sendRequest: (api: ApiClient, userId: string) => Promise<void>
  acceptRequest: (api: ApiClient, id: string) => Promise<void>
  rejectRequest: (api: ApiClient, id: string) => Promise<void>
  removeFriend: (api: ApiClient, id: string) => Promise<void>
  clear: () => void
}

export const useSocialStore = create<SocialState>()((set, get) => ({
  friends: [],
  pendingRequests: [],
  onlineFriends: [],
  isLoading: false,

  fetchFriends: async (api) => {
    set({ isLoading: true })
    try {
      const res = await api.listFriends()
      set({ friends: res.friends, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchPending: async (api) => {
    try {
      const res = await api.listPendingRequests()
      set({ pendingRequests: res.friends })
    } catch {
      // ignore
    }
  },

  fetchOnlineFriends: async (api) => {
    try {
      const res = await api.getOnlineFriends()
      set({ onlineFriends: res.friends })
    } catch {
      // ignore
    }
  },

  updateFriendStatus: (userId, status) => {
    set((state) => {
      // Update online friends list
      const updatedOnlineFriends = state.onlineFriends.map((friend) =>
        friend.id === userId ? { ...friend, status } : friend
      )
      // Filter out offline friends from the online list
      const filteredOnlineFriends = updatedOnlineFriends.filter((f) => f.status !== 'offline')

      return { onlineFriends: filteredOnlineFriends }
    })
  },

  sendRequest: async (api, userId) => {
    await api.sendFriendRequest(userId)
    // Refresh lists
    get().fetchFriends(api)
    get().fetchPending(api)
  },

  acceptRequest: async (api, id) => {
    await api.acceptFriendRequest(id)
    get().fetchFriends(api)
    get().fetchPending(api)
  },

  rejectRequest: async (api, id) => {
    await api.rejectFriendRequest(id)
    get().fetchPending(api)
  },

  removeFriend: async (api, id) => {
    await api.removeFriend(id)
    get().fetchFriends(api)
  },

  clear: () => set({ friends: [], pendingRequests: [], onlineFriends: [] }),
}))
