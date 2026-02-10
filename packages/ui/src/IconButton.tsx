import { styled, Stack, GetProps } from 'tamagui'
import { discordColors } from './tokens'

export const IconButton = styled(Stack, {
  name: 'IconButton',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: discordColors.bgSecondary,
  borderRadius: 24,
  transition: 'all 150ms ease',

  hoverStyle: {
    backgroundColor: discordColors.brandPrimary,
    borderRadius: 16,
  },

  pressStyle: {
    scale: 0.95,
  },

  variants: {
    size: {
      sm: { width: 40, height: 40 },
      md: { width: 48, height: 48 },
      lg: { width: 56, height: 56 },
    },
    active: {
      true: {
        backgroundColor: discordColors.brandPrimary,
        borderRadius: 16,
      },
    },
    variant: {
      default: {},
      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: {
          backgroundColor: discordColors.bgModifierHover,
        },
      },
      danger: {
        hoverStyle: {
          backgroundColor: discordColors.red,
        },
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export type IconButtonProps = GetProps<typeof IconButton>
