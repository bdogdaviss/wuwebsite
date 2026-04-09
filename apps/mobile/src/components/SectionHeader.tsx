import { View, Text, StyleSheet } from 'react-native'
import { ReactNode } from 'react'
import { discordColors } from '../theme/colors'

interface SectionHeaderProps {
  title: string
  action?: ReactNode
  paddingHorizontal?: number
}

export function SectionHeader({ title, action, paddingHorizontal = 16 }: SectionHeaderProps) {
  return (
    <View style={[styles.container, { paddingHorizontal }]}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: discordColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
