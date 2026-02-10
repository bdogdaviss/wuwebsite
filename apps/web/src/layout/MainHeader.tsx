import { useLocation } from 'react-router-dom'
import { discordColors } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useMessageStore } from '../state/messageStore'
import { useNestStore } from '../state/nestStore'
import { useAuth } from '../context/AuthContext'
import { InboxPanel } from '../components/InboxPanel'
import type { FriendsTab } from '../models/nav'
import {
  Users,
  Compass,
  Moon,
  Search,
  Inbox,
  HelpCircle,
  AtSign,
  Phone,
  Video,
  Pin,
  UserPlus,
  UserCircle,
  Hash,
} from 'lucide-react'

const routeIcons: Record<string, React.ReactNode> = {
  '/': <Users size={20} color={discordColors.interactiveNormal} />,
  '/discover': <Compass size={20} color={discordColors.interactiveNormal} />,
  '/rituals': <Moon size={20} color={discordColors.interactiveNormal} />,
}

const routeTitles: Record<string, string> = {
  '/': 'Friends',
  '/discover': 'Discover',
  '/rituals': 'Rituals',
}

const friendsTabs: { key: FriendsTab; label: string }[] = [
  { key: 'online', label: 'Online' },
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
]

export function MainHeader() {
  const location = useLocation()
  const { toggleInfoPanel, isInfoPanelOpen, toggleInbox, isInboxOpen, friendsTab: activeTab, setFriendsTab: setActiveTab, openCommandPalette } = useUIStore()
  const { conversations } = useMessageStore()
  const { nestDetails } = useNestStore()
  const { user } = useAuth()

  const isDmPage = location.pathname.startsWith('/dm/')
  const isNestChannel = location.pathname.startsWith('/nest/')
  const dmId = isDmPage ? location.pathname.split('/dm/')[1] : null
  const conv = dmId ? conversations.find((c) => c.id === dmId) : null
  const otherMembers = conv?.members?.filter((m) => m.id !== user?.id) || []
  const dm = conv ? {
    name: conv.type === 'group'
      ? (conv.name || otherMembers.map((m) => m.display_name).join(', ') || 'Group')
      : (otherMembers[0]?.display_name || 'Unknown'),
    subtitle: conv.type === 'group' ? `${conv.members?.length || 0} Members` : '',
    isGroup: conv.type === 'group',
  } : null

  // Nest channel info
  const nestPathParts = isNestChannel ? location.pathname.split('/') : []
  const nestId = nestPathParts[2]
  const channelId = nestPathParts[3]
  const nest = nestId ? nestDetails[nestId] : null
  const channel = nest && channelId ? nest.channels.find((c) => c.id === channelId) : null

  const currentIcon = routeIcons[location.pathname] || routeIcons['/']
  const currentTitle = routeTitles[location.pathname] || 'Friends'
  const isFriendsPage = location.pathname === '/'

  if (isNestChannel && channel) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1,
          height: '100%',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hash size={20} color={discordColors.interactiveNormal} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: discordColors.headerPrimary,
            }}
          >
            {channel.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <HeaderAction onClick={openCommandPalette}>
            <Search size={20} color={discordColors.interactiveNormal} />
          </HeaderAction>
          <div style={{ position: 'relative' }}>
            <HeaderAction onClick={toggleInbox}>
              <Inbox size={20} color={isInboxOpen ? discordColors.interactiveActive : discordColors.interactiveNormal} />
            </HeaderAction>
            <InboxPanel />
          </div>
          <HeaderAction onClick={toggleInfoPanel}>
            <Users
              size={20}
              color={isInfoPanelOpen ? discordColors.interactiveActive : discordColors.interactiveNormal}
            />
          </HeaderAction>
        </div>
      </div>
    )
  }

  if (isDmPage && dm) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1,
          height: '100%',
          padding: '0 8px',
        }}
      >
        {/* Left: @ icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AtSign size={20} color={discordColors.interactiveNormal} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: discordColors.headerPrimary,
            }}
          >
            {dm.name}
          </span>
          {dm.subtitle && (
            <span style={{ fontSize: 13, color: discordColors.textMuted }}>
              {dm.subtitle}
            </span>
          )}
        </div>

        {/* Right: DM action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <HeaderAction><Phone size={20} color={discordColors.interactiveNormal} /></HeaderAction>
          <HeaderAction><Video size={20} color={discordColors.interactiveNormal} /></HeaderAction>
          <HeaderAction><Pin size={20} color={discordColors.interactiveNormal} /></HeaderAction>
          <HeaderAction><UserPlus size={20} color={discordColors.interactiveNormal} /></HeaderAction>
          <HeaderAction><UserCircle size={20} color={discordColors.interactiveNormal} /></HeaderAction>
          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 24,
              backgroundColor: discordColors.searchBg,
              borderRadius: 4,
              padding: '0 6px',
              width: 140,
            }}
          >
            <span style={{ fontSize: 12, color: discordColors.textMuted, flex: 1 }}>Search</span>
            <Search size={14} color={discordColors.textMuted} />
          </div>
          <div style={{ position: 'relative' }}>
            <HeaderAction onClick={toggleInbox}>
              <Inbox size={20} color={isInboxOpen ? discordColors.interactiveActive : discordColors.interactiveNormal} />
            </HeaderAction>
            <InboxPanel />
          </div>
          <HeaderAction onClick={() => window.open('https://github.com', '_blank')}><HelpCircle size={20} color={discordColors.interactiveNormal} /></HeaderAction>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        height: '100%',
        padding: '0 8px',
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentIcon}
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: discordColors.headerPrimary,
            }}
          >
            {currentTitle}
          </span>
        </div>

        {isFriendsPage && (
          <>
            <div
              style={{
                width: 1,
                height: 24,
                backgroundColor: discordColors.bgModifierActive,
                margin: '0 8px',
              }}
            />
            {friendsTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background:
                    activeTab === tab.key
                      ? discordColors.bgModifierSelected
                      : 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 14,
                  fontWeight: 500,
                  color:
                    activeTab === tab.key
                      ? discordColors.interactiveActive
                      : discordColors.interactiveNormal,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor =
                      discordColors.bgModifierHover
                    e.currentTarget.style.color = discordColors.interactiveHover
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = discordColors.interactiveNormal
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
            {/* Add Friend green button */}
            <button
              onClick={() => setActiveTab('add')}
              style={{
                background: activeTab === 'add' ? 'transparent' : discordColors.green,
                border: 'none',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 14,
                fontWeight: 500,
                color: activeTab === 'add' ? discordColors.green : '#ffffff',
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              Add Friend
            </button>
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <HeaderAction onClick={openCommandPalette}>
          <Search size={20} color={discordColors.interactiveNormal} />
        </HeaderAction>
        <div style={{ position: 'relative' }}>
          <HeaderAction onClick={toggleInbox}>
            <Inbox size={20} color={isInboxOpen ? discordColors.interactiveActive : discordColors.interactiveNormal} />
          </HeaderAction>
          <InboxPanel />
        </div>
        <HeaderAction onClick={() => window.open('https://github.com', '_blank')}>
          <HelpCircle size={20} color={discordColors.interactiveNormal} />
        </HeaderAction>
        <HeaderAction onClick={toggleInfoPanel}>
          <Users
            size={20}
            color={
              isInfoPanelOpen
                ? discordColors.interactiveActive
                : discordColors.interactiveNormal
            }
          />
        </HeaderAction>
      </div>
    </div>
  )
}

function HeaderAction({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        borderRadius: 4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = discordColors.interactiveHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = discordColors.interactiveNormal
      }}
    >
      {children}
    </div>
  )
}
