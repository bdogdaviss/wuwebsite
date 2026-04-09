import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { discordColors } from '../theme/colors'

export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={discordColors.brandPrimary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: discordColors.bgPrimary,
  },
})
