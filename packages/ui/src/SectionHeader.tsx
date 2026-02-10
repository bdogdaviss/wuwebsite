import { styled, XStack, Text, GetProps } from 'tamagui'
import { discordColors } from './tokens'

const SectionHeaderContainer = styled(XStack, {
  name: 'SectionHeader',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  paddingTop: 16,
})

const SectionHeaderText = styled(Text, {
  color: discordColors.textMuted,
  fontSize: 12,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
})

export interface SectionHeaderProps extends GetProps<typeof SectionHeaderContainer> {
  title: string
  action?: React.ReactNode
}

export function SectionHeader({ title, action, ...props }: SectionHeaderProps) {
  return (
    <SectionHeaderContainer {...props}>
      <SectionHeaderText>{title}</SectionHeaderText>
      {action}
    </SectionHeaderContainer>
  )
}
