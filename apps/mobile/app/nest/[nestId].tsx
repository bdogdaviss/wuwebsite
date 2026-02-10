import { useEffect, useState, useCallback } from 'react'
import { SectionList, Pressable } from 'react-native'
import { YStack, XStack, Text, Spinner, Stack } from 'tamagui'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import type { NestWithChannels, NestChannel } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'

interface ChannelSection {
  title: string
  data: NestChannel[]
}

export default function NestScreen() {
  const { nestId } = useLocalSearchParams<{ nestId: string }>()
  const navigation = useNavigation()
  const router = useRouter()
  const [nest, setNest] = useState<NestWithChannels | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadNest = useCallback(async () => {
    if (!nestId) return
    try {
      const data = await api.getNest(nestId)
      setNest(data)
      navigation.setOptions({ title: data.name })
    } catch (error) {
      console.error('Failed to load nest:', error)
    } finally {
      setIsLoading(false)
    }
  }, [nestId, navigation])

  useEffect(() => {
    loadNest()
  }, [loadNest])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={discordColors.bgPrimary}>
        <Spinner size="large" color={discordColors.brandPrimary} />
      </YStack>
    )
  }

  if (!nest) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={discordColors.bgPrimary}>
        <Text color={discordColors.textMuted}>Nest not found</Text>
      </YStack>
    )
  }

  // Group channels by category
  const categories = new Map<string, NestChannel[]>()
  for (const channel of nest.channels || []) {
    const cat = channel.category || 'General'
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(channel)
  }

  const sections: ChannelSection[] = Array.from(categories.entries())
    .map(([title, data]) => ({
      title,
      data: data.sort((a, b) => a.position - b.position),
    }))

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      {/* Nest header */}
      <YStack backgroundColor={discordColors.bgSecondary} padding={16} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        <XStack alignItems="center" gap={12}>
          <Stack
            width={48}
            height={48}
            borderRadius={16}
            backgroundColor={discordColors.brandPrimary}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20} color="white" fontWeight="700">{nest.name.charAt(0).toUpperCase()}</Text>
          </Stack>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="700" color={discordColors.textNormal}>{nest.name}</Text>
            <Text fontSize={13} color={discordColors.textMuted}>
              {nest.members?.length || 0} members
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={4}>
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
        renderItem={({ item: channel }) => (
          <Pressable
            onPress={() => {
              if (channel.type === 'text') {
                router.push(`/channel/${channel.id}`)
              }
            }}
          >
            <XStack
              paddingHorizontal={16}
              paddingVertical={10}
              alignItems="center"
              gap={8}
            >
              <Text fontSize={18} color={discordColors.textMuted}>
                {channel.type === 'text' ? '#' : '🔊'}
              </Text>
              <Text fontSize={15} color={discordColors.textNormal} fontWeight="500">
                {channel.name}
              </Text>
            </XStack>
          </Pressable>
        )}
        ListEmptyComponent={
          <YStack alignItems="center" padding={48} gap={12}>
            <Text fontSize={48}>📭</Text>
            <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No channels yet</Text>
          </YStack>
        }
      />
    </YStack>
  )
}
