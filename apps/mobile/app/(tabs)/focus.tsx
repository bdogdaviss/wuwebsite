import { useEffect, useState, useCallback } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Spinner, styled } from 'tamagui'
import { Button } from '../../src/components/Button'
import { api } from '../../src/api/client'
import type { FocusSession } from '@wakeup/api-client'
import { discordColors } from '../../src/theme/colors'

const Container = styled(YStack, {
  flex: 1,
  backgroundColor: discordColors.bgPrimary,
})

const ActiveSessionCard = styled(YStack, {
  margin: 16,
  padding: 20,
  backgroundColor: discordColors.bgSecondary,
  borderRadius: 8,
  gap: 16,
})

const StatusBadge = styled(XStack, {
  alignItems: 'center',
  gap: 8,
})

const StatusDot = styled(YStack, {
  width: 10,
  height: 10,
  borderRadius: 5,
})

const SessionCard = styled(YStack, {
  backgroundColor: discordColors.bgSecondary,
  padding: 16,
  borderRadius: 8,
  marginBottom: 8,
})

const SectionHeader = styled(Text, {
  fontSize: 12,
  fontWeight: '700',
  color: discordColors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  paddingHorizontal: 16,
  marginBottom: 8,
})

export default function FocusScreen() {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [activeResponse, sessionsResponse] = await Promise.all([
        api.getActiveFocusSession(),
        api.listFocusSessions(10),
      ])
      setActiveSession(activeResponse.session)
      setSessions(sessionsResponse.sessions)
    } catch (error) {
      console.error('Failed to load focus data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData()
  }

  async function handleStartFocus() {
    setActionLoading(true)
    try {
      const session = await api.startFocusSession()
      setActiveSession(session)
      loadData()
    } catch (error) {
      console.error('Failed to start focus:', error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStopFocus() {
    setActionLoading(true)
    try {
      await api.stopFocusSession()
      setActiveSession(null)
      loadData()
    } catch (error) {
      console.error('Failed to stop focus:', error)
    } finally {
      setActionLoading(false)
    }
  }

  function formatDuration(startedAt: string, endedAt?: string | null): string {
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  if (isLoading) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Spinner size="large" color={discordColors.brandPrimary} />
      </Container>
    )
  }

  return (
    <Container>
      <ActiveSessionCard>
        <XStack alignItems="center" gap={12}>
          <YStack
            width={56}
            height={56}
            borderRadius={28}
            backgroundColor={activeSession ? discordColors.green : discordColors.bgModifierActive}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={28}>{activeSession ? '🎯' : '💤'}</Text>
          </YStack>
          <YStack flex={1} gap={4}>
            <StatusBadge>
              <StatusDot
                backgroundColor={activeSession ? discordColors.green : discordColors.statusOffline}
              />
              <Text fontSize={18} fontWeight="600" color={discordColors.textNormal}>
                {activeSession ? 'Focus Active' : 'Not Focusing'}
              </Text>
            </StatusBadge>
            {activeSession && (
              <Text fontSize={14} color={discordColors.textMuted}>
                Duration: {formatDuration(activeSession.started_at)} • Started{' '}
                {new Date(activeSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </YStack>
        </XStack>

        <Button
          variant={activeSession ? 'danger' : 'success'}
          size="large"
          fullWidth
          onPress={activeSession ? handleStopFocus : handleStartFocus}
          disabled={actionLoading}
        >
          {actionLoading ? (activeSession ? 'Stopping...' : 'Starting...') : activeSession ? 'Stop Focus' : 'Start Focus'}
        </Button>
      </ActiveSessionCard>

      <SectionHeader>Recent Sessions</SectionHeader>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />
        }
        renderItem={({ item }) => (
          <SessionCard>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap={4}>
                <Text fontWeight="600" fontSize={15} color={discordColors.textNormal}>
                  {new Date(item.started_at).toLocaleDateString()}
                </Text>
                <Text color={discordColors.textMuted} fontSize={13}>
                  {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </YStack>
              <YStack alignItems="flex-end" gap={4}>
                <Text fontWeight="600" fontSize={15} color={discordColors.textNormal}>
                  {formatDuration(item.started_at, item.ended_at)}
                </Text>
                <XStack alignItems="center" gap={6}>
                  <StatusDot
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={item.status === 'completed' ? discordColors.green : discordColors.yellow}
                  />
                  <Text fontSize={13} color={item.status === 'completed' ? discordColors.green : discordColors.yellow}>
                    {item.status}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </SessionCard>
        )}
        ListEmptyComponent={
          <YStack alignItems="center" padding={48} gap={12}>
            <Text fontSize={48}>📊</Text>
            <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No sessions yet</Text>
            <Text fontSize={14} color={discordColors.textMuted} textAlign="center">
              Start your first focus session to begin tracking
            </Text>
          </YStack>
        }
      />
    </Container>
  )
}
