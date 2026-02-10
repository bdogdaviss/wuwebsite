import { YStack, XStack, Text, styled } from 'tamagui'
import { Outlet, useLocation } from 'react-router-dom'
import { discordColors } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'
import { Home, Target, RefreshCw, Shield, Settings, Search, Inbox, HelpCircle, User } from 'lucide-react'

const MainContainer = styled(YStack, {
  flex: 1,
  backgroundColor: discordColors.bgPrimary,
  overflow: 'hidden',
})

const TopBar = styled(XStack, {
  height: 48,
  paddingHorizontal: 16,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: discordColors.border,
})

const TopBarTitle = styled(XStack, {
  alignItems: 'center',
  gap: 12,
})

const TopBarActions = styled(XStack, {
  alignItems: 'center',
  gap: 16,
})

const TopBarIcon = styled(Text, {
  fontSize: 20,
  color: discordColors.textMuted,
  cursor: 'pointer',
  hoverStyle: {
    color: discordColors.textNormal,
  },
})

const ContentArea = styled(YStack, {
  flex: 1,
  overflow: 'auto',
})

// Map routes to titles
const routeIcons: Record<string, React.ReactNode> = {
  '/': <Home size={18} color={discordColors.textMuted} />,
  '/focus': <Target size={18} color={discordColors.textMuted} />,
  '/routines': <RefreshCw size={18} color={discordColors.textMuted} />,
  '/block-rules': <Shield size={18} color={discordColors.textMuted} />,
  '/settings': <Settings size={18} color={discordColors.textMuted} />,
}

const routeTitles: Record<string, string> = {
  '/': 'Overview',
  '/focus': 'Focus Sessions',
  '/routines': 'Routines',
  '/block-rules': 'Block Rules',
  '/settings': 'Settings',
}

export function MainPanel() {
  const location = useLocation()
  const { toggleInfoPanel, isInfoPanelOpen } = useUIStore()

  const currentIcon = routeIcons[location.pathname] || routeIcons['/']
  const currentTitle = routeTitles[location.pathname] || routeTitles['/']

  return (
    <MainContainer>
      {/* Top bar with context info */}
      <TopBar>
        <TopBarTitle>
          {currentIcon}
          <Text
            fontSize={15}
            fontWeight="600"
            color={discordColors.textNormal}
          >
            {currentTitle}
          </Text>
        </TopBarTitle>

        <TopBarActions>
          {/* Search */}
          <TopBarIcon><Search size={20} /></TopBarIcon>

          {/* Inbox */}
          <TopBarIcon><Inbox size={20} /></TopBarIcon>

          {/* Help */}
          <TopBarIcon><HelpCircle size={20} /></TopBarIcon>

          {/* Toggle info panel */}
          <TopBarIcon
            onPress={toggleInfoPanel}
            color={isInfoPanelOpen ? discordColors.textNormal : discordColors.textMuted}
          >
            <User size={20} />
          </TopBarIcon>
        </TopBarActions>
      </TopBar>

      {/* Main content area - renders route content */}
      <ContentArea>
        <Outlet />
      </ContentArea>
    </MainContainer>
  )
}
