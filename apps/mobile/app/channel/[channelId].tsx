import { useEffect, useState, useCallback, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/auth/AuthContext'
import type { ChannelMessage } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'
import { ChatInput, MobileAvatar, EmptyState } from '../../src/components'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function ChannelChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { user, socket } = useAuth()
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const loadMessages = useCallback(async () => {
    if (!channelId) return
    try {
      const res = await api.listChannelMessages(channelId)
      setMessages(res.messages.reverse())
    } catch (error) {
      console.error('Failed to load channel messages:', error)
    }
  }, [channelId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  useEffect(() => {
    if (!socket || !channelId) return
    const handleNewMessage = (data: unknown) => {
      const msg = data as ChannelMessage
      if (msg.channel_id === channelId) {
        setMessages((prev) => [...prev, msg])
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      }
    }
    socket.on('channel_message.new', handleNewMessage)
    return () => { socket.off('channel_message.new', handleNewMessage) }
  }, [socket, channelId])

  const handleSend = async () => {
    if (!inputText.trim() || !channelId || isSending) return
    setIsSending(true)
    const text = inputText.trim()
    setInputText('')
    try {
      const msg = await api.sendChannelMessage(channelId, text)
      setMessages((prev) => [...prev, msg])
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error) {
      console.error('Failed to send message:', error)
      setInputText(text)
    } finally {
      setIsSending(false)
    }
  }

  const renderMessage = ({ item, index }: { item: ChannelMessage; index: number }) => {
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
            icon={<FontAwesome name="hashtag" size={40} color={discordColors.textMuted} />}
            title="Welcome to the channel"
            subtitle="Send a message to get the conversation started"
          />
        }
      />

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        isSending={isSending}
        placeholder="Message #channel"
      />
    </KeyboardAvoidingView>
  )
}
