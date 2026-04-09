import { useEffect, useState, useCallback, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/auth/AuthContext'
import type { Message, Conversation } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { ChatInput, MobileAvatar, EmptyState } from '../../src/components'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function DMChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, socket } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const loadConversation = useCallback(async () => {
    if (!id) return
    try {
      const conv = await api.getConversation(id)
      setConversation(conv)
      const others = conv.members?.filter((m) => m.id !== user?.id)
      const title = conv.name || others?.map((m) => m.display_name).join(', ') || 'Chat'
      navigation.setOptions({ title })
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }, [id, user?.id, navigation])

  const loadMessages = useCallback(async () => {
    if (!id) return
    try {
      const res = await api.listMessages(id)
      setMessages(res.messages.reverse())
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [id])

  useEffect(() => {
    loadConversation()
    loadMessages()
  }, [loadConversation, loadMessages])

  useEffect(() => {
    if (!socket || !id) return
    const handleNewMessage = (data: unknown) => {
      const msg = data as Message
      if (msg.conversation_id === id) {
        setMessages((prev) => [...prev, msg])
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      }
    }
    socket.on('message.new', handleNewMessage)
    return () => { socket.off('message.new', handleNewMessage) }
  }, [socket, id])

  const handleSend = async () => {
    if (!inputText.trim() || !id || isSending) return
    setIsSending(true)
    const text = inputText.trim()
    setInputText('')
    try {
      const msg = await api.sendMessage(id, text)
      setMessages((prev) => [...prev, msg])
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error) {
      console.error('Failed to send message:', error)
      setInputText(text)
    } finally {
      setIsSending(false)
    }
  }

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender_id === user?.id
    const senderName = item.sender?.display_name || (isMe ? 'You' : 'User')
    const showHeader = index === 0 || messages[index - 1]?.sender_id !== item.sender_id
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return (
      <XStack paddingHorizontal={12} paddingTop={showHeader ? 12 : 2} gap={10}>
        {showHeader ? (
          <MobileAvatar
            src={isMe ? user?.avatar_url : item.sender?.avatar_url}
            fallback={senderName}
            size="sm"
          />
        ) : (
          <YStack width={32} />
        )}
        <YStack flex={1}>
          {showHeader && (
            <XStack alignItems="baseline" gap={8} marginBottom={2}>
              <Text fontSize={15} fontWeight="600" color={isMe ? discordColors.brandPrimary : discordColors.textNormal}>
                {senderName}
              </Text>
              <Text fontSize={11} color={discordColors.textMuted}>{time}</Text>
            </XStack>
          )}
          <Text fontSize={15} color={discordColors.textNormal} lineHeight={22}>
            {item.content}
          </Text>
        </YStack>
      </XStack>
    )
  }

  const otherMembers = conversation?.members?.filter((m) => m.id !== user?.id) || []
  const dmName = conversation?.name || otherMembers[0]?.display_name || 'Chat'

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: discordColors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 56}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <EmptyState
            icon={<FontAwesome name="comment-o" size={40} color={discordColors.textMuted} />}
            title="Start the conversation"
            subtitle={`Send a message to ${dmName}`}
          />
        }
      />

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        isSending={isSending}
        placeholder={`Message @${dmName}`}
      />
    </KeyboardAvoidingView>
  )
}
