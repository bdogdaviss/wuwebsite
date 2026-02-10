import { YStack, XStack, Text, styled, Stack } from 'tamagui'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { discordColors, IconButton, Avatar } from '@wakeup/ui'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Settings } from 'lucide-react'

const RailContainer = styled(YStack, {
  width: 72,
  backgroundColor: discordColors.bgTertiary,
  alignItems: 'center',
  paddingVertical: 12,
  gap: 8,
  height: '100%',
})

// Active indicator pill on the left side
const ActiveIndicator = styled(Stack, {
  position: 'absolute',
  left: 0,
  width: 4,
  backgroundColor: 'white',
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  transition: 'height 150ms ease',
})

const WorkspaceIconWrapper = styled(XStack, {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
})

const RailDivider = styled(Stack, {
  width: 32,
  height: 2,
  backgroundColor: discordColors.bgModifierActive,
  borderRadius: 1,
  marginVertical: 4,
})

const BottomSection = styled(YStack, {
  marginTop: 'auto',
  gap: 8,
  alignItems: 'center',
})

export function WorkspaceRail() {
  const { activeNestId, setActiveNest } = useUIStore()
  const { nests } = useNestStore()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <RailContainer>
      {/* Home / DM icon */}
      <WorkspaceIconWrapper>
        <ActiveIndicator height={activeNestId === 'home' ? 40 : 0} />
        <IconButton
          active={activeNestId === 'home'}
          onPress={() => {
            setActiveNest('home')
            navigate('/')
          }}
        >
          <Home size={24} color={discordColors.textNormal} />
        </IconButton>
      </WorkspaceIconWrapper>

      <RailDivider />

      {/* Workspace icons */}
      {nests.map((workspace) => (
        <WorkspaceIconWrapper key={workspace.id}>
          <ActiveIndicator
            height={activeNestId === workspace.id ? 40 : 0}
            opacity={activeNestId === workspace.id ? 1 : 0}
          />
          <IconButton
            active={activeNestId === workspace.id}
            onPress={() => {
              setActiveNest(workspace.id)
              navigate('/')
            }}
          >
            <Avatar
              fallback={workspace.name}
              size="lg"
              shape={activeNestId === workspace.id ? 'rounded' : 'circle'}
            />
          </IconButton>
        </WorkspaceIconWrapper>
      ))}

      {/* Add workspace button */}
      <IconButton variant="ghost">
        <Text fontSize={24} color={discordColors.green}>
          +
        </Text>
      </IconButton>

      {/* Bottom section */}
      <BottomSection>
        <RailDivider />
        <IconButton
          variant="ghost"
          onPress={() => navigate('/settings')}
        >
          <Settings size={20} color={discordColors.textMuted} />
        </IconButton>
        <IconButton variant="ghost" onPress={logout}>
          <Avatar
            src={user?.avatar_url}
            fallback={user?.display_name || 'U'}
            size="md"
          />
        </IconButton>
      </BottomSection>
    </RailContainer>
  )
}
