import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone === true)
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSBanner, setShowIOSBanner] = useState(false)

  useEffect(() => {
    // Already installed — don't show anything
    if (isInStandaloneMode()) return

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    if (isIOS()) {
      setShowIOSBanner(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOSBanner(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  // iOS banner
  if (showIOSBanner) {
    return (
      <div style={styles.backdrop}>
        <div style={styles.banner}>
          <img src="/pwa-192x192.png" alt="Wakeup" style={styles.icon} />
          <div style={styles.textContainer}>
            <div style={styles.title}>Install Wakeup</div>
            <div style={styles.subtitle}>
              Tap{' '}
              <span style={styles.shareIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5865f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>
              {' '}Share then <strong>"Add to Home Screen"</strong>
            </div>
          </div>
          <button onClick={handleDismiss} style={styles.dismissX}>
            ✕
          </button>
        </div>
        <div style={styles.arrow} />
      </div>
    )
  }

  // Android/desktop banner
  if (!showBanner || !deferredPrompt) {
    return null
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.banner}>
        <img src="/pwa-192x192.png" alt="Wakeup" style={styles.icon} />
        <div style={styles.textContainer}>
          <div style={styles.title}>Install Wakeup</div>
          <div style={styles.subtitle}>
            Add to your home screen for the best experience
          </div>
        </div>
        <div style={styles.buttons}>
          <button onClick={handleInstall} style={styles.installButton}>
            Install
          </button>
          <button onClick={handleDismiss} style={styles.dismissButton}>
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
    position: 'relative',
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
    lineHeight: '1.5',
    marginTop: '2px',
  },
  shareIcon: {
    display: 'inline-block',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid #28282D',
    margin: '0 auto',
    pointerEvents: 'none' as const,
  },
  dismissX: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#8E8E93',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
    pointerEvents: 'auto',
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
