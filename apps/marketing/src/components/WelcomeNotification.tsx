'use client'

import { useEffect, useRef } from 'react'
import { notification } from 'antd'

export function WelcomeNotification() {
  const [api, contextHolder] = notification.useNotification({ top: 80 })
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return
    shown.current = true
    api.info({
      title: 'Welcome to WakeUp',
      description: 'Connect with people who are awake right now!',
      placement: 'topLeft',
      duration: 5,
    })
  }, [api])

  return <>{contextHolder}</>
}
