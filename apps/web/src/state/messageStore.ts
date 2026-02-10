import { create } from 'zustand'
import type { ApiClient, Conversation, Message, ChannelMessage } from '@wakeup/api-client'

interface MessageState {
  conversations: Conversation[]
  messages: Record<string, Message[]>           // conversationId -> messages
  channelMessages: Record<string, ChannelMessage[]> // channelId -> messages
  isLoading: boolean

  fetchConversations: (api: ApiClient) => Promise<void>
  fetchMessages: (api: ApiClient, conversationId: string) => Promise<void>
  fetchChannelMessages: (api: ApiClient, channelId: string) => Promise<void>
  sendMessage: (api: ApiClient, conversationId: string, content: string) => Promise<void>
  sendChannelMessage: (api: ApiClient, channelId: string, content: string) => Promise<void>
  createDM: (api: ApiClient, userId: string) => Promise<Conversation>
  createGroup: (api: ApiClient, name: string, memberIds: string[]) => Promise<Conversation>
  addIncomingMessage: (message: Message) => void
  addIncomingChannelMessage: (message: ChannelMessage) => void
  clear: () => void
}

export const useMessageStore = create<MessageState>()((set, get) => ({
  conversations: [],
  messages: {},
  channelMessages: {},
  isLoading: false,

  fetchConversations: async (api) => {
    set({ isLoading: true })
    try {
      const res = await api.listConversations()
      set({ conversations: res.conversations, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchMessages: async (api, conversationId) => {
    try {
      const res = await api.listMessages(conversationId)
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: res.messages.reverse(), // API returns newest first, we want oldest first
        },
      }))
    } catch {
      // ignore
    }
  },

  fetchChannelMessages: async (api, channelId) => {
    try {
      const res = await api.listChannelMessages(channelId)
      set((state) => ({
        channelMessages: {
          ...state.channelMessages,
          [channelId]: res.messages.reverse(),
        },
      }))
    } catch {
      // ignore
    }
  },

  sendMessage: async (api, conversationId, content) => {
    const msg = await api.sendMessage(conversationId, content)
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), msg],
      },
    }))
  },

  sendChannelMessage: async (api, channelId, content) => {
    const msg = await api.sendChannelMessage(channelId, content)
    set((state) => ({
      channelMessages: {
        ...state.channelMessages,
        [channelId]: [...(state.channelMessages[channelId] || []), msg],
      },
    }))
  },

  createDM: async (api, userId) => {
    const conv = await api.createDM(userId)
    get().fetchConversations(api)
    return conv
  },

  createGroup: async (api, name, memberIds) => {
    const conv = await api.createGroup(name, memberIds)
    get().fetchConversations(api)
    return conv
  },

  addIncomingMessage: (message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversation_id]: [...(state.messages[message.conversation_id] || []), message],
      },
    }))
  },

  addIncomingChannelMessage: (message) => {
    set((state) => ({
      channelMessages: {
        ...state.channelMessages,
        [message.channel_id]: [...(state.channelMessages[message.channel_id] || []), message],
      },
    }))
  },

  clear: () => set({ conversations: [], messages: {}, channelMessages: {} }),
}))
