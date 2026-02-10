import { Button as TamaguiButton, styled } from 'tamagui'
import type { GetProps } from 'tamagui'
import { discordColors } from './tokens'

export const Button = styled(TamaguiButton, {
  name: 'Button',
  backgroundColor: discordColors.brandPrimary,
  color: 'white',
  borderRadius: 3,
  paddingHorizontal: 16,
  paddingVertical: 10,
  fontWeight: '500',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'background-color 150ms ease',

  pressStyle: {
    opacity: 0.9,
  },

  hoverStyle: {
    backgroundColor: discordColors.brandHover,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: discordColors.brandPrimary,
        hoverStyle: {
          backgroundColor: discordColors.brandHover,
        },
      },
      secondary: {
        backgroundColor: discordColors.bgModifierActive,
        hoverStyle: {
          backgroundColor: discordColors.bgModifierHover,
        },
      },
      success: {
        backgroundColor: discordColors.green,
        hoverStyle: {
          backgroundColor: '#1a8c48',
        },
      },
      danger: {
        backgroundColor: discordColors.red,
        hoverStyle: {
          backgroundColor: '#d83c40',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: discordColors.textNormal,
        hoverStyle: {
          backgroundColor: discordColors.bgModifierHover,
        },
      },
      link: {
        backgroundColor: 'transparent',
        color: discordColors.textLink,
        paddingHorizontal: 0,
        hoverStyle: {
          textDecorationLine: 'underline',
        },
      },
    },
    size: {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 13,
        borderRadius: 3,
      },
      medium: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
      },
      large: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        fontSize: 16,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
})

export type ButtonProps = GetProps<typeof Button>
