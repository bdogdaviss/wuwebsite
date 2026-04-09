import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { discordColors } from '../../src/theme/colors'

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: discordColors.textNormal,
        tabBarInactiveTintColor: discordColors.textMuted,
        tabBarStyle: {
          backgroundColor: discordColors.bgTertiary,
          borderTopColor: discordColors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: discordColors.bgSecondary,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        },
        headerTitleStyle: {
          color: discordColors.headerPrimary,
          fontWeight: '600',
          fontSize: 17,
        },
        headerTintColor: discordColors.textNormal,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      {/* Hidden from tab bar */}
      <Tabs.Screen name="focus" options={{ href: null }} />
      <Tabs.Screen name="routines" options={{ href: null }} />
    </Tabs>
  )
}
