import { View, TextInput, StyleSheet } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { discordColors } from '../../src/theme/colors'
import { EmptyState } from '../../src/components'

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={14} color={discordColors.textMuted} />
          <TextInput
            placeholder="Explore night owl communities"
            placeholderTextColor={discordColors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Empty state */}
      <EmptyState
        icon={<FontAwesome name="compass" size={40} color={discordColors.textMuted} />}
        title="Discover Night Owls"
        subtitle="Find crews who build, fix, and dream through the night. Match with awake partners nearby and join late-night sessions."
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: discordColors.bgPrimary,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: discordColors.searchBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: discordColors.textNormal,
    fontSize: 15,
  },
})
