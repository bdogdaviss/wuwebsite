import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { YStack, XStack, Text, Input, styled, ScrollView } from 'tamagui'
import { useAuth } from '../context/AuthContext'
import { useUIStore } from '../state/uiStore'
import type { NavKey } from '../models/nav'

const navItems = [
  { id: 'friends', label: 'Friends', route: '/', icon: 'users' },
  { id: 'discover', label: 'Discover', route: '/discover', icon: 'compass' },
  { id: 'rituals', label: 'Rituals', route: '/rituals', icon: 'moon' },
]

interface Command {
  id: string
  label: string
  description?: string
  action: () => void
  category: 'navigation' | 'action'
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
  width: 500,
  maxHeight: 400,
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

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { api } = useAuth()
  const { setActiveNavKey, toggleInfoPanel } = useUIStore()

  const commands: Command[] = [
    // Navigation commands
    ...navItems.map((item) => ({
      id: `nav-${item.id}`,
      label: `Go to ${item.label}`,
      description: item.route,
      category: 'navigation' as const,
      action: () => {
        setActiveNavKey(item.id as NavKey)
        navigate(item.route)
        onClose()
      },
    })),
    // Action commands
    {
      id: 'action-start-focus',
      label: 'Start Focus Session',
      description: 'Begin a new focus session',
      category: 'action',
      action: async () => {
        try {
          await api.startFocusSession()
          navigate('/focus')
          onClose()
        } catch (err) {
          console.error('Failed to start session:', err)
        }
      },
    },
    {
      id: 'action-stop-focus',
      label: 'Stop Focus Session',
      description: 'End the current focus session',
      category: 'action',
      action: async () => {
        try {
          await api.stopFocusSession()
          navigate('/focus')
          onClose()
        } catch (err) {
          console.error('Failed to stop session:', err)
        }
      },
    },
    {
      id: 'action-toggle-info',
      label: 'Toggle Info Panel',
      description: 'Show/hide the right info panel',
      category: 'action',
      action: () => {
        toggleInfoPanel()
        onClose()
      },
    },
  ]

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
      }
    },
    [isOpen, onClose, filteredCommands, selectedIndex]
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
            placeholder="Type a command..."
            value={query}
            onChangeText={setQuery}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
          />
        </XStack>

        <ScrollView maxHeight={300}>
          <YStack paddingVertical="$2">
            {filteredCommands.length === 0 ? (
              <Text color="$gray11" padding="$4" textAlign="center">
                No commands found
              </Text>
            ) : (
              filteredCommands.map((cmd, index) => (
                <CommandItem
                  key={cmd.id}
                  selected={index === selectedIndex}
                  onPress={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <YStack flex={1}>
                    <Text fontWeight="600">{cmd.label}</Text>
                    {cmd.description && (
                      <Text fontSize="$2" color="$gray11">
                        {cmd.description}
                      </Text>
                    )}
                  </YStack>
                  <Text fontSize="$1" color="$gray10" textTransform="uppercase">
                    {cmd.category}
                  </Text>
                </CommandItem>
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
        >
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
