import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet, Image, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { SafeScreen, MobileAvatar } from '../src/components'
import { useAuth } from '../src/auth/AuthContext'
import { discordColors } from '../src/theme/colors'
import type { Friendship, User } from '@wakeup/api-client'

const YOU_WAKE_KEY = 'wakeup-you-wake-ts'
const EXPIRY_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function shouldShowYouWake(): Promise<boolean> {
  const ts = await AsyncStorage.getItem(YOU_WAKE_KEY)
  if (!ts) return true
  return Date.now() - parseInt(ts, 10) > EXPIRY_MS
}

async function markYouWakeDone() {
  await AsyncStorage.setItem(YOU_WAKE_KEY, String(Date.now()))
}

interface FriendItem {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  isAwake: boolean
}

export default function YouWakeScreen() {
  const router = useRouter()
  const { api, user } = useAuth()
  const [friends, setFriends] = useState<FriendItem[]>([])
  const [loading, setLoading] = useState(false)
  const pulseAnim = useState(() => new Animated.Value(0.6))[0]

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
      ])
    ).start()
  }, [pulseAnim])

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const [friendsRes, onlineRes] = await Promise.all([
        api.listFriends(),
        api.getOnlineFriends(),
      ])
      const items = friendsRes.friends.map((f: Friendship) => {
        const friendUser = f.user
        const online = onlineRes.friends.find((o: User & { status: string }) => o.id === friendUser?.id)
        const isAwake = online != null && online.status !== 'offline'
        return {
          id: f.id,
          userId: f.requester_id === user?.id ? f.addressee_id : f.requester_id,
          name: friendUser?.display_name || 'Unknown',
          avatarUrl: friendUser?.avatar_url || undefined,
          isAwake,
        }
      })
      setFriends(items)
    } catch {
      // continue without friends data
    }
  }

  const handleAwake = async () => {
    setLoading(true)
    try { await api.updateStatus('online') } catch {}
    await markYouWakeDone()
    router.replace('/(tabs)')
  }

  const handleSleep = async () => {
    setLoading(true)
    try { await api.updateStatus('offline') } catch {}
    await markYouWakeDone()
    router.replace('/(tabs)')
  }

  const awakeFriends = friends.filter((f) => f.isAwake)
  const sleepingFriends = friends.filter((f) => !f.isAwake)

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoGlow, { opacity: pulseAnim }]} />
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>You Wake?</Text>
        <Text style={styles.subtitle}>See who's up right now</Text>

        {/* Friends list */}
        {friends.length > 0 && (
          <View style={styles.friendsList}>
            <FlatList
              data={[
                ...(awakeFriends.length > 0
                  ? [{ type: 'header' as const, label: `Awake — ${awakeFriends.length}`, color: discordColors.statusOnline }]
                  : []),
                ...awakeFriends.map((f) => ({ type: 'friend' as const, ...f })),
                ...(sleepingFriends.length > 0
                  ? [{ type: 'header' as const, label: `Sleeping — ${sleepingFriends.length}`, color: discordColors.textMuted }]
                  : []),
                ...sleepingFriends.map((f) => ({ type: 'friend' as const, ...f })),
              ]}
              keyExtractor={(item, i) => item.type === 'header' ? `h-${i}` : (item as FriendItem).id}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return (
                    <View style={styles.sectionRow}>
                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                      <Text style={styles.sectionText}>{item.label}</Text>
                    </View>
                  )
                }
                const f = item as FriendItem & { type: 'friend' }
                return (
                  <View style={styles.friendRow}>
                    <MobileAvatar
                      src={f.avatarUrl}
                      fallback={f.name}
                      size="sm"
                      status={f.isAwake ? 'online' : 'offline'}
                    />
                    <Text style={styles.friendName} numberOfLines={1}>{f.name}</Text>
                    <View style={[styles.badge, {
                      backgroundColor: f.isAwake ? 'rgba(68,162,91,0.15)' : 'rgba(116,127,141,0.15)',
                    }]}>
                      <Text style={[styles.badgeText, {
                        color: f.isAwake ? discordColors.statusOnline : discordColors.textMuted,
                      }]}>
                        {f.isAwake ? 'Awake' : 'Zzz'}
                      </Text>
                    </View>
                  </View>
                )
              }}
              style={{ maxHeight: 260 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable
            onPress={handleAwake}
            disabled={loading}
            style={[styles.btn, styles.awakeBtn]}
          >
            <FontAwesome name="sun-o" size={18} color="#fff" />
            <Text style={styles.btnText}>I'm Awake</Text>
          </Pressable>
          <Pressable
            onPress={handleSleep}
            disabled={loading}
            style={[styles.btn, styles.sleepBtn]}
          >
            <FontAwesome name="moon-o" size={18} color="#fff" />
            <Text style={styles.btnText}>Going Back to Sleep</Text>
          </Pressable>
        </View>
      </View>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: discordColors.bgPrimary,
  },
  logoWrap: { position: 'relative', marginBottom: 20 },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 60,
    backgroundColor: 'rgba(88,101,242,0.2)',
  },
  logo: { width: 64, height: 64, borderRadius: 32 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: discordColors.textMuted, marginBottom: 24 },
  friendsList: {
    width: '100%',
    backgroundColor: discordColors.bgSecondary,
    borderRadius: 12,
    padding: 6,
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: discordColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  friendName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: discordColors.textNormal,
  },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  buttons: { width: '100%', gap: 12 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  awakeBtn: { backgroundColor: '#44A25B' },
  sleepBtn: {
    backgroundColor: '#36393f',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  btnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
})
