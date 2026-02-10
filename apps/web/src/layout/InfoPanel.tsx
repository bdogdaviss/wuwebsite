import { YStack, XStack, Text, styled, ScrollView } from 'tamagui'
import { useUIStore } from '../state/uiStore'
import { useAuth } from '../context/AuthContext'
import {
  discordColors,
  SectionHeader,
  StatusDot,
  Avatar,
  Badge,
} from '@wakeup/ui'
import { Globe, Monitor, Newspaper } from 'lucide-react'

const InfoContainer = styled(YStack, {
  width: 240,
  backgroundColor: discordColors.bgSecondary,
  borderLeftWidth: 1,
  borderLeftColor: discordColors.border,
  height: '100%',
})

const StatusCard = styled(YStack, {
  margin: 8,
  padding: 12,
  backgroundColor: discordColors.bgPrimary,
  borderRadius: 8,
  gap: 8,
})

const StatusRow = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
})

const StatusLabel = styled(Text, {
  fontSize: 12,
  color: discordColors.textMuted,
})

const StatusValue = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  color: discordColors.textNormal,
})

const RuleItem = styled(XStack, {
  paddingVertical: 8,
  paddingHorizontal: 12,
  alignItems: 'center',
  gap: 8,
  borderRadius: 4,
  hoverStyle: {
    backgroundColor: discordColors.bgModifierHover,
  },
})

export function InfoPanel() {
  const { isInfoPanelOpen } = useUIStore()
  const { user } = useAuth()

  if (!isInfoPanelOpen) return null

  return (
    <InfoContainer>
      <ScrollView>
        {/* User Profile Section */}
        <YStack padding={16} alignItems="center" gap={12}>
          <Avatar
            src={user?.avatar_url}
            fallback={user?.display_name || 'U'}
            size="xl"
          />
          <YStack alignItems="center" gap={4}>
            <Text
              fontSize={18}
              fontWeight="600"
              color={discordColors.textNormal}
            >
              {user?.display_name}
            </Text>
            <XStack alignItems="center" gap={6}>
              <StatusDot status="online" />
              <Text fontSize={13} color={discordColors.textMuted}>
                Online
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Focus Status */}
        <SectionHeader title="Focus Status" />
        <StatusCard>
          <StatusRow>
            <StatusLabel>Status</StatusLabel>
            <XStack alignItems="center" gap={6}>
              <StatusDot status="online" />
              <StatusValue>Active</StatusValue>
            </XStack>
          </StatusRow>
          <StatusRow>
            <StatusLabel>Duration</StatusLabel>
            <StatusValue>1h 23m</StatusValue>
          </StatusRow>
          <StatusRow>
            <StatusLabel>Started</StatusLabel>
            <StatusValue>2:30 PM</StatusValue>
          </StatusRow>
        </StatusCard>

        {/* Active Blocks */}
        <SectionHeader title="Active Blocks" />
        <YStack paddingHorizontal={8}>
          <RuleItem>
            <Globe size={16} color={discordColors.textMuted} />
            <YStack flex={1}>
              <Text fontSize={13} color={discordColors.textNormal}>
                Social Media
              </Text>
              <Text fontSize={11} color={discordColors.textMuted}>
                5 sites blocked
              </Text>
            </YStack>
            <Badge count={5} variant="brand" />
          </RuleItem>
          <RuleItem>
            <Monitor size={16} color={discordColors.textMuted} />
            <YStack flex={1}>
              <Text fontSize={13} color={discordColors.textNormal}>
                Entertainment
              </Text>
              <Text fontSize={11} color={discordColors.textMuted}>
                3 sites blocked
              </Text>
            </YStack>
            <Badge count={3} variant="brand" />
          </RuleItem>
          <RuleItem>
            <Newspaper size={16} color={discordColors.textMuted} />
            <YStack flex={1}>
              <Text fontSize={13} color={discordColors.textNormal}>
                News Sites
              </Text>
              <Text fontSize={11} color={discordColors.textMuted}>
                2 sites blocked
              </Text>
            </YStack>
            <Badge count={2} variant="brand" />
          </RuleItem>
        </YStack>

        {/* Stats */}
        <SectionHeader title="Today's Stats" />
        <StatusCard>
          <StatusRow>
            <StatusLabel>Sessions</StatusLabel>
            <StatusValue>3</StatusValue>
          </StatusRow>
          <StatusRow>
            <StatusLabel>Total Focus</StatusLabel>
            <StatusValue>4h 15m</StatusValue>
          </StatusRow>
          <StatusRow>
            <StatusLabel>Blocks Applied</StatusLabel>
            <StatusValue>24</StatusValue>
          </StatusRow>
        </StatusCard>
      </ScrollView>
    </InfoContainer>
  )
}
