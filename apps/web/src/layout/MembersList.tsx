import { discordColors, Avatar, StatusDot } from '@wakeup/ui'
import { useSocialStore } from '../state/socialStore'


export function MembersList() {
  const { onlineFriends } = useSocialStore()

  const activeOwls = onlineFriends.filter(
    (o) => o.status === 'online' || o.status === 'idle'
  )

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: 16,
      }}
    >
      {/* ACTIVE NOW header */}
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: discordColors.headerPrimary,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          Active Now
        </span>
      </div>

      {activeOwls.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeOwls.map((owl) => {
            return (
              <div
                key={owl.id}
                style={{
                  padding: '8px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = discordColors.bgModifierHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Top row: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar src={owl.avatar_url} fallback={owl.display_name} size="sm" />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        right: -1,
                        borderRadius: '50%',
                        border: `2px solid ${discordColors.bgSecondary}`,
                        display: 'flex',
                      }}
                    >
                      <StatusDot status={owl.status as 'online' | 'idle' | 'dnd' | 'offline'} size="sm" />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: discordColors.textNormal,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {owl.display_name}
                  </div>
                </div>
                {/* Activity card */}
                <div
                  style={{
                    backgroundColor: discordColors.bgPrimary,
                    borderRadius: 8,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: discordColors.textNormal,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {owl.status === 'dnd' ? 'Do Not Disturb' : owl.status}
                    </div>
                    <div style={{ fontSize: 11, color: discordColors.textMuted }}>
                      Night Owl
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
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
          <span style={{ fontSize: 14, color: discordColors.textMuted }}>
            It's quiet for now...
          </span>
        </div>
      )}
    </div>
  )
}
