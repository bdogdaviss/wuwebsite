import { useEffect, useState, useCallback } from 'react'
import { FlatList, RefreshControl, Pressable, Image } from 'react-native'
import { YStack, XStack, Text, Spinner, Stack } from 'tamagui'
import { useAuth } from '../../src/auth/AuthContext'
import type { Friendship, User } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { useRouter, useFocusEffect } from 'expo-router'

type Tab = 'online' | 'all' | 'pending'

export default function FriendsScreen() {
  const { user } = useAuth()
  const router = useRouter()
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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  // Listen for real-time WebSocket events
  const { socket } = useAuth()
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData()
  }

  const handleAccept = async (id: string) => {
    try {
      await api.acceptFriendRequest(id)
      loadData()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.rejectFriendRequest(id)
      loadData()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleStartDM = async (userId: string) => {
    try {
      const conv = await api.createDM(userId)
      router.push(`/dm/${conv.id}`)
    } catch (error) {
      console.error('Failed to create DM:', error)
    }
  }

  const getFriendUser = (friendship: Friendship): { id: string; name: string; avatar_url?: string | null } => {
    if (friendship.user) {
      return { id: friendship.user.id, name: friendship.user.display_name, avatar_url: friendship.user.avatar_url }
    }
    const friendId = friendship.requester_id === user?.id ? friendship.addressee_id : friendship.requester_id
    return { id: friendId, name: 'User' }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return discordColors.statusOnline
      case 'idle': return discordColors.statusIdle
      case 'dnd': return discordColors.statusDnd
      default: return discordColors.statusOffline
    }
  }

  const renderTabButton = (t: Tab, label: string, count?: number) => (
    <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1 }}>
      <YStack
        paddingVertical={10}
        alignItems="center"
        borderBottomWidth={2}
        borderBottomColor={tab === t ? discordColors.brandPrimary : 'transparent'}
      >
        <XStack alignItems="center" gap={6}>
          <Text
            fontSize={14}
            fontWeight="600"
            color={tab === t ? discordColors.textNormal : discordColors.textMuted}
          >
            {label}
          </Text>
          {count !== undefined && count > 0 && (
            <YStack
              backgroundColor={discordColors.brandPrimary}
              borderRadius={10}
              paddingHorizontal={6}
              paddingVertical={1}
              minWidth={20}
              alignItems="center"
            >
              <Text fontSize={11} fontWeight="700" color="white">{count}</Text>
            </YStack>
          )}
        </XStack>
      </YStack>
    </Pressable>
  )

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={discordColors.bgPrimary}>
        <Spinner size="large" color={discordColors.brandPrimary} />
      </YStack>
    )
  }

  const renderFriendItem = ({ item }: { item: Friendship }) => {
    const friend = getFriendUser(item)
    const onlineFriend = onlineFriends.find((f) => f.id === friend.id)
    const status = onlineFriend?.status || 'offline'
    return (
      <Pressable onPress={() => handleStartDM(friend.id)}>
        <XStack
          paddingHorizontal={16}
          paddingVertical={12}
          alignItems="center"
          gap={12}
          borderBottomWidth={1}
          borderBottomColor={discordColors.border}
        >
          <Stack position="relative">
            {friend.avatar_url ? (
              <Image source={{ uri: friend.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <Stack width={40} height={40} borderRadius={20} backgroundColor={discordColors.brandPrimary} alignItems="center" justifyContent="center">
                <Text fontSize={16} color="white" fontWeight="600">{friend.name.charAt(0).toUpperCase()}</Text>
              </Stack>
            )}
            <Stack
              position="absolute"
              bottom={0}
              right={0}
              width={14}
              height={14}
              borderRadius={7}
              backgroundColor={getStatusColor(status)}
              borderWidth={2}
              borderColor={discordColors.bgPrimary}
            />
          </Stack>
          <YStack flex={1}>
            <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{friend.name}</Text>
            <Text fontSize={13} color={discordColors.textMuted} textTransform="capitalize">{status}</Text>
          </YStack>
        </XStack>
      </Pressable>
    )
  }

  const renderOnlineItem = ({ item }: { item: User & { status: string } }) => (
    <Pressable onPress={() => handleStartDM(item.id)}>
      <XStack
        paddingHorizontal={16}
        paddingVertical={12}
        alignItems="center"
        gap={12}
        borderBottomWidth={1}
        borderBottomColor={discordColors.border}
      >
        <Stack position="relative">
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <Stack width={40} height={40} borderRadius={20} backgroundColor={discordColors.brandPrimary} alignItems="center" justifyContent="center">
              <Text fontSize={16} color="white" fontWeight="600">{item.display_name.charAt(0).toUpperCase()}</Text>
            </Stack>
          )}
          <Stack
            position="absolute"
            bottom={0}
            right={0}
            width={14}
            height={14}
            borderRadius={7}
            backgroundColor={getStatusColor(item.status)}
            borderWidth={2}
            borderColor={discordColors.bgPrimary}
          />
        </Stack>
        <YStack flex={1}>
          <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{item.display_name}</Text>
          <Text fontSize={13} color={discordColors.textMuted} textTransform="capitalize">{item.status}</Text>
        </YStack>
      </XStack>
    </Pressable>
  )

  const renderPendingItem = ({ item }: { item: Friendship }) => {
    const isIncoming = item.addressee_id === user?.id
    const friend = getFriendUser(item)
    return (
      <XStack
        paddingHorizontal={16}
        paddingVertical={12}
        alignItems="center"
        gap={12}
        borderBottomWidth={1}
        borderBottomColor={discordColors.border}
      >
        {friend.avatar_url ? (
          <Image source={{ uri: friend.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Stack width={40} height={40} borderRadius={20} backgroundColor={discordColors.bgModifierActive} alignItems="center" justifyContent="center">
            <Text fontSize={16} color={discordColors.textMuted} fontWeight="600">{friend.name.charAt(0).toUpperCase()}</Text>
          </Stack>
        )}
        <YStack flex={1}>
          <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{friend.name}</Text>
          <Text fontSize={13} color={discordColors.textMuted}>
            {isIncoming ? 'Incoming request' : 'Outgoing request'}
          </Text>
        </YStack>
        {isIncoming && (
          <XStack gap={8}>
            <Pressable onPress={() => handleAccept(item.id)}>
              <Stack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={discordColors.green}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={18} color="white">✓</Text>
              </Stack>
            </Pressable>
            <Pressable onPress={() => handleReject(item.id)}>
              <Stack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={discordColors.red}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={18} color="white">✕</Text>
              </Stack>
            </Pressable>
          </XStack>
        )}
      </XStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      {/* Tab bar */}
      <XStack backgroundColor={discordColors.bgSecondary} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        {renderTabButton('online', 'Online', onlineFriends.length)}
        {renderTabButton('all', 'All', friends.length)}
        {renderTabButton('pending', 'Pending', pending.length)}
      </XStack>

      {tab === 'online' && (
        <FlatList
          data={onlineFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderOnlineItem}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />}
          ListEmptyComponent={
            <YStack alignItems="center" padding={48} gap={12}>
              <Text fontSize={48}>😴</Text>
              <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No one's online</Text>
              <Text fontSize={14} color={discordColors.textMuted} textAlign="center">Your friends will appear here when they're online</Text>
            </YStack>
          }
        />
      )}

      {tab === 'all' && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />}
          ListEmptyComponent={
            <YStack alignItems="center" padding={48} gap={12}>
              <Text fontSize={48}>👋</Text>
              <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No friends yet</Text>
              <Text fontSize={14} color={discordColors.textMuted} textAlign="center">Add friends to start chatting</Text>
            </YStack>
          }
        />
      )}

      {tab === 'pending' && (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          renderItem={renderPendingItem}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />}
          ListEmptyComponent={
            <YStack alignItems="center" padding={48} gap={12}>
              <Text fontSize={48}>📬</Text>
              <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No pending requests</Text>
              <Text fontSize={14} color={discordColors.textMuted} textAlign="center">Friend requests will appear here</Text>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
