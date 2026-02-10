import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NavKey, FriendsTab, NightOwl, DmConversation, MockMessage } from '../models/nav'

type InboxTab = 'foryou' | 'unreads' | 'mentions'

interface UIState {
  activeNestId: string
  activeChannelId: string | null
  activeNavKey: NavKey
  friendsTab: FriendsTab
  pendingRequests: NightOwl[]
  isInfoPanelOpen: boolean
  isInboxOpen: boolean
  inboxTab: InboxTab
  isCommandPaletteOpen: boolean
  isMuted: boolean
  isDeafened: boolean
  hiddenDmIds: string[]
  customDms: DmConversation[]
  isCreateGroupOpen: boolean
  isSettingsOpen: boolean
  sidebarWidth: number
  infoPanelWidth: number
  customMessages: Record<string, MockMessage[]>
  bannerColor: string
  removedFriendIds: string[]
  userStatus: 'online' | 'idle' | 'dnd' | 'offline'

  setActiveNest: (id: string) => void
  setActiveChannel: (id: string | null) => void
  setActiveNavKey: (key: NavKey) => void
  setFriendsTab: (tab: FriendsTab) => void
  addPendingRequest: (owl: NightOwl) => void
  toggleInfoPanel: () => void
  setInfoPanelOpen: (open: boolean) => void
  toggleInbox: () => void
  setInboxTab: (tab: InboxTab) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleMute: () => void
  toggleDeafen: () => void
  hideDm: (id: string) => void
  unhideDm: (id: string) => void
  addCustomDm: (dm: DmConversation) => void
  openCreateGroup: () => void
  closeCreateGroup: () => void
  openSettings: () => void
  closeSettings: () => void
  setSidebarWidth: (width: number) => void
  setInfoPanelWidth: (width: number) => void
  addMessage: (dmId: string, message: MockMessage) => void
  setBannerColor: (color: string) => void
  removeFriend: (id: string) => void
  setUserStatus: (status: 'online' | 'idle' | 'dnd' | 'offline') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeNestId: 'home',
      activeChannelId: null,
      activeNavKey: 'overview',
      friendsTab: 'online' as FriendsTab,
      pendingRequests: [] as NightOwl[],
      isInfoPanelOpen: false,
      isInboxOpen: false,
      inboxTab: 'foryou' as InboxTab,
      isCommandPaletteOpen: false,
      isMuted: false,
      isDeafened: false,
      hiddenDmIds: [] as string[],
      customDms: [] as DmConversation[],
      isCreateGroupOpen: false,
      isSettingsOpen: false,
      sidebarWidth: 240,
      infoPanelWidth: 320,
      customMessages: {} as Record<string, MockMessage[]>,
      bannerColor: '#5865f2',
      removedFriendIds: [] as string[],
      userStatus: 'online' as 'online' | 'idle' | 'dnd' | 'offline',

      setActiveNest: (id) => set({ activeNestId: id, activeChannelId: null }),
      setActiveChannel: (id) => set({ activeChannelId: id }),
      setActiveNavKey: (key) => set({ activeNavKey: key }),
      setFriendsTab: (tab) => set({ friendsTab: tab }),
      addPendingRequest: (owl) =>
        set((state) => ({
          pendingRequests: state.pendingRequests.some((r) => r.id === owl.id)
            ? state.pendingRequests
            : [...state.pendingRequests, owl],
        })),
      toggleInfoPanel: () => set((state) => ({ isInfoPanelOpen: !state.isInfoPanelOpen })),
      setInfoPanelOpen: (open) => set({ isInfoPanelOpen: open }),
      toggleInbox: () => set((state) => ({ isInboxOpen: !state.isInboxOpen })),
      setInboxTab: (tab) => set({ inboxTab: tab }),
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleDeafen: () => set((state) => ({
        isDeafened: !state.isDeafened,
        // Deafening also mutes
        isMuted: !state.isDeafened ? true : state.isMuted,
      })),
      hideDm: (id) => set((state) => ({
        hiddenDmIds: state.hiddenDmIds.includes(id)
          ? state.hiddenDmIds
          : [...state.hiddenDmIds, id],
      })),
      unhideDm: (id) => set((state) => ({
        hiddenDmIds: state.hiddenDmIds.filter((dmId) => dmId !== id),
      })),
      addCustomDm: (dm) => set((state) => ({
        customDms: [...state.customDms, dm],
      })),
      openCreateGroup: () => set({ isCreateGroupOpen: true }),
      closeCreateGroup: () => set({ isCreateGroupOpen: false }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setInfoPanelWidth: (width) => set({ infoPanelWidth: width }),
      setBannerColor: (color) => set({ bannerColor: color }),
      addMessage: (dmId, message) => set((state) => ({
        customMessages: {
          ...state.customMessages,
          [dmId]: [...(state.customMessages[dmId] || []), message],
        },
      })),
      removeFriend: (id) => set((state) => ({
        removedFriendIds: state.removedFriendIds.includes(id)
          ? state.removedFriendIds
          : [...state.removedFriendIds, id],
      })),
      setUserStatus: (status) => set({ userStatus: status }),
    }),
    {
      name: 'wakeup-ui-state',
      partialize: (state) => ({
        activeNestId: state.activeNestId,
        activeChannelId: state.activeChannelId,
        activeNavKey: state.activeNavKey,
        pendingRequests: state.pendingRequests,
        isInfoPanelOpen: state.isInfoPanelOpen,
        isMuted: state.isMuted,
        isDeafened: state.isDeafened,
        hiddenDmIds: state.hiddenDmIds,
        customDms: state.customDms,
        customMessages: state.customMessages,
        bannerColor: state.bannerColor,
        removedFriendIds: state.removedFriendIds,
        sidebarWidth: state.sidebarWidth,
        infoPanelWidth: state.infoPanelWidth,
        userStatus: state.userStatus,
      }),
    }
  )
)
