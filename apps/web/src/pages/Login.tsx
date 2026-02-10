import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { YStack, Text, Input, styled } from 'tamagui'
import { Button, discordColors } from '@wakeup/ui'
import { useAuth } from '../context/AuthContext'

const LoginContainer = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: discordColors.bgPrimary,
})

const LoginCard = styled(YStack, {
  width: '100%',
  maxWidth: 480,
  backgroundColor: discordColors.bgSecondary,
  borderRadius: 8,
  padding: 32,
  gap: 20,
})

const Title = styled(Text, {
  fontSize: 24,
  fontWeight: '600',
  color: discordColors.textNormal,
  textAlign: 'center',
})

const Subtitle = styled(Text, {
  fontSize: 16,
  color: discordColors.textMuted,
  textAlign: 'center',
})

const FormLabel = styled(Text, {
  fontSize: 12,
  fontWeight: '700',
  color: discordColors.textMuted,
  textTransform: 'uppercase',
  marginBottom: 8,
})

const StyledInput = styled(Input, {
  backgroundColor: discordColors.bgTertiary,
  borderWidth: 0,
  borderRadius: 3,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  color: discordColors.textNormal,

  focusStyle: {
    outlineWidth: 2,
    outlineColor: discordColors.brandPrimary,
    outlineStyle: 'solid',
  },
})

const ErrorText = styled(Text, {
  color: discordColors.red,
  fontSize: 14,
  textAlign: 'center',
})

const LinkText = styled(Text, {
  color: discordColors.textLink,
  fontSize: 14,
})

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer>
      <LoginCard>
        <YStack gap={8} marginBottom={8}>
          <Title>Welcome back!</Title>
          <Subtitle>We're so excited to see you again!</Subtitle>
        </YStack>

        <form onSubmit={handleSubmit}>
          <YStack gap={20}>
            <YStack>
              <FormLabel>
                Email or Phone Number
                <Text color={discordColors.red}> *</Text>
              </FormLabel>
              <StyledInput
                id="email"
                type="email"
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
              />
            </YStack>

            <YStack>
              <FormLabel>
                Password
                <Text color={discordColors.red}> *</Text>
              </FormLabel>
              <StyledInput
                id="password"
                type="password"
                value={password}
                onChangeText={setPassword}
                autoComplete="current-password"
                secureTextEntry
              />
              <LinkText marginTop={4} fontSize={14}>
                Forgot your password?
              </LinkText>
            </YStack>

            {error && <ErrorText>{error}</ErrorText>}

            <Button
              onPress={handleSubmit as () => void}
              disabled={isLoading}
              variant="primary"
              fullWidth
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            <Text fontSize={14} color={discordColors.textMuted}>
              Need an account?{' '}
              <Link to="/register" style={{ color: discordColors.textLink, textDecoration: 'none' }}>
                Register
              </Link>
            </Text>
          </YStack>
        </form>
      </LoginCard>
    </LoginContainer>
  )
}
