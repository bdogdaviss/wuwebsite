import { discordColors, Avatar } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, Home } from 'lucide-react'

export function MobileServerRail() {
  const { activeNestId, setActiveNest, setActiveChannel, openCreateGroup, closeMobilePanels, unreadCounts } = useUIStore()
  const { user, logout, api } = useAuth()
  const navigate = useNavigate()
  const { nests: apiNests, nestDetails, fetchNest } = useNestStore()

  const handleNestClick = async (nestId: string) => {
    setActiveNest(nestId)
    closeMobilePanels() // Close panels when navigating

    // Fetch nest details if not cached
    if (apiNests.length > 0 && !nestDetails[nestId]) {
      await fetchNest(api, nestId)
    }

    // Auto-select first text channel
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
        padding: '12px 0',
        gap: 12,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Home / DM icon */}
      <div
        onClick={handleHomeClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: 8,
          minHeight: 80,
          width: '100%',
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: activeNestId === 'home' ? 16 : 25,
            backgroundColor: activeNestId === 'home' ? discordColors.brandPrimary : discordColors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-radius 0.2s ease, background-color 0.2s ease',
          }}
        >
          <Home size={24} color="white" />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: activeNestId === 'home' ? discordColors.textNormal : discordColors.textMuted,
          }}
        >
          Home
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 40,
          height: 2,
          backgroundColor: discordColors.bgModifierActive,
          borderRadius: 1,
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: 8,
              minHeight: 80,
              width: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: activeNestId === nest.id ? 16 : 25,
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
                size="md"
                shape={activeNestId === nest.id ? 'rounded' : 'circle'}
              />
            </div>

            {/* Notification badge */}
            {notifications > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: discordColors.red,
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                  border: `3px solid ${discordColors.bgTertiary}`,
                }}
              >
                {notifications > 99 ? '99+' : notifications}
              </div>
            )}

            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: activeNestId === nest.id ? discordColors.textNormal : discordColors.textMuted,
                textAlign: 'center',
                maxWidth: 70,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nest.name}
            </span>
          </div>
        )
      })}

      {/* Add nest button */}
      <div
        onClick={openCreateGroup}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: 8,
          minHeight: 80,
          width: '100%',
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: discordColors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-radius 0.2s ease, background-color 0.2s ease',
          }}
        >
          <Plus size={24} color={discordColors.green} />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: discordColors.textMuted,
          }}
        >
          Add
        </span>
      </div>

      {/* Bottom section - Profile */}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 2,
            backgroundColor: discordColors.bgModifierActive,
            borderRadius: 1,
            marginBottom: 12,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />

        <div
          onClick={logout}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <Avatar
            src={user?.avatar_url}
            fallback={user?.display_name || 'U'}
            size="md"
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: discordColors.textMuted,
              maxWidth: 70,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.display_name || 'User'}
          </span>
        </div>
      </div>
    </div>
  )
}
