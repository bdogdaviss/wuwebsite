import { useNavigate, useLocation } from 'react-router-dom'
import { YStack, XStack, Text, styled, ScrollView } from 'tamagui'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { useAuth } from '../context/AuthContext'
import {
  discordColors,
  ListRow,
  SectionHeader,
  Avatar,
  StatusDot,
  Divider,
} from '@wakeup/ui'
import { Home, Clock, RefreshCw, Shield, Settings, Target, BarChart3, Moon } from 'lucide-react'

const SidebarContainer = styled(YStack, {
  width: 240,
  backgroundColor: discordColors.bgSecondary,
  height: '100%',
})

const SidebarHeader = styled(XStack, {
  height: 48,
  paddingHorizontal: 16,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: discordColors.border,
  cursor: 'pointer',
  hoverStyle: {
    backgroundColor: discordColors.bgModifierHover,
  },
})

const UserPanel = styled(XStack, {
  height: 52,
  paddingHorizontal: 8,
  alignItems: 'center',
  gap: 8,
  backgroundColor: discordColors.bgTertiary,
})

const UserInfo = styled(YStack, {
  flex: 1,
})

const iconComponents: Record<string, React.ReactNode> = {
  home: <Home size={18} color={discordColors.textMuted} />,
  clock: <Clock size={18} color={discordColors.textMuted} />,
  repeat: <RefreshCw size={18} color={discordColors.textMuted} />,
  shield: <Shield size={18} color={discordColors.textMuted} />,
  settings: <Settings size={18} color={discordColors.textMuted} />,
  focus: <Target size={18} color={discordColors.textMuted} />,
  activity: <BarChart3 size={18} color={discordColors.textMuted} />,
}

// Context items for the sidebar (replaces nav items)
const contextItems = [
  { id: 'overview', label: 'Overview', route: '/', icon: 'home', status: 'online' as const },
  { id: 'focus', label: 'Active Focus', route: '/focus', icon: 'focus', status: 'active' as const },
]

const sessionItems = [
  { id: 'activity', label: 'Activity Feed', route: '/', icon: 'activity' },
  { id: 'sessions', label: 'Session History', route: '/focus', icon: 'clock' },
  { id: 'rules', label: 'Block Rules', route: '/block-rules', icon: 'shield' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeNestId } = useUIStore()
  const { nests } = useNestStore()
  const { user } = useAuth()

  const activeNest = nests.find((n) => n.id === activeNestId)

  const isActive = (route: string) => {
    if (route === '/') return location.pathname === '/'
    return location.pathname.startsWith(route)
  }

  return (
    <SidebarContainer>
      {/* Header with nest name */}
      <SidebarHeader>
        <Text
          fontSize={15}
          fontWeight="600"
          color={discordColors.textNormal}
        >
          {activeNest?.name || 'Personal Focus'}
        </Text>
        <Text fontSize={12} color={discordColors.textMuted}>
          ▼
        </Text>
      </SidebarHeader>

      {/* Scrollable content */}
      <ScrollView flex={1}>
        {/* Quick Access Section */}
        <SectionHeader title="Quick Access" />
        {contextItems.map((item) => (
          <ListRow
            key={item.id}
            icon={iconComponents[item.icon]}
            title={item.label}
            selected={isActive(item.route)}
            rightElement={
              item.status === 'active' ? (
                <StatusDot status="online" />
              ) : null
            }
            onPress={() => navigate(item.route)}
          />
        ))}

        <Divider spacing="md" />

        {/* Sessions Section */}
        <SectionHeader
          title="Sessions"
          action={
            <Text
              fontSize={16}
              color={discordColors.textMuted}
              cursor="pointer"
              hoverStyle={{ color: discordColors.textNormal }}
            >
              +
            </Text>
          }
        />
        {sessionItems.map((item) => (
          <ListRow
            key={item.id}
            icon={iconComponents[item.icon]}
            title={item.label}
            selected={isActive(item.route)}
            onPress={() => navigate(item.route)}
          />
        ))}

        <Divider spacing="md" />

        {/* Routines Section */}
        <SectionHeader title="Routines" />
        <ListRow
          icon={<RefreshCw size={18} color={discordColors.textMuted} />}
          title="Morning Focus"
          subtitle="Scheduled at 9:00 AM"
          onPress={() => navigate('/routines')}
        />
        <ListRow
          icon={<Moon size={18} color={discordColors.textMuted} />}
          title="Evening Wind-down"
          subtitle="Scheduled at 8:00 PM"
          onPress={() => navigate('/routines')}
        />
      </ScrollView>

      {/* User panel at bottom */}
      <UserPanel>
        <Avatar
          src={user?.avatar_url}
          fallback={user?.display_name || 'U'}
          size="sm"
        />
        <UserInfo>
          <Text
            fontSize={13}
            fontWeight="500"
            color={discordColors.textNormal}
            numberOfLines={1}
          >
            {user?.display_name}
          </Text>
          <XStack alignItems="center" gap={4}>
            <StatusDot status="online" size="sm" />
            <Text fontSize={11} color={discordColors.textMuted}>
              Online
            </Text>
          </XStack>
        </UserInfo>
        <XStack gap={8}>
          <Text
            fontSize={18}
            color={discordColors.textMuted}
            cursor="pointer"
            hoverStyle={{ color: discordColors.textNormal }}
            onPress={() => navigate('/settings')}
          >
            <Settings size={18} />
          </Text>
        </XStack>
      </UserPanel>
    </SidebarContainer>
  )
}
