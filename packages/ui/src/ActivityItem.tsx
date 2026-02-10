import { styled, XStack, YStack, Text, GetProps } from 'tamagui'
import { discordColors } from './tokens'

const ActivityItemContainer = styled(XStack, {
  name: 'ActivityItem',
  paddingHorizontal: 16,
  paddingVertical: 8,
  gap: 16,
  alignItems: 'flex-start',

  hoverStyle: {
    backgroundColor: discordColors.bgModifierHover,
  },
})

const ActivityContent = styled(YStack, {
  flex: 1,
  gap: 4,
})

const ActivityTitle = styled(Text, {
  color: discordColors.textNormal,
  fontSize: 15,
  fontWeight: '500',
})

const ActivityMeta = styled(Text, {
  color: discordColors.textMuted,
  fontSize: 12,
})

const ActivityDescription = styled(Text, {
  color: discordColors.textMuted,
  fontSize: 14,
  lineHeight: 20,
})

export interface ActivityItemProps extends GetProps<typeof ActivityItemContainer> {
  icon?: React.ReactNode
  title: string
  meta?: string
  description?: string
}

export function ActivityItem({ icon, title, meta, description, ...props }: ActivityItemProps) {
  return (
    <ActivityItemContainer {...props}>
      {icon}
      <ActivityContent>
        <XStack gap={8} alignItems="center">
          <ActivityTitle>{title}</ActivityTitle>
          {meta && <ActivityMeta>{meta}</ActivityMeta>}
        </XStack>
        {description && <ActivityDescription>{description}</ActivityDescription>}
      </ActivityContent>
    </ActivityItemContainer>
  )
}
