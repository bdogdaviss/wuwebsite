import { useState } from 'react'
import { styled, Stack, GetProps } from 'tamagui'
import { discordColors, discordLayout } from './tokens'

// Active indicator pill on the left side
const PillIndicator = styled(Stack, {
  name: 'RailIconPill',
  position: 'absolute',
  left: 0,
  width: 4,
  backgroundColor: discordColors.railPill,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  transition: `height ${discordLayout.transitionNormal} ease, opacity ${discordLayout.transitionNormal} ease`,
})

// Container for positioning
const RailIconContainer = styled(Stack, {
  name: 'RailIconContainer',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

// The actual icon button with Discord-style hover animation
const RailIconButton = styled(Stack, {
  name: 'RailIconButton',
  width: 48,
  height: 48,
  borderRadius: discordLayout.iconRadiusCircle, // 24px - circle
  backgroundColor: discordColors.bgSecondary,
  alignItems: 'center',
  justifyContent: 'center',
  transition: `border-radius ${discordLayout.transitionNormal} ease, background-color ${discordLayout.transitionNormal} ease`,

  hoverStyle: {
    borderRadius: discordLayout.iconRadiusHover, // 16px - rounded rect on hover
    backgroundColor: discordColors.brandPrimary,
  },

  variants: {
    active: {
      true: {
        borderRadius: discordLayout.iconRadiusActive, // 13px - active state
        backgroundColor: discordColors.brandPrimary,
      },
    },
  } as const,
})

export interface RailIconProps extends Omit<GetProps<typeof RailIconContainer>, 'children'> {
  /** Content inside the icon (emoji, Avatar, etc.) */
  children: React.ReactNode
  /** Whether this icon is currently active/selected */
  active?: boolean
  /** Called when the icon is pressed */
  onPress?: () => void
}

export function RailIcon({
  children,
  active = false,
  onPress,
  ...props
}: RailIconProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Pill height: 0 idle, 20px hover, 40px active
  const pillHeight = active ? 40 : isHovered ? 20 : 0
  const pillOpacity = active || isHovered ? 1 : 0

  return (
    <RailIconContainer
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      {...props}
    >
      <PillIndicator height={pillHeight} opacity={pillOpacity} />
      <RailIconButton active={active}>
        {children}
      </RailIconButton>
    </RailIconContainer>
  )
}

export type { GetProps as RailIconButtonProps } from 'tamagui'
