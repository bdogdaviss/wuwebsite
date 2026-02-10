import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import { discordColors } from '../../src/theme/colors'

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: discordColors.textNormal,
        tabBarInactiveTintColor: discordColors.textMuted,
        tabBarStyle: {
          backgroundColor: discordColors.bgTertiary,
          borderTopColor: discordColors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: discordColors.bgSecondary,
          borderBottomColor: discordColors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: discordColors.textNormal,
          fontWeight: '600',
          fontSize: 16,
        },
        headerTintColor: discordColors.textNormal,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Friends',
          headerTitle: 'Friends',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerTitle: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          headerTitle: 'Focus Sessions',
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
      {/* Hide routines from tab bar — kept for backwards compat */}
      <Tabs.Screen
        name="routines"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
