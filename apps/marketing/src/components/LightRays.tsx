'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface LightRaysProps {
  count?: number
  color?: string
  blur?: number
  speed?: number
  length?: string
  className?: string
  style?: CSSProperties
}

type LightRay = {
  id: string
  left: number
  rotate: number
  width: number
  swing: number
  delay: number
  duration: number
  intensity: number
}

const createRays = (count: number, cycle: number): LightRay[] => {
  if (count <= 0) return []

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84
    const rotate = -28 + Math.random() * 56
    const width = 160 + Math.random() * 160
    const swing = 0.8 + Math.random() * 1.8
    const delay = Math.random() * cycle
    const duration = cycle * (0.75 + Math.random() * 0.5)
    const intensity = 0.6 + Math.random() * 0.5

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    }
  })
}

function Ray({ left, rotate, width, swing, delay, duration, intensity }: LightRay) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '-12%',
        left: `${left}%`,
        height: 'var(--light-rays-length)',
        width: `${width}px`,
        transformOrigin: 'top center',
        transform: `translateX(-50%)`,
        borderRadius: '9999px',
        background:
          'linear-gradient(to bottom, var(--light-rays-color), transparent)',
        mixBlendMode: 'screen',
        filter: 'blur(var(--light-rays-blur))',
        pointerEvents: 'none',
        opacity: 0,
      }}
      initial={{ rotate }}
      animate={{
        opacity: [0, intensity, 0],
        rotate: [rotate - swing, rotate + swing, rotate - swing],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
        repeatDelay: duration * 0.1,
      }}
    />
  )
}

export function LightRays({
  className,
  style,
  count = 7,
  color = 'rgba(37, 99, 235, 0.18)',
  blur = 36,
  speed = 14,
  length = '70vh',
}: LightRaysProps) {
  const [rays, setRays] = useState<LightRay[]>([])
  const cycleDuration = Math.max(speed, 0.1)

  useEffect(() => {
    setRays(createRays(count, cycleDuration))
  }, [count, cycleDuration])

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        '--light-rays-color': color,
        '--light-rays-blur': `${blur}px`,
        '--light-rays-length': length,
        ...style,
      } as CSSProperties}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Ambient glow spots */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.6,
            background: `radial-gradient(circle at 20% 15%, ${color}, transparent 70%)`,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.6,
            background: `radial-gradient(circle at 80% 10%, ${color}, transparent 75%)`,
          }}
        />
        {rays.map((ray) => (
          <Ray key={ray.id} {...ray} />
        ))}
      </div>
    </div>
  )
}
