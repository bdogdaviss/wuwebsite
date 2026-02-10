import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { useMessageStore } from '../state/messageStore'
import { useSocialStore } from '../state/socialStore'
import { discordColors, UserStatusPanel, StatusDot } from '@wakeup/ui'
import { Users, Compass, Moon, Plus, Search, X, Mic, MicOff, Headphones, HeadphoneOff, Settings, MessageSquare, Sparkles, ShoppingBag, Swords, Hash, Volume2, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Circle, MinusCircle } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={20} />,
  compass: <Compass size={20} />,
  moon: <Moon size={20} />,
}

const statusOptions: { key: 'online' | 'idle' | 'dnd' | 'offline'; label: string; color: string }[] = [
  { key: 'online', label: 'Online', color: discordColors.statusOnline },
  { key: 'idle', label: 'Idle', color: discordColors.statusIdle },
  { key: 'dnd', label: 'Do Not Disturb', color: discordColors.red },
  { key: 'offline', label: 'Invisible', color: discordColors.textMuted },
]

function StatusPicker({ isOpen, onClose, anchorRef }: { isOpen: boolean; onClose: () => void; anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const { userStatus, setUserStatus } = useUIStore()
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        bottom: 58,
        left: 8,
        right: 8,
        backgroundColor: discordColors.bgPrimary,
        borderRadius: 8,
        padding: 6,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        zIndex: 100,
        border: `1px solid ${discordColors.border}`,
      }}
    >
      <div style={{ padding: '6px 8px 4px', fontSize: 12, fontWeight: 700, color: discordColors.textMuted, textTransform: 'uppercase' }}>
        Status
      </div>
      {statusOptions.map((opt) => (
        <div
          key={opt.key}
          onClick={() => {
            setUserStatus(opt.key)
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            backgroundColor: userStatus === opt.key ? discordColors.bgModifierSelected : 'transparent',
            transition: 'background-color 0.1s',
          }}
          onMouseEnter={(e) => {
            if (userStatus !== opt.key) e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
          }}
          onMouseLeave={(e) => {
            if (userStatus !== opt.key) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {opt.key === 'dnd' ? (
            <MinusCircle size={14} color={opt.color} fill={opt.color} />
          ) : (
            <Circle size={14} color={opt.color} fill={opt.key === 'offline' ? 'transparent' : opt.color} strokeWidth={opt.key === 'offline' ? 2 : 0} />
          )}
          <span style={{ fontSize: 14, fontWeight: 500, color: discordColors.textNormal }}>
            {opt.label}
          </span>
        </div>
      ))}
    </div>
  )
}

const navItems = [
  { id: 'friends', label: 'Friends', route: '/', icon: 'users' },
  { id: 'discover', label: 'Discover', route: '/discover', icon: 'compass' },
  { id: 'rituals', label: 'Rituals', route: '/rituals', icon: 'moon' },
]

function HomeSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setActiveNavKey, openSettings, openCommandPalette, openCreateGroup, toggleMute, toggleDeafen, isMuted, isDeafened, hideDm, hiddenDmIds, userStatus } = useUIStore()
  const { user } = useAuth()
  const { conversations } = useMessageStore()
  const { onlineFriends } = useSocialStore()
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const statusPanelRef = useRef<HTMLDivElement>(null)

  // Map API conversations to DM display items
  const allDms = conversations.map((conv) => {
    const otherMembers = conv.members?.filter((m) => m.id !== user?.id) || []
    const name = conv.type === 'group'
      ? (conv.name || otherMembers.map((m) => m.display_name).join(', ') || 'Group')
      : (otherMembers[0]?.display_name || 'Unknown')
    const isGroup = conv.type === 'group'
    // Look up real status from onlineFriends
    const otherUserId = otherMembers[0]?.id
    const onlineFriend = otherUserId ? onlineFriends.find((f) => f.id === otherUserId) : null
    const status = isGroup ? 'online' : (onlineFriend?.status || 'offline') as 'online' | 'idle' | 'dnd' | 'offline'
    return {
      id: conv.id,
      name,
      subtitle: isGroup ? `${(conv.members?.length || 0)} Members` : '',
      avatarColor: '#5865f2',
      avatarUrl: otherMembers[0]?.avatar_url || null,
      status,
      isGroup,
      memberCount: conv.members?.length || 0,
    }
  })

  const isActive = (route: string) => {
    if (route === '/') return location.pathname === '/'
    return location.pathname.startsWith(route)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '0 8px', height: 48, display: 'flex', alignItems: 'center' }}>
        <div
          onClick={openCommandPalette}
          style={{
            width: '100%',
            height: 28,
            backgroundColor: discordColors.searchBg,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            cursor: 'text',
          }}
        >
          <span style={{ fontSize: 13, color: discordColors.textMuted, flex: 1 }}>
            Find or start a conversation
          </span>
          <Search size={14} color={discordColors.textMuted} />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {/* Nav items */}
        <div style={{ marginTop: 8 }}>
          {navItems.map((item) => {
            const active = isActive(item.route)
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveNavKey(item.id as any)
                  navigate(item.route)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 42,
                  padding: '0 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  backgroundColor: active ? discordColors.bgModifierSelected : 'transparent',
                  color: active ? discordColors.channelTextSelected : discordColors.channelDefault,
                  transition: 'background-color 0.1s, color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                    e.currentTarget.style.color = discordColors.channelTextHover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = discordColors.channelDefault
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                  {iconMap[item.icon || ''] || <Users size={20} />}
                </span>
                <span style={{ fontSize: 16, fontWeight: 500, color: 'inherit' }}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: discordColors.border,
            margin: '8px 12px',
          }}
        />

        {/* Extra nav items */}
        {[
          { icon: <MessageSquare size={20} />, label: 'Message Requests' },
          { icon: <Sparkles size={20} />, label: 'Night Pass', color: discordColors.statusIdle },
          { icon: <ShoppingBag size={20} />, label: 'Shop', color: discordColors.green },
          { icon: <Swords size={20} />, label: 'Quests', color: discordColors.green },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 42,
              padding: '0 12px',
              borderRadius: 4,
              cursor: 'pointer',
              color: item.color || discordColors.channelDefault,
              transition: 'background-color 0.1s, color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
              e.currentTarget.style.color = item.color || discordColors.channelTextHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = item.color || discordColors.channelDefault
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'inherit' }}>
              {item.label}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: discordColors.border,
            margin: '8px 12px',
          }}
        />

        {/* Direct Messages header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 12px 4px',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: discordColors.channelDefault,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Direct Messages
          </span>
          <Plus
            size={16}
            color={discordColors.channelDefault}
            style={{ cursor: 'pointer' }}
            onClick={openCreateGroup}
          />
        </div>

        {/* DM conversations with people */}
        {allDms.filter((dm) => !hiddenDmIds.includes(dm.id)).map((dm) => {
          const isActiveDm = location.pathname === `/dm/${dm.id}`
          return (
          <div
            key={dm.id}
            onClick={() => navigate(`/dm/${dm.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 42,
              padding: '0 8px',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.1s',
              position: 'relative',
              backgroundColor: isActiveDm ? discordColors.bgModifierSelected : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActiveDm) e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
              const closeBtn = e.currentTarget.querySelector('.dm-close') as HTMLElement
              if (closeBtn) closeBtn.style.display = 'flex'
            }}
            onMouseLeave={(e) => {
              if (!isActiveDm) e.currentTarget.style.backgroundColor = 'transparent'
              const closeBtn = e.currentTarget.querySelector('.dm-close') as HTMLElement
              if (closeBtn) closeBtn.style.display = 'none'
            }}
          >
            {/* Avatar with status */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {dm.avatarUrl ? (
                <img
                  src={dm.avatarUrl}
                  alt={dm.name}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: dm.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                    {dm.name[0]}
                  </span>
                </div>
              )}
              {!dm.isGroup && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    borderRadius: '50%',
                    border: `3px solid ${discordColors.bgSecondary}`,
                    display: 'flex',
                  }}
                >
                  <StatusDot status={dm.status} size="sm" />
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: discordColors.channelDefault,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dm.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: discordColors.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dm.subtitle}
              </div>
            </div>
            {/* Close button on hover */}
            <div
              className="dm-close"
              onClick={(e) => {
                e.stopPropagation()
                hideDm(dm.id)
              }}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <X size={14} color={discordColors.textMuted} />
            </div>
          </div>
          )
        })}
      </div>

      {/* User panel at bottom */}
      <div ref={statusPanelRef} style={{ position: 'relative' }}>
        <StatusPicker isOpen={showStatusPicker} onClose={() => setShowStatusPicker(false)} anchorRef={statusPanelRef} />
        <div onClick={() => setShowStatusPicker(!showStatusPicker)} style={{ cursor: 'pointer' }}>
          <UserStatusPanel
            avatarUrl={user?.avatar_url}
            displayName={user?.display_name || 'User'}
            status={userStatus}
            actions={[
              <div key="mute" onClick={(e) => { e.stopPropagation(); toggleMute() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                {isMuted
                  ? <MicOff size={18} color={discordColors.red} />
                  : <Mic size={18} color={discordColors.textMuted} />}
              </div>,
              <div key="deafen" onClick={(e) => { e.stopPropagation(); toggleDeafen() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                {isDeafened
                  ? <HeadphoneOff size={18} color={discordColors.red} />
                  : <Headphones size={18} color={discordColors.textMuted} />}
              </div>,
              <div key="settings" onClick={(e) => { e.stopPropagation(); openSettings() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                <Settings size={18} color={discordColors.textMuted} />
              </div>,
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function NestSidebar({ nestId }: { nestId: string }) {
  const navigate = useNavigate()
  const { activeChannelId, setActiveChannel, openSettings, toggleMute, toggleDeafen, isMuted, isDeafened, userStatus } = useUIStore()
  const { user } = useAuth()
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const statusPanelRef = useRef<HTMLDivElement>(null)
  const { nestDetails } = useNestStore()

  const apiNest = nestDetails[nestId]
  if (!apiNest) return null
  const nest = {
    id: apiNest.id,
    name: apiNest.name,
    channels: apiNest.channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type as 'text' | 'voice',
      category: ch.category,
    })),
  }

  // Group channels by category
  const categories = nest.channels.reduce<Record<string, typeof nest.channels>>((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = []
    acc[ch.category].push(ch)
    return acc
  }, {})

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Nest header */}
      <div
        style={{
          padding: '0 16px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${discordColors.border}`,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: discordColors.headerPrimary }}>
          {nest.name}
        </span>
        <ChevronDown size={16} color={discordColors.textMuted} />
      </div>

      {/* Channels list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {Object.entries(categories).map(([category, channels]) => {
          const isCollapsed = collapsedCategories.has(category)
          return (
            <div key={category} style={{ marginBottom: 4 }}>
              {/* Category header */}
              <div
                onClick={() => toggleCategory(category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '16px 8px 4px 4px',
                  cursor: 'pointer',
                }}
              >
                {isCollapsed
                  ? <ChevronRight size={10} color={discordColors.channelDefault} />
                  : <ChevronDown size={10} color={discordColors.channelDefault} />
                }
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: discordColors.channelDefault,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Channel list */}
              {!isCollapsed && channels.map((channel) => {
                const isActive = activeChannelId === channel.id
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel.id)
                      navigate(`/nest/${nestId}/${channel.id}`)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 34,
                      padding: '0 8px 0 16px',
                      marginLeft: 4,
                      borderRadius: 4,
                      cursor: 'pointer',
                      backgroundColor: isActive ? discordColors.bgModifierSelected : 'transparent',
                      color: isActive ? discordColors.channelTextSelected : discordColors.channelDefault,
                      transition: 'background-color 0.1s, color 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                        e.currentTarget.style.color = discordColors.channelTextHover
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = discordColors.channelDefault
                      }
                    }}
                  >
                    {channel.type === 'text'
                      ? <Hash size={18} color="inherit" style={{ opacity: 0.7, flexShrink: 0 }} />
                      : <Volume2 size={18} color="inherit" style={{ opacity: 0.7, flexShrink: 0 }} />
                    }
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: isActive ? 600 : 500,
                        color: 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {channel.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* User panel at bottom */}
      <div ref={statusPanelRef} style={{ position: 'relative' }}>
        <StatusPicker isOpen={showStatusPicker} onClose={() => setShowStatusPicker(false)} anchorRef={statusPanelRef} />
        <div onClick={() => setShowStatusPicker(!showStatusPicker)} style={{ cursor: 'pointer' }}>
          <UserStatusPanel
            avatarUrl={user?.avatar_url}
            displayName={user?.display_name || 'User'}
            status={userStatus}
            actions={[
              <div key="mute" onClick={(e) => { e.stopPropagation(); toggleMute() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                {isMuted
                  ? <MicOff size={18} color={discordColors.red} />
                  : <Mic size={18} color={discordColors.textMuted} />}
              </div>,
              <div key="deafen" onClick={(e) => { e.stopPropagation(); toggleDeafen() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                {isDeafened
                  ? <HeadphoneOff size={18} color={discordColors.red} />
                  : <Headphones size={18} color={discordColors.textMuted} />}
              </div>,
              <div key="settings" onClick={(e) => { e.stopPropagation(); openSettings() }} style={{ cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                <Settings size={18} color={discordColors.textMuted} />
              </div>,
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export function ChannelSidebar() {
  const { activeNestId } = useUIStore()

  if (activeNestId === 'home') {
    return <HomeSidebar />
  }

  return <NestSidebar nestId={activeNestId} />
}
