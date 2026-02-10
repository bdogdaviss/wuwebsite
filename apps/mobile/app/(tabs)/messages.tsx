import { useEffect, useState, useCallback } from 'react'
import { FlatList, RefreshControl, Pressable, SectionList } from 'react-native'
import { YStack, XStack, Text, Spinner, Stack } from 'tamagui'
import { useAuth } from '../../src/auth/AuthContext'
import type { Conversation, Nest } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { useRouter } from 'expo-router'

export default function MessagesScreen() {
  const { user } = useAuth()
  const router = useRouter()
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

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData()
  }

  const getConversationName = (conv: Conversation): string => {
    if (conv.name) return conv.name
    if (conv.members) {
      const others = conv.members.filter((m) => m.id !== user?.id)
      if (others.length > 0) return others.map((m) => m.display_name).join(', ')
    }
    return 'Conversation'
  }

  const getConversationInitial = (conv: Conversation): string => {
    const name = getConversationName(conv)
    return name.charAt(0).toUpperCase()
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={discordColors.bgPrimary}>
        <Spinner size="large" color={discordColors.brandPrimary} />
      </YStack>
    )
  }

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
          <YStack backgroundColor={discordColors.bgPrimary} paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
            <Text
              fontSize={12}
              fontWeight="700"
              color={discordColors.textMuted}
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {section.title}
            </Text>
          </YStack>
        )}
        renderItem={({ item: entry }) => {
          if (entry.type === 'dm') {
            const conv = entry.item as Conversation
            const name = getConversationName(conv)
            const initial = getConversationInitial(conv)
            const isGroup = conv.type === 'group'
            return (
              <Pressable onPress={() => router.push(`/dm/${conv.id}`)}>
                <XStack
                  paddingHorizontal={16}
                  paddingVertical={12}
                  alignItems="center"
                  gap={12}
                  borderBottomWidth={1}
                  borderBottomColor={discordColors.border}
                >
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor={isGroup ? discordColors.green : discordColors.brandPrimary}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={16} color="white" fontWeight="600">{initial}</Text>
                  </Stack>
                  <YStack flex={1}>
                    <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{name}</Text>
                    <Text fontSize={13} color={discordColors.textMuted}>
                      {isGroup ? `${conv.members?.length || 0} members` : 'Direct Message'}
                    </Text>
                  </YStack>
                </XStack>
              </Pressable>
            )
          }

          // Nest item
          const nest = entry.item as Nest
          return (
            <Pressable onPress={() => router.push(`/nest/${nest.id}`)}>
              <XStack
                paddingHorizontal={16}
                paddingVertical={12}
                alignItems="center"
                gap={12}
                borderBottomWidth={1}
                borderBottomColor={discordColors.border}
              >
                <Stack
                  width={40}
                  height={40}
                  borderRadius={12}
                  backgroundColor={discordColors.brandPrimary}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={16} color="white" fontWeight="700">{nest.name.charAt(0).toUpperCase()}</Text>
                </Stack>
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight="600" color={discordColors.textNormal}>{nest.name}</Text>
                  <Text fontSize={13} color={discordColors.textMuted}>Nest</Text>
                </YStack>
              </XStack>
            </Pressable>
          )
        }}
        ListEmptyComponent={
          <YStack alignItems="center" padding={48} gap={12}>
            <Text fontSize={48}>💬</Text>
            <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No messages yet</Text>
            <Text fontSize={14} color={discordColors.textMuted} textAlign="center">
              Start a conversation with a friend or join a nest
            </Text>
          </YStack>
        }
      />
    </YStack>
  )
}
