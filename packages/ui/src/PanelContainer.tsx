import { styled, YStack, GetProps } from 'tamagui'
import { discordColors } from './tokens'

export const PanelContainer = styled(YStack, {
  name: 'PanelContainer',
  height: '100%',

  variants: {
    variant: {
      rail: {
        width: 72,
        backgroundColor: discordColors.bgTertiary,
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
      },
      sidebar: {
        width: 240,
        backgroundColor: discordColors.bgSecondary,
      },
      main: {
        flex: 1,
        backgroundColor: discordColors.bgPrimary,
      },
      info: {
        width: 240,
        backgroundColor: discordColors.bgSecondary,
        borderLeftWidth: 1,
        borderLeftColor: discordColors.border,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'main',
  },
})

export type PanelContainerProps = GetProps<typeof PanelContainer>
