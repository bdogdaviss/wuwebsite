import { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { discordColors } from '../theme/colors'

interface SafeScreenProps {
  children: ReactNode
  /** Which edges to pad for safe area. Default: ['top', 'bottom'] */
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  backgroundColor?: string
}

export function SafeScreen({
  children,
  edges = ['top', 'bottom'],
  backgroundColor = discordColors.bgPrimary,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
        },
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
