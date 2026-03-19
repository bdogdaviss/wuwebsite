'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STORAGE_KEY = 'wakeup_exit_intent_last'
const COOLDOWN_DAYS = 14

export function ExitIntentModal() {
  const [visible, setVisible] = useState(false)

  const handleMouseOut = useCallback((e: MouseEvent) => {
    if (e.clientY < 10 && e.relatedTarget === null) {
      setVisible(true)
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  useEffect(() => {
    // Only desktop (devices with hover)
    if (!window.matchMedia('(hover: hover)').matches) return

    // Check cooldown
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
      if (daysSince < COOLDOWN_DAYS) return
    }

    // Wait 5s before enabling — don't trigger on initial load
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handleMouseOut)
    }, 5000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [handleMouseOut])

  const close = () => setVisible(false)

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              padding: 16,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                width: '100%',
                maxWidth: 440,
                padding: 32,
                background: '#0B1220',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                textAlign: 'center',
                pointerEvents: 'auto',
              }}
            >
              <button
                onClick={close}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>

              <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Before you go...
              </h3>
              <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
                WakeUp is free to start. No credit card, no commitment.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href="/register"
                  onClick={close}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  Start free — takes 30 seconds
                </Link>
                <button
                  onClick={close}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 10,
                    background: 'transparent',
                    color: '#9ca3af',
                    fontSize: 14,
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                  }}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
