import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { YStack, XStack, Text, Input, styled, ScrollView } from 'tamagui'
import { useAuth } from '../context/AuthContext'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { useMessageStore } from '../state/messageStore'
import { useSocialStore } from '../state/socialStore'
import Fuse from 'fuse.js'
import {
  Users,
  Compass,
  Moon,
  Hash,
  AtSign,
  User,
  MessageCircle,
  Layers,
  Activity,
  Clock,
} from 'lucide-react'

interface SearchableItem {
  id: string
  type: 'nest' | 'channel' | 'conversation' | 'user' | 'command'
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
  category: string
}

const Overlay = styled(YStack, {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  alignItems: 'center',
  paddingTop: 100,
  zIndex: 1000,
})

const PaletteContainer = styled(YStack, {
  width: 600,
  maxHeight: 500,
  backgroundColor: '$background',
  borderRadius: '$4',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
})

const CommandItem = styled(XStack, {
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  cursor: 'pointer',
  alignItems: 'center',
  gap: '$3',
  hoverStyle: {
    backgroundColor: '$gray3',
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '$blue4',
      },
    },
  } as const,
})

const CategoryHeader = styled(Text, {
  fontSize: '$2',
  fontWeight: '600',
  color: '$gray11',
  textTransform: 'uppercase',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  paddingTop: '$3',
})

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const RECENT_COMMANDS_KEY = 'wakeup-recent-commands'
const MAX_RECENT_COMMANDS = 5

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommandIds, setRecentCommandIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { api, user } = useAuth()
  const { setActiveNavKey, toggleInfoPanel, setActiveNest, setActiveChannel } = useUIStore()
  const { nests, nestDetails } = useNestStore()
  const { conversations } = useMessageStore()
  const { friends } = useSocialStore()

  // Load recent commands from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_COMMANDS_KEY)
    if (stored) {
      try {
        setRecentCommandIds(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  // Save command to recent history
  const saveToRecent = useCallback((commandId: string) => {
    setRecentCommandIds((prev) => {
      const updated = [commandId, ...prev.filter((id) => id !== commandId)].slice(0, MAX_RECENT_COMMANDS)
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Build searchable items
  const allItems = useMemo<SearchableItem[]>(() => {
    const items: SearchableItem[] = []

    // Nests
    nests.forEach((nest) => {
      items.push({
        id: `nest-${nest.id}`,
        type: 'nest',
        title: nest.name,
        subtitle: 'Nest',
        icon: <Layers size={20} />,
        category: 'Nests',
        action: () => {
          setActiveNest(nest.id)
          const firstChannel = nestDetails[nest.id]?.channels?.find((c) => c.type === 'text')
          if (firstChannel) {
            setActiveChannel(firstChannel.id)
            navigate(`/nest/${nest.id}/${firstChannel.id}`)
          }
          saveToRecent(`nest-${nest.id}`)
          onClose()
        },
      })
    })

    // Channels from all nests
    Object.values(nestDetails).forEach((nestDetail) => {
      nestDetail.channels?.forEach((channel) => {
        items.push({
          id: `channel-${channel.id}`,
          type: 'channel',
          title: `#${channel.name}`,
          subtitle: nestDetail.name,
          icon: <Hash size={20} />,
          category: 'Channels',
          action: () => {
            setActiveChannel(channel.id)
            navigate(`/nest/${nestDetail.id}/${channel.id}`)
            saveToRecent(`channel-${channel.id}`)
            onClose()
          },
        })
      })
    })

    // DM Conversations
    conversations.forEach((conv) => {
      const otherMembers = conv.members?.filter((m) => m.id !== user?.id) || []
      const name = conv.type === 'group'
        ? (conv.name || otherMembers.map((m) => m.display_name).join(', ') || 'Group')
        : (otherMembers[0]?.display_name || 'Unknown')

      items.push({
        id: `conversation-${conv.id}`,
        type: 'conversation',
        title: name,
        subtitle: conv.type === 'group' ? `${conv.members?.length || 0} members` : 'Direct Message',
        icon: <MessageCircle size={20} />,
        category: 'Messages',
        action: () => {
          navigate(`/dm/${conv.id}`)
          saveToRecent(`conversation-${conv.id}`)
          onClose()
        },
      })
    })

    // Friends
    friends.forEach((friend) => {
      items.push({
        id: `user-${friend.id}`,
        type: 'user',
        title: friend.display_name,
        subtitle: 'Friend',
        icon: <User size={20} />,
        category: 'Friends',
        action: () => {
          // Try to find existing DM conversation
          const existingConv = conversations.find((c) =>
            c.type === 'dm' &&
            c.members?.some((m) => m.id === friend.id) &&
            c.members?.some((m) => m.id === user?.id)
          )
          if (existingConv) {
            navigate(`/dm/${existingConv.id}`)
          } else {
            // Would need to create conversation - for now just go to friends
            navigate('/')
          }
          saveToRecent(`user-${friend.id}`)
          onClose()
        },
      })
    })

    // Commands
    items.push(
      {
        id: 'command-friends',
        type: 'command',
        title: 'Go to Friends',
        subtitle: '/',
        icon: <Users size={20} />,
        category: 'Commands',
        action: () => {
          setActiveNavKey('overview')
          navigate('/')
          saveToRecent('command-friends')
          onClose()
        },
      },
      {
        id: 'command-discover',
        type: 'command',
        title: 'Go to Discover',
        subtitle: '/discover',
        icon: <Compass size={20} />,
        category: 'Commands',
        action: () => {
          setActiveNavKey('discover')
          navigate('/discover')
          saveToRecent('command-discover')
          onClose()
        },
      },
      {
        id: 'command-rituals',
        type: 'command',
        title: 'Go to Rituals',
        subtitle: '/rituals',
        icon: <Moon size={20} />,
        category: 'Commands',
        action: () => {
          setActiveNavKey('rituals')
          navigate('/rituals')
          saveToRecent('command-rituals')
          onClose()
        },
      },
      {
        id: 'command-start-focus',
        type: 'command',
        title: 'Start Focus Session',
        subtitle: 'Begin a new focus session',
        icon: <Activity size={20} />,
        category: 'Commands',
        action: async () => {
          try {
            await api.startFocusSession()
            navigate('/focus')
            saveToRecent('command-start-focus')
            onClose()
          } catch (err) {
            console.error('Failed to start session:', err)
          }
        },
      },
      {
        id: 'command-stop-focus',
        type: 'command',
        title: 'Stop Focus Session',
        subtitle: 'End the current focus session',
        icon: <Activity size={20} />,
        category: 'Commands',
        action: async () => {
          try {
            await api.stopFocusSession()
            navigate('/focus')
            saveToRecent('command-stop-focus')
            onClose()
          } catch (err) {
            console.error('Failed to stop session:', err)
          }
        },
      },
      {
        id: 'command-toggle-info',
        type: 'command',
        title: 'Toggle Info Panel',
        subtitle: 'Show/hide the right info panel',
        icon: <Users size={20} />,
        category: 'Commands',
        action: () => {
          toggleInfoPanel()
          saveToRecent('command-toggle-info')
          onClose()
        },
      }
    )

    return items
  }, [nests, nestDetails, conversations, friends, user, navigate, setActiveNavKey, setActiveNest, setActiveChannel, toggleInfoPanel, api, saveToRecent, onClose])

  // Fuzzy search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ['title', 'subtitle'],
        threshold: 0.3,
        includeScore: true,
      }),
    [allItems]
  )

  // Filter and sort results
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands when no query
      const recent = recentCommandIds
        .map((id) => allItems.find((item) => item.id === id))
        .filter((item): item is SearchableItem => item !== undefined)

      if (recent.length > 0) {
        return [{ category: 'Recent', items: recent }]
      }

      // Show all commands grouped by category
      const grouped = allItems.reduce((acc, item) => {
        const existing = acc.find((g) => g.category === item.category)
        if (existing) {
          existing.items.push(item)
        } else {
          acc.push({ category: item.category, items: [item] })
        }
        return acc
      }, [] as Array<{ category: string; items: SearchableItem[] }>)

      return grouped
    }

    // Fuzzy search
    const results = fuse.search(query)
    const items = results.map((r) => r.item)

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const existing = acc.find((g) => g.category === item.category)
      if (existing) {
        existing.items.push(item)
      } else {
        acc.push({ category: item.category, items: [item] })
      }
      return acc
    }, [] as Array<{ category: string; items: SearchableItem[] }>)

    return grouped
  }, [query, allItems, fuse, recentCommandIds])

  // Flatten for keyboard navigation
  const flatResults = useMemo(() => {
    return filteredItems.flatMap((group) => group.items)
  }, [filteredItems])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatResults[selectedIndex]) {
            flatResults[selectedIndex].action()
          }
          break
      }
    },
    [isOpen, onClose, flatResults, selectedIndex]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <Overlay onPress={onClose}>
      <PaletteContainer onPress={(e: React.MouseEvent) => e.stopPropagation()}>
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="$gray6"
        >
          <Input
            ref={inputRef as any}
            flex={1}
            placeholder="Search channels, DMs, users, or commands..."
            value={query}
            onChangeText={setQuery}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
          />
        </XStack>

        <ScrollView maxHeight={380}>
          <YStack paddingVertical="$2">
            {flatResults.length === 0 ? (
              <Text color="$gray11" padding="$4" textAlign="center">
                No results found
              </Text>
            ) : (
              filteredItems.map((group) => (
                <YStack key={group.category}>
                  <CategoryHeader>{group.category}</CategoryHeader>
                  {group.items.map((item) => {
                    const globalIndex = flatResults.indexOf(item)
                    return (
                      <CommandItem
                        key={item.id}
                        selected={globalIndex === selectedIndex}
                        onPress={() => item.action()}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        {item.icon}
                        <YStack flex={1}>
                          <Text fontWeight="600">{item.title}</Text>
                          {item.subtitle && (
                            <Text fontSize="$2" color="$gray11">
                              {item.subtitle}
                            </Text>
                          )}
                        </YStack>
                      </CommandItem>
                    )
                  })}
                </YStack>
              ))
            )}
          </YStack>
        </ScrollView>

        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderTopWidth={1}
          borderTopColor="$gray6"
          gap="$4"
          alignItems="center"
        >
          <XStack alignItems="center" gap="$2">
            <Clock size={12} />
            <Text fontSize="$1" color="$gray10">
              {flatResults.length} results
            </Text>
          </XStack>
          <Text fontSize="$1" color="$gray10">
            <Text fontFamily="$mono">{'\u2191\u2193'}</Text> navigate
          </Text>
          <Text fontSize="$1" color="$gray10">
            <Text fontFamily="$mono">{'\u21B5'}</Text> select
          </Text>
          <Text fontSize="$1" color="$gray10">
            <Text fontFamily="$mono">esc</Text> close
          </Text>
        </XStack>
      </PaletteContainer>
    </Overlay>
  )
}
