import { useState, useEffect } from 'react'
import { Alert, Linking, ScrollView, Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import * as Notifications from 'expo-notifications'
import { useAuth } from '../../src/auth/AuthContext'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { MobileAvatar, AppCard, SectionHeader, Button } from '../../src/components'
import FontAwesome from '@expo/vector-icons/FontAwesome'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

type UserStatus = 'online' | 'idle' | 'dnd' | 'offline'

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string; icon: string }[] = [
  { value: 'online', label: 'Online', color: discordColors.statusOnline, icon: 'circle' },
  { value: 'idle', label: 'Idle', color: discordColors.statusIdle, icon: 'clock-o' },
  { value: 'dnd', label: 'Do Not Disturb', color: discordColors.statusDnd, icon: 'minus-circle' },
  { value: 'offline', label: 'Invisible', color: discordColors.statusOffline, icon: 'eye-slash' },
]

export default function MeScreen() {
  const { user, logout } = useAuth()
  const [notifStatus, setNotifStatus] = useState('checking...')
  const [currentStatus, setCurrentStatus] = useState<UserStatus>('online')
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => setNotifStatus(status))
  }, [])

  const requestNotifs = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    setNotifStatus(status)
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications in Settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ])
    }
  }

  const changeStatus = async (status: UserStatus) => {
    setStatusLoading(true)
    try { await api.updateStatus(status); setCurrentStatus(status) } catch {}
    setStatusLoading(false)
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ])
  }

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile card */}
        <YStack alignItems="center" paddingVertical={24} gap={10}>
          <MobileAvatar
            src={user?.avatar_url}
            fallback={user?.display_name || 'U'}
            size="xl"
            status={currentStatus}
          />
          <Text fontSize={22} fontWeight="700" color={discordColors.headerPrimary}>
            {user?.display_name || 'User'}
          </Text>
          <Text fontSize={14} color={discordColors.textMuted}>{user?.email}</Text>
        </YStack>

        {/* Status */}
        <SectionHeader title="Status" />
        <AppCard style={{ gap: 0, padding: 0 }}>
          {STATUS_OPTIONS.map((opt, i) => (
            <Pressable key={opt.value} onPress={() => changeStatus(opt.value)} disabled={statusLoading}>
              <XStack
                paddingHorizontal={16}
                paddingVertical={14}
                alignItems="center"
                gap={12}
                borderTopWidth={i > 0 ? 1 : 0}
                borderTopColor={discordColors.border}
              >
                <FontAwesome name={opt.icon as any} size={14} color={opt.color} />
                <Text flex={1} fontSize={15} fontWeight="500" color={discordColors.textNormal}>{opt.label}</Text>
                {currentStatus === opt.value && (
                  <FontAwesome name="check" size={16} color={discordColors.brandPrimary} />
                )}
              </XStack>
            </Pressable>
          ))}
        </AppCard>

        {/* Account */}
        <SectionHeader title="Account" />
        <AppCard style={{ gap: 0, padding: 0 }}>
          <InfoRow label="Display Name" value={user?.display_name || '-'} />
          <InfoRow label="Email" value={user?.email || '-'} border />
          <InfoRow label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'} border />
        </AppCard>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <AppCard style={{ gap: 0, padding: 0 }}>
          <XStack paddingHorizontal={16} paddingVertical={14} alignItems="center" justifyContent="space-between">
            <YStack gap={2}>
              <Text fontSize={15} fontWeight="500" color={discordColors.textNormal}>Push Notifications</Text>
              <Text fontSize={13} color={notifStatus === 'granted' ? discordColors.green : discordColors.textMuted}>
                {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Denied' : 'Not set up'}
              </Text>
            </YStack>
            {notifStatus !== 'granted' && (
              <Pressable onPress={requestNotifs} style={styles.enableBtn}>
                <Text fontSize={13} fontWeight="600" color="#fff">Enable</Text>
              </Pressable>
            )}
          </XStack>
        </AppCard>

        {/* Logout */}
        <YStack paddingHorizontal={16} paddingTop={32}>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <FontAwesome name="sign-out" size={18} color={discordColors.red} />
            <Text fontSize={16} fontWeight="600" color={discordColors.red}>Log Out</Text>
          </Pressable>
        </YStack>

        {/* Version */}
        <Text textAlign="center" fontSize={12} color={discordColors.textMuted} marginTop={24}>
          Wakeup v1.0.0
        </Text>
      </ScrollView>
    </YStack>
  )
}

function InfoRow({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <XStack
      paddingHorizontal={16}
      paddingVertical={14}
      justifyContent="space-between"
      alignItems="center"
      borderTopWidth={border ? 1 : 0}
      borderTopColor={discordColors.border}
    >
      <Text fontSize={14} color={discordColors.textMuted}>{label}</Text>
      <Text fontSize={14} fontWeight="600" color={discordColors.textNormal}>{value}</Text>
    </XStack>
  )
}

const styles = StyleSheet.create({
  enableBtn: {
    backgroundColor: discordColors.brandPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: discordColors.red,
  },
})
