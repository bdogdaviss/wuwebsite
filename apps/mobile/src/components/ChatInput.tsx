import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import { discordColors } from '../theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
  isSending?: boolean
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Message',
  isSending = false,
}: ChatInputProps) {
  const hasText = value.trim().length > 0

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Chevron */}
        <Pressable style={styles.chevron}>
          <FontAwesome name="chevron-right" size={16} color={discordColors.interactiveNormal} />
        </Pressable>

        {/* Text input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={discordColors.textMuted}
          style={styles.input}
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* Emoji */}
        <Pressable style={styles.iconBtn}>
          <FontAwesome name="smile-o" size={22} color={discordColors.interactiveNormal} />
        </Pressable>

        {/* Send button */}
        <Pressable
          onPress={hasText && !isSending ? onSend : undefined}
          style={[
            styles.sendBtn,
            { backgroundColor: hasText ? '#5865f2' : 'transparent' },
          ]}
        >
          <FontAwesome
            name="send"
            size={16}
            color={hasText ? '#ffffff' : discordColors.interactiveNormal}
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: discordColors.searchBg,
    borderRadius: 24,
    paddingLeft: 12,
    paddingRight: 4,
    minHeight: 44,
  },
  chevron: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: discordColors.textNormal,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    maxHeight: 120,
  },
  iconBtn: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
})
