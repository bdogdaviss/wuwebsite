import { discordColors } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'

// Inline mock notifications (no notification backend yet)
const inboxNotifications: { id: string; type: string; title: string; description: string; avatarColor: string; timeAgo: string; read: boolean }[] = []
import {
  Inbox,
  Check,
  Bell,
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  AtSign,
  Hash,
} from 'lucide-react'

const tabs = [
  { key: 'foryou' as const, label: 'For You' },
  { key: 'unreads' as const, label: 'Unreads' },
  { key: 'mentions' as const, label: 'Mentions' },
]

const typeIcons: Record<string, React.ReactNode> = {
  friend_accepted: <UserPlus size={14} color={discordColors.green} />,
  new_message: <MessageCircle size={14} color={discordColors.interactiveNormal} />,
  mention: <AtSign size={14} color="#f0b132" />,
  server_message: <Hash size={14} color={discordColors.interactiveNormal} />,
}

export function InboxPanel() {
  const { isInboxOpen, inboxTab, setInboxTab, toggleInbox } = useUIStore()

  if (!isInboxOpen) return null

  const filtered = inboxNotifications.filter((n) => {
    if (inboxTab === 'unreads') return !n.read
    if (inboxTab === 'mentions') return n.type === 'mention'
    return true // 'foryou' shows all
  })

  const unreadCount = inboxNotifications.filter((n) => !n.read).length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleInbox}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 0,
          width: 480,
          maxHeight: 'calc(100vh - 80px)',
          backgroundColor: discordColors.bgTertiary,
          borderRadius: 8,
          boxShadow: '0 8px 16px rgba(0,0,0,0.24)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Inbox size={20} color={discordColors.headerPrimary} />
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: discordColors.headerPrimary,
              }}
            >
              Inbox
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Mark all as read"
            >
              <Check size={18} color={discordColors.interactiveNormal} />
            </div>
            <div
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Notification settings"
            >
              <Bell size={18} color={discordColors.interactiveNormal} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#ffffff',
                    backgroundColor: '#ed4245',
                    borderRadius: 8,
                    padding: '0 4px',
                    minWidth: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 16px 0',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setInboxTab(tab.key)}
              style={{
                background:
                  inboxTab === tab.key
                    ? discordColors.bgModifierSelected
                    : 'transparent',
                border: 'none',
                borderRadius: 4,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 600,
                color:
                  inboxTab === tab.key
                    ? discordColors.interactiveActive
                    : discordColors.interactiveNormal,
                cursor: 'pointer',
                transition: 'background-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (inboxTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                  e.currentTarget.style.color = discordColors.interactiveHover
                }
              }}
              onMouseLeave={(e) => {
                if (inboxTab !== tab.key) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = discordColors.interactiveNormal
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.06)',
            margin: '12px 16px 0',
          }}
        />

        {/* Notifications list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 16px',
                textAlign: 'center',
              }}
            >
              <Inbox size={40} color={discordColors.textMuted} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: discordColors.textMuted }}>
                You're all caught up!
              </div>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '10px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  gap: 12,
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                  const moreBtn = e.currentTarget.querySelector('.notif-more') as HTMLElement
                  if (moreBtn) moreBtn.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  const moreBtn = e.currentTarget.querySelector('.notif-more') as HTMLElement
                  if (moreBtn) moreBtn.style.opacity = '0'
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: notif.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>
                      {notif.title[0]}
                    </span>
                  </div>
                  {/* Type badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: discordColors.bgTertiary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {typeIcons[notif.type]}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: discordColors.headerPrimary,
                      }}
                    >
                      {notif.title}
                    </span>
                    <span style={{ fontSize: 12, color: discordColors.textMuted }}>
                      {notif.timeAgo}
                    </span>
                    {!notif.read && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#5865f2',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: discordColors.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {notif.description}
                  </div>
                </div>

                {/* More button */}
                <div
                  className="notif-more"
                  style={{
                    opacity: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                    flexShrink: 0,
                    transition: 'opacity 0.1s',
                  }}
                >
                  <MoreHorizontal size={16} color={discordColors.interactiveNormal} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
