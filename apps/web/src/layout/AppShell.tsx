import { useState, useEffect, useCallback } from 'react'
import { XStack, styled } from 'tamagui'
import { WorkspaceRail } from './WorkspaceRail'
import { Sidebar } from './Sidebar'
import { MainPanel } from './MainPanel'
import { InfoPanel } from './InfoPanel'
import { CommandPalette } from '../components/CommandPalette'
import { useUIStore } from '../state/uiStore'

const ShellContainer = styled(XStack, {
  flex: 1,
  height: '100vh',
  overflow: 'hidden',
})

export function AppShell() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const { toggleInfoPanel } = useUIStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }

      // Cmd/Ctrl + I - Toggle info panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        toggleInfoPanel()
      }
    },
    [toggleInfoPanel]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <ShellContainer>
        <WorkspaceRail />
        <Sidebar />
        <MainPanel />
        <InfoPanel />
      </ShellContainer>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  )
}
