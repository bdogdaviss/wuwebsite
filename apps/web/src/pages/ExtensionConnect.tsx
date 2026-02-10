import { useState } from 'react'
import { YStack, XStack, H2, Text, Spinner, Input } from 'tamagui'
import { Button } from '@wakeup/ui'
import { useAuth } from '../context/AuthContext'
import { KeyRound, Puzzle } from 'lucide-react'

export function ExtensionConnect() {
  const { api, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.extensionCode()
      setCode(response.code)
    } catch (err) {
      console.error('Failed to generate code:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate connection code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isAuthenticated) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" padding="$6">
        <YStack
          backgroundColor="$gray2"
          padding="$6"
          borderRadius="$4"
          maxWidth={400}
          width="100%"
          alignItems="center"
          gap="$4"
        >
          <H2>Connect Extension</H2>
          <Text color="$gray11" textAlign="center">
            You need to be logged in to connect the extension.
          </Text>
          <Button variant="primary" onPress={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </YStack>
      </YStack>
    )
  }

  if (code) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" padding="$6">
        <YStack
          backgroundColor="$gray2"
          padding="$6"
          borderRadius="$4"
          maxWidth={400}
          width="100%"
          alignItems="center"
          gap="$4"
        >
          <KeyRound size={32} />
          <H2>Your Connection Code</H2>
          <Text color="$gray11" textAlign="center">
            Copy this code and paste it in the extension popup.
          </Text>

          <XStack width="100%" gap="$2">
            <Input
              flex={1}
              value={code}
              readOnly
              fontFamily="$mono"
              fontSize="$3"
              textAlign="center"
              backgroundColor="$gray4"
            />
            <Button variant="primary" onPress={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </XStack>

          <Text fontSize="$2" color="$gray10" textAlign="center">
            This code expires in 60 seconds. Click the extension icon and paste this code to connect.
          </Text>

          <Button variant="outline" onPress={handleGenerateCode}>
            Generate New Code
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" padding="$6">
      <YStack
        backgroundColor="$gray2"
        padding="$6"
        borderRadius="$4"
        maxWidth={400}
        width="100%"
        alignItems="center"
        gap="$4"
      >
        <Puzzle size={32} />
        <H2>Connect Extension</H2>
        <Text color="$gray11" textAlign="center">
          Generate a one-time code to connect your WakeUp account to the browser extension.
        </Text>

        {error && (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        )}

        <Button
          variant="primary"
          size="large"
          onPress={handleGenerateCode}
          disabled={isLoading}
          width="100%"
        >
          {isLoading ? (
            <XStack gap="$2" alignItems="center">
              <Spinner size="small" color="white" />
              <Text color="white">Generating...</Text>
            </XStack>
          ) : (
            'Generate Code'
          )}
        </Button>

        <Text fontSize="$2" color="$gray10" textAlign="center">
          The code will be valid for 60 seconds. No password is shared with the extension.
        </Text>
      </YStack>
    </YStack>
  )
}
