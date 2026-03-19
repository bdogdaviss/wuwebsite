'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'wakeup_cookies_accepted'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Delay slightly so it doesn't compete with page load
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px 24px',
            background: 'rgba(11, 18, 32, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
            We use cookies to improve your experience.{' '}
            <a
              href="/privacy"
              style={{
                color: '#60a5fa',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Privacy policy
            </a>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={accept}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                background: '#2563eb',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Accept
            </button>
            <button
              onClick={accept}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                background: 'transparent',
                color: '#9ca3af',
                fontSize: 13,
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              Manage
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
