import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { YStack, H1, Text, Input, Label } from 'tamagui'
import { Button } from '@wakeup/ui'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await register(email, password, displayName)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" minHeight="100vh">
      <YStack width="100%" maxWidth={400} gap="$4">
        <H1 textAlign="center">Create Account</H1>

        <form onSubmit={handleSubmit}>
          <YStack gap="$4">
            <YStack gap="$2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                autoComplete="name"
              />
            </YStack>

            <YStack gap="$2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </YStack>

            <YStack gap="$2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                autoComplete="new-password"
                secureTextEntry
              />
            </YStack>

            {error && (
              <Text color="$red10" textAlign="center">
                {error}
              </Text>
            )}

            <Button
              onPress={handleSubmit as () => void}
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </YStack>
        </form>

        <Text textAlign="center" color="$gray11">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0070f3' }}>
            Login
          </Link>
        </Text>
      </YStack>
    </YStack>
  )
}
