'use client'

import { Button } from 'antd'
import { links } from '@/lib/links'

interface CTAButtonsProps {
  size?: 'default' | 'large'
  className?: string
}

export function CTAButtons({ size = 'default', className = '' }: CTAButtonsProps) {
  const btnSize = size === 'large' ? 'large' : 'middle'

  return (
    <div className={`flex flex-col sm:flex-row gap-3 w-full sm:w-auto ${className}`}>
      <Button
        type="primary"
        size={btnSize}
        href={links.createAccount}
        style={{
          fontWeight: 600,
          borderRadius: 10,
          height: size === 'large' ? 48 : 40,
          paddingInline: size === 'large' ? 32 : 24,
          fontSize: size === 'large' ? 16 : 14,
        }}
      >
        Get Started Free
      </Button>
      <Button
        size={btnSize}
        href={links.signIn}
        style={{
          fontWeight: 600,
          borderRadius: 10,
          height: size === 'large' ? 48 : 40,
          paddingInline: size === 'large' ? 32 : 24,
          fontSize: size === 'large' ? 16 : 14,
        }}
      >
        Sign In
      </Button>
    </div>
  )
}
