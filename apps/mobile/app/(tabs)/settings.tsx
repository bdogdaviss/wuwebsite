import { useState, useEffect } from 'react'
import { Alert, Linking, ScrollView, Pressable } from 'react-native'
import { YStack, XStack, Text, styled } from 'tamagui'
import { Button } from '../../src/components/Button'
import * as Notifications from 'expo-notifications'
import { useAuth } from '../../src/auth/AuthContext'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const Container = styled(YStack, {
  flex: 1,
  backgroundColor: discordColors.bgPrimary,
})

const Section = styled(YStack, {
  gap: 12,
  marginBottom: 24,
})

const SectionTitle = styled(Text, {
  fontSize: 12,
  fontWeight: '700',
  color: discordColors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  paddingHorizontal: 16,
})

const Card = styled(YStack, {
  backgroundColor: discordColors.bgSecondary,
  marginHorizontal: 16,
  borderRadius: 8,
  overflow: 'hidden',
})

const CardRow = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 14,
})

const Divider = styled(YStack, {
  height: 1,
  backgroundColor: discordColors.border,
  marginHorizontal: 16,
})

const StatusDot = styled(YStack, {
  width: 8,
  height: 8,
  borderRadius: 4,
})

type UserStatus = 'online' | 'idle' | 'dnd' | 'offline'

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string }[] = [
  { value: 'online', label: 'Online', color: discordColors.statusOnline },
  { value: 'idle', label: 'Idle', color: discordColors.statusIdle },
  { value: 'dnd', label: 'Do Not Disturb', color: discordColors.statusDnd },
  { value: 'offline', label: 'Invisible', color: discordColors.statusOffline },
]

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const [notificationStatus, setNotificationStatus] = useState<string>('checking...')
  const [currentStatus, setCurrentStatus] = useState<UserStatus>('online')
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    checkNotificationPermissions()
  }, [])

  async function checkNotificationPermissions() {
    const { status } = await Notifications.getPermissionsAsync()
    setNotificationStatus(status)
  }

  async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync()
    setNotificationStatus(status)
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications in your device settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ])
    }
  }

  async function sendTestNotification() {
    if (notificationStatus !== 'granted') {
      await requestNotificationPermissions()
      return
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'WakeUp Test', body: 'This is a test notification!', sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    })
    Alert.alert('Notification Scheduled', 'You will receive a test notification in 3 seconds.')
  }

  async function handleStatusChange(status: UserStatus) {
    setStatusLoading(true)
    try {
      await api.updateStatus(status)
      setCurrentStatus(status)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ])
  }

  const getNotifColor = () => {
    if (notificationStatus === 'granted') return discordColors.green
    if (notificationStatus === 'denied') return discordColors.red
    return discordColors.yellow
  }

  const getNotifText = () => {
    if (notificationStatus === 'granted') return 'Enabled'
    if (notificationStatus === 'denied') return 'Denied'
    if (notificationStatus === 'undetermined') return 'Not Requested'
    return notificationStatus
  }

  return (
    <Container>
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        {/* Status Picker */}
        <Section>
          <SectionTitle>Status</SectionTitle>
          <Card>
            {STATUS_OPTIONS.map((opt, i) => (
              <Pressable key={opt.value} onPress={() => handleStatusChange(opt.value)} disabled={statusLoading}>
                <>
                  {i > 0 && <Divider />}
                  <CardRow>
                    <XStack alignItems="center" gap={10}>
                      <StatusDot backgroundColor={opt.color} />
                      <Text fontSize={14} fontWeight="500" color={discordColors.textNormal}>{opt.label}</Text>
                    </XStack>
                    {currentStatus === opt.value && (
                      <Text fontSize={16} color={discordColors.brandPrimary}>✓</Text>
                    )}
                  </CardRow>
                </>
              </Pressable>
            ))}
          </Card>
        </Section>

        {/* Account */}
        <Section>
          <SectionTitle>Account</SectionTitle>
          <Card>
            <CardRow>
              <Text color={discordColors.textMuted} fontSize={14}>Display Name</Text>
              <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>{user?.display_name || 'Unknown'}</Text>
            </CardRow>
            <Divider />
            <CardRow>
              <Text color={discordColors.textMuted} fontSize={14}>Email</Text>
              <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>{user?.email || 'Unknown'}</Text>
            </CardRow>
            <Divider />
            <CardRow>
              <Text color={discordColors.textMuted} fontSize={14}>Member Since</Text>
              <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </Text>
            </CardRow>
          </Card>
        </Section>

        {/* Notifications */}
        <Section>
          <SectionTitle>Notifications</SectionTitle>
          <Card>
            <CardRow>
              <YStack gap={2}>
                <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>Permission Status</Text>
                <XStack alignItems="center" gap={6}>
                  <StatusDot backgroundColor={getNotifColor()} />
                  <Text fontSize={13} color={getNotifColor()}>{getNotifText()}</Text>
                </XStack>
              </YStack>
              {notificationStatus !== 'granted' && (
                <Button variant="primary" size="small" onPress={requestNotificationPermissions}>Enable</Button>
              )}
            </CardRow>
            <Divider />
            <YStack padding={16}>
              <Button variant="secondary" onPress={sendTestNotification}>Send Test Notification</Button>
            </YStack>
          </Card>
        </Section>

        {/* About */}
        <Section>
          <SectionTitle>About</SectionTitle>
          <Card>
            <CardRow>
              <Text color={discordColors.textMuted} fontSize={14}>Version</Text>
              <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>1.0.0</Text>
            </CardRow>
            <Divider />
            <CardRow>
              <Text color={discordColors.textMuted} fontSize={14}>Build</Text>
              <Text fontWeight="600" fontSize={14} color={discordColors.textNormal}>Social</Text>
            </CardRow>
          </Card>
        </Section>

        {/* Logout */}
        <Section>
          <YStack paddingHorizontal={16}>
            <Button variant="danger" onPress={handleLogout}>Logout</Button>
          </YStack>
        </Section>
      </ScrollView>
    </Container>
  )
}
