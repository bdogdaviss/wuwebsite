import { useEffect, useState, useCallback } from 'react'
import { FlatList, RefreshControl, Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useAuth } from '../../src/auth/AuthContext'
import type { Friendship, User } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { useRouter, useFocusEffect } from 'expo-router'
import { MobileAvatar, LoadingState, EmptyState } from '../../src/components'
import { useResponsive } from '../../src/hooks/useResponsive'
import FontAwesome from '@expo/vector-icons/FontAwesome'

type Tab = 'online' | 'all' | 'pending'

export default function FriendsScreen() {
  const { user, socket } = useAuth()
  const router = useRouter()
  const { px, avatarSize } = useResponsive()
  const [tab, setTab] = useState<Tab>('online')
  const [friends, setFriends] = useState<Friendship[]>([])
  const [pending, setPending] = useState<Friendship[]>([])
  const [onlineFriends, setOnlineFriends] = useState<(User & { status: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    const results = await Promise.allSettled([
      api.listFriends(),
      api.listPendingRequests(),
      api.getOnlineFriends(),
    ])
    if (results[0].status === 'fulfilled') setFriends(results[0].value.friends)
    if (results[1].status === 'fulfilled') setPending(results[1].value.friends)
    if (results[2].status === 'fulfilled') setOnlineFriends(results[2].value.friends)
    setIsLoading(false)
    setIsRefreshing(false)
  }, [])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  useEffect(() => {
    if (!socket) return
    const refresh = () => loadData()
    socket.on('status.update', refresh)
    socket.on('friend.accepted', refresh)
    socket.on('friend.request', refresh)
    return () => {
      socket.off('status.update', refresh)
      socket.off('friend.accepted', refresh)
      socket.off('friend.request', refresh)
    }
  }, [socket, loadData])

  const handleRefresh = () => { setIsRefreshing(true); loadData() }

  const handleAccept = async (id: string) => {
    try { await api.acceptFriendRequest(id); loadData() } catch {}
  }

  const handleReject = async (id: string) => {
    try { await api.rejectFriendRequest(id); loadData() } catch {}
  }

  const handleStartDM = async (userId: string) => {
    try {
      const conv = await api.createDM(userId)
      router.push(`/dm/${conv.id}`)
    } catch {}
  }

  const getFriend = (f: Friendship) => {
    if (f.user) return { id: f.user.id, name: f.user.display_name, avatar: f.user.avatar_url }
    const friendId = f.requester_id === user?.id ? f.addressee_id : f.requester_id
    return { id: friendId, name: 'User', avatar: undefined }
  }

  const getStatus = (userId: string) => onlineFriends.find((f) => f.id === userId)?.status || 'offline'

  if (isLoading) return <LoadingState />

  const tabBtn = (t: Tab, label: string, count?: number) => (
    <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1 }}>
      <YStack
        paddingVertical={10}
        alignItems="center"
        borderBottomWidth={2}
        borderBottomColor={tab === t ? discordColors.brandPrimary : 'transparent'}
      >
        <XStack alignItems="center" gap={6}>
          <Text fontSize={14} fontWeight="600" color={tab === t ? discordColors.textNormal : discordColors.textMuted}>
            {label}
          </Text>
          {count !== undefined && count > 0 && (
            <YStack backgroundColor={discordColors.brandPrimary} borderRadius={10} paddingHorizontal={6} paddingVertical={1} minWidth={20} alignItems="center">
              <Text fontSize={11} fontWeight="700" color="white">{count}</Text>
            </YStack>
          )}
        </XStack>
      </YStack>
    </Pressable>
  )

  const renderFriend = ({ item }: { item: Friendship }) => {
    const f = getFriend(item)
    const status = getStatus(f.id) as 'online' | 'idle' | 'dnd' | 'offline'
    return (
      <Pressable onPress={() => handleStartDM(f.id)}>
        <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
          <MobileAvatar src={f.avatar} fallback={f.name} size="md" status={status} />
          <YStack flex={1}>
            <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{f.name}</Text>
            <Text fontSize={13} color={discordColors.textMuted} textTransform="capitalize">{status}</Text>
          </YStack>
        </XStack>
      </Pressable>
    )
  }

  const renderOnline = ({ item }: { item: User & { status: string } }) => (
    <Pressable onPress={() => handleStartDM(item.id)}>
      <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        <MobileAvatar src={item.avatar_url} fallback={item.display_name} size="md" status={item.status as any} />
        <YStack flex={1}>
          <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{item.display_name}</Text>
          <Text fontSize={13} color={discordColors.textMuted} textTransform="capitalize">{item.status}</Text>
        </YStack>
      </XStack>
    </Pressable>
  )

  const renderPending = ({ item }: { item: Friendship }) => {
    const isIncoming = item.addressee_id === user?.id
    const f = getFriend(item)
    return (
      <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        <MobileAvatar src={f.avatar} fallback={f.name} size="md" />
        <YStack flex={1}>
          <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{f.name}</Text>
          <Text fontSize={13} color={discordColors.textMuted}>{isIncoming ? 'Incoming request' : 'Outgoing request'}</Text>
        </YStack>
        {isIncoming && (
          <XStack gap={8}>
            <Pressable onPress={() => handleAccept(item.id)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: discordColors.green, alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesome name="check" size={16} color="#fff" />
            </Pressable>
            <Pressable onPress={() => handleReject(item.id)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: discordColors.red, alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesome name="close" size={16} color="#fff" />
            </Pressable>
          </XStack>
        )}
      </XStack>
    )
  }

  const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      <XStack backgroundColor={discordColors.bgSecondary} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        {tabBtn('online', 'Online', onlineFriends.length)}
        {tabBtn('all', 'All', friends.length)}
        {tabBtn('pending', 'Pending', pending.length)}
      </XStack>

      {tab === 'online' && (
        <FlatList data={onlineFriends} keyExtractor={(i) => i.id} renderItem={renderOnline} refreshControl={refreshControl}
          ListEmptyComponent={<EmptyState icon={<FontAwesome name="moon-o" size={36} color={discordColors.textMuted} />} title="No one's online" subtitle="Your friends will appear here when they're awake" />} />
      )}
      {tab === 'all' && (
        <FlatList data={friends} keyExtractor={(i) => i.id} renderItem={renderFriend} refreshControl={refreshControl}
          ListEmptyComponent={<EmptyState icon={<FontAwesome name="user-plus" size={36} color={discordColors.textMuted} />} title="No friends yet" subtitle="Add friends to start chatting" />} />
      )}
      {tab === 'pending' && (
        <FlatList data={pending} keyExtractor={(i) => i.id} renderItem={renderPending} refreshControl={refreshControl}
          ListEmptyComponent={<EmptyState icon={<FontAwesome name="envelope-o" size={36} color={discordColors.textMuted} />} title="No pending requests" subtitle="Friend requests will appear here" />} />
      )}
    </YStack>
  )
}
