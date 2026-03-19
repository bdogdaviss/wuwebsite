'use client'

import { motion } from 'framer-motion'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  scale?: boolean
}

export function FadeIn({
  children,
  className,
  style,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  scale = false,
}: FadeInProps) {
  const offsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, ...offsets[direction], ...(scale ? { scale: 0.95 } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(scale ? { scale: 1 } : {}) }}
      transition={{ duration, delay, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}
