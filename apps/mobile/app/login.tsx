import { useState } from 'react'
import { KeyboardAvoidingView, Platform, TextInput, Pressable, StyleSheet, Image } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { SafeScreen } from '../src/components'
import { useAuth } from '../src/auth/AuthContext'
import { discordColors } from '../src/theme/colors'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} justifyContent="center" paddingHorizontal={24} backgroundColor={discordColors.bgPrimary}>
          <YStack maxWidth={400} width="100%" alignSelf="center" gap={24}>
            {/* Logo + Title */}
            <YStack alignItems="center" gap={12} marginBottom={16}>
              <Image
                source={require('../assets/images/icon.png')}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
              <Text fontSize={28} fontWeight="700" color={discordColors.headerPrimary}>
                Welcome back!
              </Text>
              <Text fontSize={15} color={discordColors.textMuted}>
                We're so excited to see you again!
              </Text>
            </YStack>

            {/* Form */}
            <YStack gap={16}>
              <YStack gap={6}>
                <Text fontSize={12} fontWeight="700" color={discordColors.textMuted} textTransform="uppercase">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={discordColors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  style={styles.input}
                />
              </YStack>

              <YStack gap={6}>
                <Text fontSize={12} fontWeight="700" color={discordColors.textMuted} textTransform="uppercase">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={discordColors.textMuted}
                  secureTextEntry
                  autoComplete="password"
                  style={styles.input}
                />
              </YStack>
            </YStack>

            {error && (
              <Text color={discordColors.red} textAlign="center" fontSize={14}>
                {error}
              </Text>
            )}

            {/* Login button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={[styles.loginBtn, isLoading && { opacity: 0.6 }]}
            >
              {isLoading ? (
                <Text fontSize={16} fontWeight="600" color="#fff">Signing in...</Text>
              ) : (
                <Text fontSize={16} fontWeight="600" color="#fff">Log In</Text>
              )}
            </Pressable>

            <Text fontSize={13} color={discordColors.textMuted} textAlign="center">
              Need an account?{' '}
              <Text color={discordColors.textLink} fontWeight="500">Register</Text>
            </Text>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: discordColors.bgTertiary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: discordColors.textNormal,
    minHeight: 48,
  },
  loginBtn: {
    backgroundColor: discordColors.brandPrimary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
