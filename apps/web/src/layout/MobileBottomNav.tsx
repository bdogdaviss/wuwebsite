import { useLocation, useNavigate } from 'react-router-dom'
import { discordColors, Avatar } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useAuth } from '../context/AuthContext'
import { Users, Search, Inbox, Compass, User } from 'lucide-react'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ size: number; color?: string }>
  route?: string
  action?: () => void
}

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { openCommandPalette, unreadCounts } = useUIStore()
  const { user } = useAuth()

  // Calculate total unread count for Inbox badge
  const totalUnreads = Object.values(unreadCounts.conversations).reduce((sum, count) => sum + count, 0) +
    Object.values(unreadCounts.channels).reduce((sum, count) => sum + count, 0)

  const tabs: TabItem[] = [
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      route: '/',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: openCommandPalette,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      route: '/inbox',
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      route: '/discover',
    },
    {
      id: 'profile',
      label: 'Me',
      icon: User,
      route: '/profile',
    },
  ]

  const handleTabClick = (tab: TabItem) => {
    if (tab.action) {
      tab.action()
    } else if (tab.route) {
      navigate(tab.route)
    }
  }

  const isActive = (tab: TabItem) => {
    if (!tab.route) return false
    return location.pathname === tab.route
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        backgroundColor: discordColors.bgSecondary,
        borderTop: `1px solid ${discordColors.bgModifierActive}`,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = isActive(tab)
        const color = active ? discordColors.interactiveActive : discordColors.interactiveNormal

        return (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              flex: 1,
              padding: '10px 4px',
              minHeight: 48,
              position: 'relative',
            }}
          >
            {/* Profile tab shows avatar instead of icon */}
            {tab.id === 'profile' ? (
              <Avatar
                src={user?.avatar_url}
                fallback={user?.display_name || 'U'}
                size="sm"
              />
            ) : (
              <div style={{ position: 'relative' }}>
                <Icon size={24} color={color} />
                {/* Show badge on Inbox tab if there are unreads */}
                {tab.id === 'inbox' && totalUnreads > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: discordColors.red,
                      color: 'white',
                      borderRadius: 10,
                      padding: '0 5px',
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalUnreads > 99 ? '99+' : totalUnreads}
                  </div>
                )}
              </div>
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color,
              }}
            >
              {tab.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
