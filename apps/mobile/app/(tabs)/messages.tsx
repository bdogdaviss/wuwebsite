import { useEffect, useState, useCallback } from 'react'
import { RefreshControl, Pressable, SectionList } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useAuth } from '../../src/auth/AuthContext'
import type { Conversation, Nest } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { useRouter } from 'expo-router'
import { MobileAvatar, LoadingState, EmptyState, SectionHeader } from '../../src/components'
import { useResponsive } from '../../src/hooks/useResponsive'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function MessagesScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { px } = useResponsive()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [nests, setNests] = useState<Nest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    const results = await Promise.allSettled([
      api.listConversations(),
      api.listNests(),
    ])
    if (results[0].status === 'fulfilled') setConversations(results[0].value.conversations)
    if (results[1].status === 'fulfilled') setNests(results[1].value.nests)
    setIsLoading(false)
    setIsRefreshing(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = () => { setIsRefreshing(true); loadData() }

  const getConvName = (conv: Conversation) => {
    if (conv.name) return conv.name
    const others = conv.members?.filter((m) => m.id !== user?.id) || []
    return others.map((m) => m.display_name).join(', ') || 'Conversation'
  }

  const getConvAvatar = (conv: Conversation) => {
    const others = conv.members?.filter((m) => m.id !== user?.id) || []
    return others[0]?.avatar_url || undefined
  }

  if (isLoading) return <LoadingState />

  const sections = [
    ...(conversations.length > 0 ? [{ title: 'Direct Messages', data: conversations.map((c) => ({ type: 'dm' as const, item: c })) }] : []),
    ...(nests.length > 0 ? [{ title: 'Nests', data: nests.map((n) => ({ type: 'nest' as const, item: n })) }] : []),
  ]

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={discordColors.textMuted} />}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} paddingHorizontal={px} />
        )}
        renderItem={({ item: entry }) => {
          if (entry.type === 'dm') {
            const conv = entry.item as Conversation
            const name = getConvName(conv)
            const isGroup = conv.type === 'group'
            return (
              <Pressable onPress={() => router.push(`/dm/${conv.id}`)}>
                <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
                  <MobileAvatar src={getConvAvatar(conv)} fallback={name} size="md" />
                  <YStack flex={1}>
                    <Text fontSize={15} fontWeight="600" color={discordColors.textNormal} numberOfLines={1}>{name}</Text>
                    <Text fontSize={13} color={discordColors.textMuted}>
                      {isGroup ? `${conv.members?.length || 0} members` : 'Direct Message'}
                    </Text>
                  </YStack>
                  <FontAwesome name="chevron-right" size={12} color={discordColors.textMuted} />
                </XStack>
              </Pressable>
            )
          }

          const nest = entry.item as Nest
          return (
            <Pressable onPress={() => router.push(`/nest/${nest.id}`)}>
              <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
                <MobileAvatar fallback={nest.name} size="md" />
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight="600" color={discordColors.textNormal} numberOfLines={1}>{nest.name}</Text>
                  <Text fontSize={13} color={discordColors.textMuted}>Nest</Text>
                </YStack>
                <FontAwesome name="chevron-right" size={12} color={discordColors.textMuted} />
              </XStack>
            </Pressable>
          )
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<FontAwesome name="comment-o" size={36} color={discordColors.textMuted} />}
            title="No messages yet"
            subtitle="Start a conversation with a friend or join a nest"
          />
        }
      />
    </YStack>
  )
}
