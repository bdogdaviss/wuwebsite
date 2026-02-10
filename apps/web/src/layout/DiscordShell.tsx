import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { discordColors, discordLayout } from '@wakeup/ui'
import { ServerRail } from './ServerRail'
import { ChannelSidebar } from './ChannelSidebar'
import { MainHeader } from './MainHeader'
import { MainContent } from './MainContent'
import { MembersList } from './MembersList'
import { CommandPalette } from '../components/CommandPalette'
import { SettingsOverlay } from '../pages/Settings'
import { CreateGroupDm } from '../components/CreateGroupDm'
import { useUIStore } from '../state/uiStore'
import { X } from 'lucide-react'

// ─── Flying Bird Intro Animation ─────────────────────────────────
const BIRD_ANIM_KEY = 'wakeup-bird-anim-played'

const birdKeyframes = `
@keyframes birdFly {
  0% {
    left: 36px;
    top: 55px;
    transform: scale(1) rotate(0deg);
  }
  15% {
    left: 18vw;
    top: 40px;
    transform: scale(1.1) rotate(-5deg);
  }
  35% {
    left: 38vw;
    top: 22vh;
    transform: scale(1.15) rotate(8deg);
  }
  55% {
    left: 55vw;
    top: 30vh;
    transform: scale(1.1) rotate(-4deg);
  }
  75% {
    left: 75vw;
    top: 12vh;
    transform: scale(1.05) rotate(6deg);
  }
  90% {
    left: calc(100vw - 60px);
    top: 50px;
    transform: scale(0.95) rotate(-2deg);
  }
  100% {
    left: calc(100vw - 50px);
    top: 52px;
    transform: scale(0) rotate(0deg);
  }
}
@keyframes birdOverlayFade {
  0%, 85% { opacity: 1; }
  100% { opacity: 0; }
}
`

function FlyingBirdIntro({ onComplete }: { onComplete: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      sessionStorage.setItem(BIRD_ANIM_KEY, '1')
      onComplete()
    }, 2000)
    return () => clearTimeout(timerRef.current)
  }, [onComplete])

  return (
    <>
      <style>{birdKeyframes}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'birdOverlayFade 2s ease-in forwards',
        }}
      >
        <img
          src="/logo.png"
          alt=""
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            objectFit: 'contain',
            animation: 'birdFly 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
          }}
        />
      </div>
    </>
  )
}

const gridStyles = {
  display: 'grid',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  gridTemplateAreas: `
    "rail sidebar header header"
    "rail sidebar main   aside"
  `,
  gridTemplateRows: `${discordLayout.headerHeight}px 1fr`,
  gridTemplateColumns: `${discordLayout.railWidth}px ${discordLayout.sidebarWidth}px 1fr ${discordLayout.asideWidth}px`,
} as const

const gridStylesCollapsed = {
  ...gridStyles,
  gridTemplateAreas: `
    "rail sidebar header"
    "rail sidebar main"
  `,
  gridTemplateColumns: `${discordLayout.railWidth}px ${discordLayout.sidebarWidth}px 1fr`,
} as const

function NotificationBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 36,
        backgroundColor: discordColors.green,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 500,
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onClick={onDismiss}
    >
      <span>
        Want to take full advantage of WakeUp? <strong>Unlock Night Pass</strong> for premium rituals, priority matching, and custom themes.
      </span>
      <div
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: 4,
          borderRadius: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <X size={18} color="#ffffff" />
      </div>
    </div>
  )
}

export function DiscordShell() {
  const { toggleInfoPanel, isInfoPanelOpen, isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useUIStore()
  const [showBanner, setShowBanner] = useState(true)
  const [showBirdAnim, setShowBirdAnim] = useState(() => !sessionStorage.getItem(BIRD_ANIM_KEY))

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openCommandPalette()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        toggleInfoPanel()
      }
    },
    [toggleInfoPanel, openCommandPalette]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {showBanner && <NotificationBanner onDismiss={() => setShowBanner(false)} />}
        <div style={{ ...(isInfoPanelOpen ? gridStyles : gridStylesCollapsed), height: undefined, flex: 1, overflow: 'hidden' }}>
        <nav
          style={{
            gridArea: 'rail',
            backgroundColor: discordColors.bgTertiary,
            overflow: 'hidden',
          }}
        >
          <ServerRail />
        </nav>

        <aside
          style={{
            gridArea: 'sidebar',
            backgroundColor: discordColors.bgSecondary,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ChannelSidebar />
        </aside>

        <header
          style={{
            gridArea: 'header',
            backgroundColor: discordColors.bgPrimary,
            height: discordLayout.headerHeight,
            boxShadow: '0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            zIndex: 1,
          }}
        >
          <MainHeader />
        </header>

        <main
          style={{
            gridArea: 'main',
            backgroundColor: discordColors.bgPrimary,
            overflow: 'hidden',
          }}
        >
          <MainContent>
            <Outlet />
          </MainContent>
        </main>

        {isInfoPanelOpen && (
          <aside
            style={{
              gridArea: 'aside',
              backgroundColor: discordColors.bgSecondary,
              borderLeft: `1px solid ${discordColors.border}`,
              overflow: 'auto',
            }}
          >
            <MembersList />
          </aside>
        )}
      </div>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />

      <SettingsOverlay />
      <CreateGroupDm />

      {showBirdAnim && <FlyingBirdIntro onComplete={() => setShowBirdAnim(false)} />}
    </>
  )
}
