import { styled, XStack, YStack, Stack, Text, GetProps } from 'tamagui'
import { Mic, Headphones, Settings } from 'lucide-react'
import { discordColors } from './tokens'
import { Avatar } from './Avatar'
import { StatusDot } from './Badge'

const PanelContainer = styled(XStack, {
  name: 'UserStatusPanel',
  height: 52,
  paddingHorizontal: 8,
  alignItems: 'center',
  gap: 8,
  backgroundColor: discordColors.bgTertiary,
})

const UserInfo = styled(YStack, {
  name: 'UserStatusPanelInfo',
  flex: 1,
  gap: 0,
  overflow: 'hidden',
})

const UserName = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: discordColors.textNormal,
  numberOfLines: 1,
})

const StatusRow = styled(XStack, {
  alignItems: 'center',
  gap: 4,
})

const StatusText = styled(Text, {
  fontSize: 11,
  color: discordColors.textMuted,
})

const ActionIcons = styled(XStack, {
  gap: 8,
  alignItems: 'center',
})

const ActionIcon = styled(Stack, {
  cursor: 'pointer',
  padding: 4,
  borderRadius: 4,
  alignItems: 'center',
  justifyContent: 'center',

  hoverStyle: {
    backgroundColor: discordColors.bgModifierHover,
  },
})

export interface UserStatusPanelProps extends GetProps<typeof PanelContainer> {
  /** User's avatar URL */
  avatarUrl?: string | null
  /** User's display name */
  displayName: string
  /** Status type for the indicator */
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  /** Status text to display (e.g., "Online", "Away", custom status) */
  statusText?: string
  /** Action icons to render on the right (array of ReactNodes) */
  actions?: React.ReactNode[]
  /** Called when settings icon is pressed */
  onSettingsPress?: () => void
  /** Called when mute icon is pressed */
  onMutePress?: () => void
  /** Called when deafen icon is pressed */
  onDeafenPress?: () => void
}

export function UserStatusPanel({
  avatarUrl,
  displayName,
  status = 'online',
  statusText,
  actions,
  onSettingsPress,
  onMutePress,
  onDeafenPress,
  ...props
}: UserStatusPanelProps) {
  const displayStatusText = statusText || (
    status === 'online' ? 'Online' :
    status === 'idle' ? 'Idle' :
    status === 'dnd' ? 'Do Not Disturb' :
    'Offline'
  )

  return (
    <PanelContainer {...props}>
      <Avatar
        src={avatarUrl}
        fallback={displayName}
        size="sm"
      />
      <UserInfo>
        <UserName numberOfLines={1}>
          {displayName}
        </UserName>
        <StatusRow>
          <StatusDot status={status} size="sm" />
          <StatusText>{displayStatusText}</StatusText>
        </StatusRow>
      </UserInfo>
      <ActionIcons>
        {actions ? (
          actions.map((action, index) => (
            <XStack key={index}>{action}</XStack>
          ))
        ) : (
          <>
            {onMutePress && (
              <ActionIcon onPress={onMutePress}>
                <Mic size={18} color={discordColors.textMuted} />
              </ActionIcon>
            )}
            {onDeafenPress && (
              <ActionIcon onPress={onDeafenPress}>
                <Headphones size={18} color={discordColors.textMuted} />
              </ActionIcon>
            )}
            {onSettingsPress && (
              <ActionIcon onPress={onSettingsPress}>
                <Settings size={18} color={discordColors.textMuted} />
              </ActionIcon>
            )}
          </>
        )}
      </ActionIcons>
    </PanelContainer>
  )
}

export type UserStatusPanelContainerProps = GetProps<typeof PanelContainer>
