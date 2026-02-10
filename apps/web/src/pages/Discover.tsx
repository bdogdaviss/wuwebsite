import { discordColors } from '@wakeup/ui'
import { Compass, Search } from 'lucide-react'

export function Discover() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            backgroundColor: discordColors.searchBg,
            borderRadius: 4,
            padding: '0 8px',
          }}
        >
          <input
            placeholder="Explore night owl communities"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: discordColors.textNormal,
              fontSize: 14,
            }}
          />
          <Search size={16} color={discordColors.textMuted} />
        </div>
      </div>

      {/* Empty state */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          textAlign: 'center',
        }}
      >
        <Compass size={48} color={discordColors.textMuted} style={{ marginBottom: 16 }} />
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: discordColors.headerPrimary,
            marginBottom: 8,
          }}
        >
          Discover Night Owls
        </div>
        <div
          style={{
            fontSize: 14,
            color: discordColors.textMuted,
            maxWidth: 400,
            lineHeight: '20px',
          }}
        >
          Find crews who build, fix, and dream through the night.
          Match with awake partners nearby and join late-night sessions.
        </div>
      </div>
    </div>
  )
}
