import { discordColors, Avatar } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, Home, X } from 'lucide-react'

export function MobileServerRail() {
  const { activeNestId, setActiveNest, setActiveChannel, openCreateGroup, closeMobilePanels, unreadCounts } = useUIStore()
  const { user, logout, api } = useAuth()
  const navigate = useNavigate()
  const { nests: apiNests, nestDetails, fetchNest } = useNestStore()

  const handleNestClick = async (nestId: string) => {
    setActiveNest(nestId)
    closeMobilePanels()

    if (apiNests.length > 0 && !nestDetails[nestId]) {
      await fetchNest(api, nestId)
    }

    const channels = nestDetails[nestId]?.channels || []
    const firstChannel = channels.find((c) => c.type === 'text')
    if (firstChannel) {
      setActiveChannel(firstChannel.id)
      navigate(`/nest/${nestId}/${firstChannel.id}`)
    }
  }

  const handleHomeClick = () => {
    setActiveNest('home')
    closeMobilePanels()
    navigate('/')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 0 8px',
        gap: 2,
        height: '100%',
        width: 72,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Close button */}
      <div
        onClick={closeMobilePanels}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: 4,
          backgroundColor: discordColors.bgModifierHover,
        }}
      >
        <X size={20} color={discordColors.textMuted} />
      </div>

      {/* Divider */}
      <div
        style={{
          width: 32,
          height: 2,
          backgroundColor: discordColors.bgModifierActive,
          borderRadius: 1,
          marginBottom: 2,
        }}
      />

      {/* Home */}
      <div
        onClick={handleHomeClick}
        title="Home"
        style={{
          width: 44,
          height: 44,
          borderRadius: activeNestId === 'home' ? 14 : 22,
          backgroundColor: activeNestId === 'home' ? discordColors.brandPrimary : discordColors.bgSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-radius 0.2s ease, background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <Home size={20} color="white" />
      </div>

      {/* Divider */}
      <div
        style={{
          width: 32,
          height: 2,
          backgroundColor: discordColors.bgModifierActive,
          borderRadius: 1,
          margin: '2px 0',
        }}
      />

      {/* Nest icons */}
      {apiNests.map((nest) => {
        const channels = nestDetails[nest.id]?.channels || []
        const notifications = channels.reduce((sum, ch) => {
          return sum + (unreadCounts.channels[ch.id] || 0)
        }, 0)

        return (
          <div
            key={nest.id}
            onClick={() => handleNestClick(nest.id)}
            title={nest.name}
            style={{
              position: 'relative',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: activeNestId === nest.id ? 14 : 22,
                backgroundColor: activeNestId === nest.id ? discordColors.brandPrimary : discordColors.bgSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-radius 0.2s ease, background-color 0.2s ease',
                overflow: 'hidden',
              }}
            >
              <Avatar
                fallback={nest.name}
                size="sm"
                shape={activeNestId === nest.id ? 'rounded' : 'circle'}
              />
            </div>

            {notifications > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: discordColors.red,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: `2px solid ${discordColors.bgTertiary}`,
                }}
              >
                {notifications > 99 ? '99+' : notifications}
              </div>
            )}
          </div>
        )
      })}

      {/* Add button */}
      <div
        onClick={openCreateGroup}
        title="Add Nest"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: discordColors.bgSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Plus size={20} color={discordColors.green} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div
        style={{
          width: 32,
          height: 2,
          backgroundColor: discordColors.bgModifierActive,
          borderRadius: 1,
          margin: '2px 0',
        }}
      />

      {/* Profile */}
      <div
        onClick={logout}
        title={user?.display_name || 'User'}
        style={{
          cursor: 'pointer',
          paddingBottom: 4,
          flexShrink: 0,
        }}
      >
        <Avatar
          src={user?.avatar_url}
          fallback={user?.display_name || 'U'}
          size="sm"
        />
      </div>
    </div>
  )
}
