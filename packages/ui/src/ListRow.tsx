import { styled, XStack, YStack, Text, GetProps } from 'tamagui'
import { discordColors } from './tokens'

const ListRowContainer = styled(XStack, {
  name: 'ListRow',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 6,
  marginHorizontal: 8,
  borderRadius: 4,
  gap: 12,
  cursor: 'pointer',
  transition: 'background-color 100ms ease',

  hoverStyle: {
    backgroundColor: discordColors.channelHover, // #38393b
  },

  pressStyle: {
    backgroundColor: discordColors.channelActive, // #404249
  },

  variants: {
    selected: {
      true: {
        backgroundColor: discordColors.channelActive, // #404249
        hoverStyle: {
          backgroundColor: discordColors.channelActive,
        },
      },
    },
    muted: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,
})

const ListRowContent = styled(YStack, {
  flex: 1,
  gap: 2,
  overflow: 'hidden',
})

const ListRowTitle = styled(Text, {
  color: discordColors.textMuted,
  fontSize: 15,
  fontWeight: '500',
  numberOfLines: 1,

  variants: {
    selected: {
      true: {
        color: discordColors.textNormal,
      },
    },
  } as const,
})

const ListRowSubtitle = styled(Text, {
  color: discordColors.textMuted,
  fontSize: 12,
  numberOfLines: 1,
})

export interface ListRowProps extends GetProps<typeof ListRowContainer> {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  rightElement?: React.ReactNode
  selected?: boolean
  muted?: boolean
}

export function ListRow({
  icon,
  title,
  subtitle,
  rightElement,
  selected,
  muted,
  ...props
}: ListRowProps) {
  return (
    <ListRowContainer selected={selected} muted={muted} {...props}>
      {icon}
      <ListRowContent>
        <ListRowTitle selected={selected}>{title}</ListRowTitle>
        {subtitle && <ListRowSubtitle>{subtitle}</ListRowSubtitle>}
      </ListRowContent>
      {rightElement}
    </ListRowContainer>
  )
}

export type { GetProps as ListRowContainerProps } from 'tamagui'
