import { ReactNode, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, config } from '@react-spring/web'
import { discordColors } from '@wakeup/ui'
import { useUIStore } from '../state/uiStore'

interface MobilePanelsProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
}

const LEFT_PANEL_WIDTH = 280
const CENTER_PANEL_WIDTH = 280

export function MobilePanels({ leftPanel, centerPanel, rightPanel }: MobilePanelsProps) {
  const { mobilePanelState, closeMobilePanels, openCenterPanel } = useUIStore()

  // Animation for left panel (server/nest list)
  const [leftPanelSpring, leftPanelApi] = useSpring(() => ({
    x: -LEFT_PANEL_WIDTH,
    config: config.stiff,
  }))

  // Animation for backdrop
  const [backdropSpring, backdropApi] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }))

  // Update animations when panel state changes
  useEffect(() => {
    if (mobilePanelState === 'left-open' || mobilePanelState === 'center-open') {
      leftPanelApi.start({ x: 0 })
      backdropApi.start({ opacity: 1 })
    } else {
      leftPanelApi.start({ x: -LEFT_PANEL_WIDTH })
      backdropApi.start({ opacity: 0 })
    }
  }, [mobilePanelState, leftPanelApi, backdropApi])

  // Drag gesture for closing panels
  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dirX], cancel }) => {
      // Only handle gestures when panels are open
      if (mobilePanelState === 'closed') {
        cancel?.()
        return
      }

      // Close on fast swipe left
      if (!down && vx > 0.5 && dirX < 0) {
        closeMobilePanels()
      }
      // Follow finger during drag (only allow closing motion)
      else if (down && mx < 0) {
        const newX = Math.max(-LEFT_PANEL_WIDTH, mx)
        leftPanelApi.start({ x: newX, immediate: true })
        backdropApi.start({ opacity: 1 + (newX / LEFT_PANEL_WIDTH), immediate: true })
      }
      // Snap back or close based on threshold
      else if (!down) {
        if (mx < -LEFT_PANEL_WIDTH / 3) {
          closeMobilePanels()
        } else {
          leftPanelApi.start({ x: 0 })
          backdropApi.start({ opacity: 1 })
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  )

  // Edge swipe from left side to open center panel
  const edgeBind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dirX] }) => {
      if (mobilePanelState !== 'closed') return
      if (!active && (mx > 50 || (vx > 0.3 && dirX > 0 && mx > 15))) {
        openCenterPanel()
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Backdrop */}
      <animated.div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          opacity: backdropSpring.opacity,
          pointerEvents: mobilePanelState !== 'closed' ? 'auto' : 'none',
          zIndex: 10,
        }}
        onClick={closeMobilePanels}
      />

      {/* Left Panel (ServerRail / Nest list) */}
      <animated.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: LEFT_PANEL_WIDTH,
          backgroundColor: discordColors.bgTertiary,
          transform: leftPanelSpring.x.to((x) => `translateX(${x}px)`),
          zIndex: 20,
          overflow: 'auto',
        }}
      >
        {leftPanel}
      </animated.div>

      {/* Center Panel (ChannelSidebar) - slides over left panel */}
      <animated.div
        {...bind()}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: CENTER_PANEL_WIDTH,
          backgroundColor: discordColors.bgSecondary,
          transform: leftPanelSpring.x.to((x) => {
            // Center panel only shows when left panel is open
            if (mobilePanelState === 'center-open') {
              return `translateX(${LEFT_PANEL_WIDTH + x}px)`
            }
            return `translateX(${x - CENTER_PANEL_WIDTH}px)`
          }),
          zIndex: 30,
          overflow: 'auto',
          touchAction: 'pan-y',
        }}
      >
        {centerPanel}
      </animated.div>

      {/* Right Panel (Main content) - always visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: discordColors.bgPrimary,
          zIndex: 5,
        }}
      >
        {rightPanel}
      </div>

      {/* Edge swipe zone to open panels */}
      {mobilePanelState === 'closed' && (
        <div
          {...edgeBind()}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 20,
            zIndex: 8,
            touchAction: 'pan-y',
          }}
        />
      )}
    </div>
  )
}
