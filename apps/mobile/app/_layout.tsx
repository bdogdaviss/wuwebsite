import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import * as SplashScreen from 'expo-splash-screen'

import config from '../tamagui.config'
import { AuthProvider } from '../src/auth/AuthContext'
import { discordColors } from '../src/theme/colors'

export { ErrorBoundary } from 'expo-router'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <TamaguiProvider config={config}>
      {/* Always use dark theme for Discord-style UI */}
      <Theme name="dark">
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: discordColors.bgPrimary },
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
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
        </AuthProvider>
      </Theme>
    </TamaguiProvider>
  )
}
