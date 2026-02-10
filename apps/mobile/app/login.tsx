import { useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, H1, Text, Input, Spinner } from 'tamagui'
import { Button } from '../src/components/Button'
import { useAuth } from '../src/auth/AuthContext'

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
      console.error('Login failed:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} padding="$6" justifyContent="center" backgroundColor="$background">
        <YStack gap="$4" maxWidth={400} width="100%" alignSelf="center">
          <YStack alignItems="center" marginBottom="$6">
            <H1 color="$blue10">WakeUp</H1>
            <Text color="$gray11">Focus & Productivity</Text>
          </YStack>

          <YStack gap="$3">
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              size="$4"
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              size="$4"
            />
          </YStack>

          {error && (
            <Text color="$red10" textAlign="center">
              {error}
            </Text>
          )}

          <Button
            variant="primary"
            size="large"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <XStack gap="$2" alignItems="center">
                <Spinner size="small" color="white" />
                <Text color="white">Signing in...</Text>
              </XStack>
            ) : (
              'Sign In'
            )}
          </Button>

          <Text color="$gray11" textAlign="center" fontSize="$2">
            Don't have an account? Contact your administrator.
          </Text>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
