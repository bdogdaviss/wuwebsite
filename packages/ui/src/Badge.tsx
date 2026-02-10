import { styled, Stack, Text, XStack, GetProps } from 'tamagui'
import { discordColors } from './tokens'

// Status dot badge
export const StatusDot = styled(Stack, {
  name: 'StatusDot',
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: discordColors.statusOffline,

  variants: {
    status: {
      online: { backgroundColor: discordColors.statusOnline },
      idle: { backgroundColor: discordColors.statusIdle },
      dnd: { backgroundColor: discordColors.statusDnd },
      offline: { backgroundColor: discordColors.statusOffline },
      active: { backgroundColor: discordColors.green },
    },
    size: {
      sm: { width: 8, height: 8, borderRadius: 4 },
      md: { width: 10, height: 10, borderRadius: 5 },
      lg: { width: 12, height: 12, borderRadius: 6 },
    },
  } as const,

  defaultVariants: {
    status: 'offline',
    size: 'md',
  },
})

// Pill-style badge for counts or labels
const BadgePill = styled(XStack, {
  name: 'Badge',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 8,
  backgroundColor: discordColors.red,
  minWidth: 16,

  variants: {
    variant: {
      danger: { backgroundColor: discordColors.red },
      warning: { backgroundColor: discordColors.yellow },
      success: { backgroundColor: discordColors.green },
      brand: { backgroundColor: discordColors.brandPrimary },
      muted: { backgroundColor: discordColors.bgModifierActive },
    },
  } as const,

  defaultVariants: {
    variant: 'danger',
  },
})

const BadgeText = styled(Text, {
  color: 'white',
  fontSize: 11,
  fontWeight: '700',
  textAlign: 'center',
})

export interface BadgeProps extends GetProps<typeof BadgePill> {
  count?: number
  label?: string
  variant?: 'danger' | 'warning' | 'success' | 'brand' | 'muted'
}

export function Badge({ count, label, variant = 'danger', ...props }: BadgeProps) {
  const displayText = label ?? (count !== undefined ? (count > 99 ? '99+' : String(count)) : '')

  if (!displayText) return null

  return (
    <BadgePill variant={variant} {...props}>
      <BadgeText>{displayText}</BadgeText>
    </BadgePill>
  )
}

export type StatusDotProps = GetProps<typeof StatusDot>
