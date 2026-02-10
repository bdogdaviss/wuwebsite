import { styled, XStack, GetProps } from 'tamagui'
import { discordColors, discordLayout } from './tokens'

const HeaderBarContainer = styled(XStack, {
  name: 'HeaderBar',
  height: discordLayout.headerHeight, // 50px
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: discordColors.headerBorder, // rgba(0,0,0,0.24)
})

const HeaderBarLeft = styled(XStack, {
  name: 'HeaderBarLeft',
  alignItems: 'center',
  gap: 12,
  flex: 1,
})

const HeaderBarRight = styled(XStack, {
  name: 'HeaderBarRight',
  alignItems: 'center',
  gap: 16,
})

export interface HeaderBarProps {
  /** Left-aligned content (title, icon, etc.) */
  leftContent?: React.ReactNode
  /** Right-aligned content (action icons, etc.) */
  rightContent?: React.ReactNode
  /** Children rendered in the left section (alternative to leftContent prop) */
  children?: React.ReactNode
}

export function HeaderBar({
  leftContent,
  rightContent,
  children,
}: HeaderBarProps) {
  return (
    <HeaderBarContainer>
      <HeaderBarLeft>
        {leftContent || children}
      </HeaderBarLeft>
      {rightContent && <HeaderBarRight>{rightContent}</HeaderBarRight>}
    </HeaderBarContainer>
  )
}

// Export sub-components for flexible composition
export { HeaderBarLeft, HeaderBarRight }

export type HeaderBarContainerProps = GetProps<typeof HeaderBarContainer>
