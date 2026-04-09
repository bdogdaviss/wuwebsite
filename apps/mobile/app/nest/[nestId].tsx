import { useEffect, useState, useCallback } from 'react'
import { SectionList, Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import type { NestWithChannels, NestChannel } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { MobileAvatar, LoadingState, EmptyState, SectionHeader } from '../../src/components'
import { useResponsive } from '../../src/hooks/useResponsive'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function NestScreen() {
  const { nestId } = useLocalSearchParams<{ nestId: string }>()
  const navigation = useNavigation()
  const router = useRouter()
  const { px } = useResponsive()
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

  useEffect(() => { loadNest() }, [loadNest])

  if (isLoading) return <LoadingState />

  if (!nest) {
    return (
      <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
        <EmptyState
          icon={<FontAwesome name="warning" size={36} color={discordColors.textMuted} />}
          title="Nest not found"
        />
      </YStack>
    )
  }

  const categories = new Map<string, NestChannel[]>()
  for (const channel of nest.channels || []) {
    const cat = channel.category || 'General'
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(channel)
  }

  const sections = Array.from(categories.entries()).map(([title, data]) => ({
    title,
    data: data.sort((a, b) => a.position - b.position),
  }))

  return (
    <YStack flex={1} backgroundColor={discordColors.bgPrimary}>
      {/* Nest header */}
      <XStack backgroundColor={discordColors.bgSecondary} padding={px} alignItems="center" gap={12} borderBottomWidth={1} borderBottomColor={discordColors.border}>
        <MobileAvatar fallback={nest.name} size="lg" />
        <YStack flex={1}>
          <Text fontSize={18} fontWeight="700" color={discordColors.headerPrimary}>{nest.name}</Text>
          <Text fontSize={13} color={discordColors.textMuted}>{nest.members?.length || 0} members</Text>
        </YStack>
      </XStack>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} paddingHorizontal={px} />
        )}
        renderItem={({ item: channel }) => (
          <Pressable onPress={() => channel.type === 'text' && router.push(`/channel/${channel.id}`)}>
            <XStack paddingHorizontal={px} paddingVertical={12} alignItems="center" gap={10}>
              <FontAwesome
                name={channel.type === 'text' ? 'hashtag' : 'volume-up'}
                size={16}
                color={discordColors.textMuted}
              />
              <Text flex={1} fontSize={15} fontWeight="500" color={discordColors.textNormal}>{channel.name}</Text>
              {channel.type === 'text' && (
                <FontAwesome name="chevron-right" size={12} color={discordColors.textMuted} />
              )}
            </XStack>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<FontAwesome name="inbox" size={36} color={discordColors.textMuted} />}
            title="No channels yet"
          />
        }
      />
    </YStack>
  )
}
