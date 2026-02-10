import { Button as TamaguiButton, styled } from 'tamagui'
import { discordColors } from '../theme/colors'

export const Button = styled(TamaguiButton, {
  name: 'Button',
  borderRadius: 4,
  fontWeight: '600',

  variants: {
    variant: {
      primary: {
        backgroundColor: discordColors.brandPrimary,
        color: 'white',
        pressStyle: {
          backgroundColor: discordColors.brandHover,
        },
      },
      success: {
        backgroundColor: discordColors.green,
        color: 'white',
        pressStyle: {
          opacity: 0.8,
        },
      },
      danger: {
        backgroundColor: discordColors.red,
        color: 'white',
        pressStyle: {
          opacity: 0.8,
        },
      },
      secondary: {
        backgroundColor: discordColors.bgModifierActive,
        color: discordColors.textNormal,
        pressStyle: {
          backgroundColor: discordColors.bgModifierHover,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: discordColors.border,
        color: discordColors.textNormal,
        pressStyle: {
          backgroundColor: discordColors.bgModifierHover,
        },
      },
    },
    size: {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
      },
      medium: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
      },
      large: {
        paddingHorizontal: 20,
        paddingVertical: 12,
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
