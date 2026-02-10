import { create } from 'zustand'
import type { ApiClient, Nest, NestWithChannels } from '@wakeup/api-client'

interface NestState {
  nests: Nest[]
  nestDetails: Record<string, NestWithChannels>  // nestId -> full details
  isLoading: boolean

  fetchNests: (api: ApiClient) => Promise<void>
  fetchNest: (api: ApiClient, id: string) => Promise<void>
  createNest: (api: ApiClient, name: string) => Promise<Nest>
  joinNest: (api: ApiClient, id: string) => Promise<void>
  leaveNest: (api: ApiClient, id: string) => Promise<void>
  clear: () => void
}

export const useNestStore = create<NestState>()((set, get) => ({
  nests: [],
  nestDetails: {},
  isLoading: false,

  fetchNests: async (api) => {
    set({ isLoading: true })
    try {
      const res = await api.listNests()
      set({ nests: res.nests, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchNest: async (api, id) => {
    try {
      const nest = await api.getNest(id)
      set((state) => ({
        nestDetails: { ...state.nestDetails, [id]: nest },
      }))
    } catch {
      // ignore
    }
  },

  createNest: async (api, name) => {
    const nest = await api.createNest(name)
    get().fetchNests(api)
    return nest
  },

  joinNest: async (api, id) => {
    await api.joinNest(id)
    get().fetchNests(api)
  },

  leaveNest: async (api, id) => {
    await api.leaveNest(id)
    get().fetchNests(api)
  },

  clear: () => set({ nests: [], nestDetails: {} }),
}))
