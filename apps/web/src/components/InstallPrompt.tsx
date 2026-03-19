import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Don't render if already installed as standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return null
  }

  if (!showBanner || !deferredPrompt) {
    return null
  }

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.banner}>
        <img
          src="/pwa-192x192.png"
          alt="Wakeup"
          style={styles.icon}
        />
        <div style={styles.textContainer}>
          <div style={styles.title}>Install Wakeup</div>
          <div style={styles.subtitle}>
            Add to your home screen for the best experience
          </div>
        </div>
        <div style={styles.buttons}>
          <button
            onClick={handleInstall}
            style={styles.installButton}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            style={styles.dismissButton}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    padding: '12px',
    pointerEvents: 'none',
  },
  banner: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#28282D',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    maxWidth: '420px',
    margin: '0 auto',
  },
  icon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '1.3',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: '13px',
    lineHeight: '1.3',
    marginTop: '2px',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flexShrink: 0,
  },
  installButton: {
    backgroundColor: '#5865f2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    color: '#8E8E93',
    border: 'none',
    padding: '4px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}
