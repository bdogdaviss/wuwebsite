import { YStack, XStack, Text, styled, Stack } from 'tamagui'
import { useUIStore } from '../state/uiStore'
import { useNestStore } from '../state/nestStore'
import { discordColors, discordLayout, Avatar } from '@wakeup/ui'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus } from 'lucide-react'

const RailContainer = styled(YStack, {
  alignItems: 'center',
  paddingVertical: 12,
  gap: 8,
  height: '100%',
  width: '100%',
})

const ActiveIndicator = styled(Stack, {
  position: 'absolute',
  left: 0,
  width: 4,
  backgroundColor: discordColors.railPill,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  transition: `height ${discordLayout.transitionNormal} ease, opacity ${discordLayout.transitionNormal} ease`,
})

const NestIconWrapper = styled(XStack, {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  cursor: 'pointer',
})

const ServerIconButton = styled(Stack, {
  width: 48,
  height: 48,
  borderRadius: discordLayout.iconRadiusCircle,
  backgroundColor: discordColors.bgSecondary,
  alignItems: 'center',
  justifyContent: 'center',
  transition: `border-radius ${discordLayout.transitionNormal} ease, background-color ${discordLayout.transitionNormal} ease`,

  hoverStyle: {
    borderRadius: discordLayout.iconRadiusHover,
    backgroundColor: discordColors.brandPrimary,
  },

  variants: {
    active: {
      true: {
        borderRadius: discordLayout.iconRadiusActive,
        backgroundColor: discordColors.brandPrimary,
      },
    },
  },
})

const AddButton = styled(Stack, {
  width: 48,
  height: 48,
  borderRadius: discordLayout.iconRadiusCircle,
  backgroundColor: discordColors.bgSecondary,
  alignItems: 'center',
  justifyContent: 'center',
  transition: `border-radius ${discordLayout.transitionNormal} ease, background-color ${discordLayout.transitionNormal} ease, color ${discordLayout.transitionNormal} ease`,
  cursor: 'pointer',

  hoverStyle: {
    borderRadius: discordLayout.iconRadiusHover,
    backgroundColor: discordColors.green,
  },
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

export function ServerRail() {
  const { activeNestId, setActiveNest, setActiveChannel, openCreateGroup } = useUIStore()
  const { user, logout, api } = useAuth()
  const navigate = useNavigate()
  const { nests: apiNests, nestDetails, fetchNest } = useNestStore()

  const nests = apiNests.map((n) => ({
    id: n.id,
    name: n.name,
    icon: n.icon_url || '',
    notifications: 0,
    channels: nestDetails[n.id]?.channels?.map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type as 'text' | 'voice',
      category: ch.category,
    })) || [],
  }))

  return (
    <RailContainer>
      {/* Home / DM icon */}
      <NestIconWrapper
        onPress={() => {
          setActiveNest('home')
          navigate('/')
        }}
      >
        <ActiveIndicator
          height={activeNestId === 'home' ? 40 : 8}
          opacity={activeNestId === 'home' ? 1 : 0}
        />
        <ServerIconButton active={activeNestId === 'home'}>
          <img src="/logo.png" alt="WakeUp" style={{ width: 150, height: 150, objectFit: 'contain' }} />
        </ServerIconButton>
      </NestIconWrapper>

      <RailDivider />

      {/* Nest icons */}
      {nests.map((nest) => (
        <NestIconWrapper
          key={nest.id}
          onPress={async () => {
            setActiveNest(nest.id)
            // Fetch nest details from API if not cached
            if (apiNests.length > 0 && !nestDetails[nest.id]) {
              await fetchNest(api, nest.id)
            }
            // Auto-select first text channel
            const firstChannel = nest.channels.find((c) => c.type === 'text')
            if (firstChannel) {
              setActiveChannel(firstChannel.id)
              navigate(`/nest/${nest.id}/${firstChannel.id}`)
            }
          }}
        >
          <ActiveIndicator
            height={activeNestId === nest.id ? 40 : 0}
            opacity={activeNestId === nest.id ? 1 : 0}
          />
          <ServerIconButton active={activeNestId === nest.id}>
            <Avatar
              fallback={nest.name}
              size="lg"
              shape={activeNestId === nest.id ? 'rounded' : 'circle'}
            />
          </ServerIconButton>

          {/* Notification badge */}
          {nest.notifications && nest.notifications > 0 && (
            <Stack
              position="absolute"
              bottom={-2}
              right={10}
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor={discordColors.red}
              alignItems="center"
              justifyContent="center"
              borderWidth={3}
              borderColor={discordColors.bgTertiary}
            >
              <Text fontSize={10} fontWeight="700" color="white">
                {nest.notifications}
              </Text>
            </Stack>
          )}
        </NestIconWrapper>
      ))}

      {/* Add nest button */}
      <NestIconWrapper onPress={openCreateGroup}>
        <AddButton>
          <Plus size={24} color={discordColors.green} />
        </AddButton>
      </NestIconWrapper>

      {/* Bottom section */}
      <BottomSection>
        <RailDivider />
        <NestIconWrapper onPress={logout}>
          <ServerIconButton>
            <Avatar
              src={user?.avatar_url}
              fallback={user?.display_name || 'U'}
              size="md"
            />
          </ServerIconButton>
        </NestIconWrapper>
      </BottomSection>
    </RailContainer>
  )
}
