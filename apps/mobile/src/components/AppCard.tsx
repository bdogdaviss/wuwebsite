import { View, StyleSheet, ViewProps } from 'react-native'
import { discordColors } from '../theme/colors'

interface AppCardProps extends ViewProps {
  children: React.ReactNode
}

export function AppCard({ children, style, ...props }: AppCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: discordColors.bgSecondary,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    overflow: 'hidden',
  },
})
