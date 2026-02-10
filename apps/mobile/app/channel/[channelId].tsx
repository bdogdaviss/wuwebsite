import { useEffect, useState, useCallback, useRef } from 'react'
import { FlatList, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { YStack, XStack, Text, Stack } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../src/auth/AuthContext'
import type { ChannelMessage } from '@wakeup/api-client'
import { api } from '../../src/api/client'
import { discordColors } from '../../src/theme/colors'

export default function ChannelChatScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>()
  const { user } = useAuth()
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

  // Listen for new channel messages via WebSocket
  const { socket } = useAuth()
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
      <YStack paddingHorizontal={16} paddingTop={showHeader ? 12 : 2}>
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
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: discordColors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding={48}>
            <Text fontSize={48}>#</Text>
            <Text fontSize={16} fontWeight="500" color={discordColors.textNormal} marginTop={12}>
              Welcome to the channel
            </Text>
            <Text fontSize={14} color={discordColors.textMuted} textAlign="center" marginTop={4}>
              Send a message to get the conversation started
            </Text>
          </YStack>
        }
      />

      {/* Message input */}
      <XStack
        backgroundColor={discordColors.bgSecondary}
        padding={12}
        gap={8}
        alignItems="flex-end"
        borderTopWidth={1}
        borderTopColor={discordColors.border}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message..."
          placeholderTextColor={discordColors.textMuted}
          multiline
          maxLength={2000}
          style={{
            flex: 1,
            backgroundColor: discordColors.bgTertiary,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: discordColors.textNormal,
            maxHeight: 100,
          }}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable onPress={handleSend} disabled={!inputText.trim() || isSending}>
          <Stack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={inputText.trim() ? discordColors.brandPrimary : discordColors.bgModifierActive}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={18} color="white">→</Text>
          </Stack>
        </Pressable>
      </XStack>
    </KeyboardAvoidingView>
  )
}
