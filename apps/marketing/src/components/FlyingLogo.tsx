'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const ANIM_KEY = 'wakeup-marketing-bird-played'

const keyframes = `
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

export function FlyingLogo() {
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!sessionStorage.getItem(ANIM_KEY)) {
      setShow(true)
    }
  }, [])

  const onComplete = useCallback(() => {
    sessionStorage.setItem(ANIM_KEY, '1')
    setShow(false)
  }, [])

  useEffect(() => {
    if (!show) return
    timerRef.current = setTimeout(onComplete, 2000)
    return () => clearTimeout(timerRef.current)
  }, [show, onComplete])

  if (!show) return null

  return (
    <>
      <style>{keyframes}</style>
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
