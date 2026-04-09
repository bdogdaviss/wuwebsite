import { View, Image, Text, StyleSheet } from 'react-native'
import { discordColors } from '../theme/colors'

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 72,
} as const

type AvatarSize = keyof typeof SIZES

interface MobileAvatarProps {
  src?: string | null
  fallback: string
  size?: AvatarSize
  status?: 'online' | 'idle' | 'dnd' | 'offline'
}

const STATUS_COLORS: Record<string, string> = {
  online: discordColors.statusOnline,
  idle: discordColors.statusIdle,
  dnd: discordColors.statusDnd,
  offline: discordColors.statusOffline,
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function MobileAvatar({ src, fallback, size = 'md', status }: MobileAvatarProps) {
  const px = SIZES[size]
  const fontSize = px * 0.4
  const dotSize = Math.max(10, px * 0.28)

  return (
    <View style={{ width: px, height: px, position: 'relative' }}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={{
            width: px,
            height: px,
            borderRadius: px / 2,
            backgroundColor: discordColors.bgModifierActive,
          }}
        />
      ) : (
        <View
          style={{
            width: px,
            height: px,
            borderRadius: px / 2,
            backgroundColor: discordColors.brandPrimary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize, fontWeight: '600' }}>
            {getInitials(fallback)}
          </Text>
        </View>
      )}
      {status && (
        <View
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: STATUS_COLORS[status],
            borderWidth: 2,
            borderColor: discordColors.bgPrimary,
          }}
        />
      )}
    </View>
  )
}
