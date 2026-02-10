import { styled, Stack, GetProps } from 'tamagui'
import { discordColors } from './tokens'

export const Divider = styled(Stack, {
  name: 'Divider',
  backgroundColor: discordColors.border,
  marginVertical: 8,
  marginHorizontal: 16,

  variants: {
    direction: {
      horizontal: {
        height: 1,
        width: '100%',
      },
      vertical: {
        width: 1,
        height: '100%',
        marginVertical: 0,
        marginHorizontal: 8,
      },
    },
    spacing: {
      none: { marginVertical: 0, marginHorizontal: 0 },
      sm: { marginVertical: 4, marginHorizontal: 8 },
      md: { marginVertical: 8, marginHorizontal: 16 },
      lg: { marginVertical: 16, marginHorizontal: 16 },
    },
  } as const,

  defaultVariants: {
    direction: 'horizontal',
    spacing: 'md',
  },
})

export type DividerProps = GetProps<typeof Divider>
