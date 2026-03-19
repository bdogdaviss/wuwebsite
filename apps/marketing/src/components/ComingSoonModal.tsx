'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ComingSoonModalProps {
  open: boolean
  onClose: () => void
  product: string
}

export function ComingSoonModal({ open, onClose, product }: ComingSoonModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to an API
    console.log('Waitlist signup:', { email, product })
    setSubmitted(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
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
                maxWidth: 420,
                padding: 32,
                background: '#0B1220',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                pointerEvents: 'auto',
              }}
            >
              <button
                onClick={handleClose}
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

              {submitted ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    You&apos;re on the list!
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>
                    We&apos;ll notify you when {product} is ready.
                  </p>
                </div>
              ) : (
                <>
                  <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    {product} is coming soon
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                    Want early access? Drop your email and we&apos;ll notify you first.
                  </p>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Notify me
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
