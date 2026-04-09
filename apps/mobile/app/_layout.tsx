import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import config from '../tamagui.config'
import { AuthProvider, useAuth } from '../src/auth/AuthContext'
import { discordColors } from '../src/theme/colors'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: discordColors.bgPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="you-wake" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="dm/[id]"
        options={{
          headerShown: true,
          title: 'Chat',
          headerStyle: { backgroundColor: discordColors.bgSecondary },
          headerTintColor: discordColors.textNormal,
          headerTitleStyle: { color: discordColors.textNormal, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="nest/[nestId]"
        options={{
          headerShown: true,
          title: 'Nest',
          headerStyle: { backgroundColor: discordColors.bgSecondary },
          headerTintColor: discordColors.textNormal,
          headerTitleStyle: { color: discordColors.textNormal, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="channel/[channelId]"
        options={{
          headerShown: true,
          title: 'Channel',
          headerStyle: { backgroundColor: discordColors.bgSecondary },
          headerTintColor: discordColors.textNormal,
          headerTitleStyle: { color: discordColors.textNormal, fontWeight: '600' },
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Theme name="discordDark">
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
