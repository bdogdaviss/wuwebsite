import { useState } from 'react'
import { FlatList } from 'react-native'
import { YStack, XStack, Text, Input, styled } from 'tamagui'
import { Button } from '../../src/components/Button'
import { discordColors } from '../../src/theme/colors'

const Container = styled(YStack, {
  flex: 1,
  backgroundColor: discordColors.bgPrimary,
})

const HeaderSection = styled(YStack, {
  padding: 16,
  gap: 16,
})

const CreateCard = styled(YStack, {
  backgroundColor: discordColors.bgSecondary,
  padding: 16,
  borderRadius: 8,
  gap: 12,
})

const StyledInput = styled(Input, {
  backgroundColor: discordColors.bgTertiary,
  borderWidth: 0,
  borderRadius: 4,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  color: discordColors.textNormal,
})

const RoutineCard = styled(YStack, {
  backgroundColor: discordColors.bgSecondary,
  padding: 16,
  borderRadius: 8,
  marginBottom: 8,
})

const SectionHeader = styled(Text, {
  fontSize: 12,
  fontWeight: '700',
  color: discordColors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  paddingHorizontal: 16,
  marginBottom: 8,
})

const FooterNote = styled(Text, {
  fontSize: 12,
  color: discordColors.textMuted,
  textAlign: 'center',
  padding: 16,
})

interface Routine {
  id: string
  name: string
  createdAt: string
}

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [newRoutineName, setNewRoutineName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoutine = () => {
    if (!newRoutineName.trim()) return
    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: newRoutineName.trim(),
      createdAt: new Date().toISOString(),
    }
    setRoutines([newRoutine, ...routines])
    setNewRoutineName('')
    setIsCreating(false)
  }

  const handleDeleteRoutine = (id: string) => {
    setRoutines(routines.filter((r) => r.id !== id))
  }

  return (
    <Container>
      <HeaderSection>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={24} fontWeight="600" color={discordColors.textNormal}>
            Routines
          </Text>
          {!isCreating && (
            <Button variant="primary" size="small" onPress={() => setIsCreating(true)}>
              + New
            </Button>
          )}
        </XStack>

        {isCreating && (
          <CreateCard>
            <StyledInput
              placeholder="Routine name..."
              placeholderTextColor={discordColors.textMuted}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              autoFocus
            />
            <XStack gap={8}>
              <Button flex={1} variant="secondary" onPress={() => { setIsCreating(false); setNewRoutineName('') }}>
                Cancel
              </Button>
              <Button flex={1} variant="success" onPress={handleCreateRoutine} disabled={!newRoutineName.trim()}>
                Create
              </Button>
            </XStack>
          </CreateCard>
        )}
      </HeaderSection>

      <SectionHeader>Your Routines</SectionHeader>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <RoutineCard>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1} gap={4}>
                <Text fontWeight="600" fontSize={16} color={discordColors.textNormal}>{item.name}</Text>
                <Text color={discordColors.textMuted} fontSize={13}>
                  Created {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </YStack>
              <Button variant="outline" size="small" onPress={() => handleDeleteRoutine(item.id)}>
                Delete
              </Button>
            </XStack>
          </RoutineCard>
        )}
        ListEmptyComponent={
          <YStack alignItems="center" padding={48} gap={12}>
            <Text fontSize={48}>📋</Text>
            <Text fontSize={16} fontWeight="500" color={discordColors.textNormal}>No routines yet</Text>
            <Text fontSize={14} color={discordColors.textMuted} textAlign="center">
              Create your first routine to automate{'\n'}your focus sessions
            </Text>
          </YStack>
        }
        ListFooterComponent={<FooterNote>Routines are stored locally for now. API integration coming soon.</FooterNote>}
      />
    </Container>
  )
}
