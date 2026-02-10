import { useState, useEffect } from 'react'
import { styled, Stack, Text, GetProps } from 'tamagui'
import { discordColors } from './tokens'

const AvatarContainer = styled(Stack, {
  name: 'Avatar',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: discordColors.brandPrimary,
  overflow: 'hidden',

  variants: {
    size: {
      xs: { width: 24, height: 24, borderRadius: 12 },
      sm: { width: 32, height: 32, borderRadius: 16 },
      md: { width: 40, height: 40, borderRadius: 20 },
      lg: { width: 48, height: 48, borderRadius: 24 },
      xl: { width: 80, height: 80, borderRadius: 16 },
    },
    shape: {
      circle: {},
      rounded: {},
    },
  } as const,

  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
})

const AvatarFallback = styled(Text, {
  color: 'white',
  fontWeight: '600',

  variants: {
    size: {
      xs: { fontSize: 10 },
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
      xl: { fontSize: 24 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

export interface AvatarProps extends GetProps<typeof AvatarContainer> {
  src?: string | null
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'rounded'
}

export function Avatar({ src, fallback, size = 'md', shape = 'circle', ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setImgError(false)
  }, [src])

  const initials = fallback
    ? fallback
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  // Apply rounded corners for 'rounded' shape based on size
  const borderRadiusOverride = shape === 'rounded'
    ? { borderRadius: size === 'xl' ? 16 : size === 'lg' ? 12 : 8 }
    : {}

  const showImage = src && !imgError

  return (
    <AvatarContainer size={size} shape={shape} {...borderRadiusOverride} {...props}>
      {showImage ? (
        <img
          src={src}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <AvatarFallback size={size}>{initials}</AvatarFallback>
      )}
    </AvatarContainer>
  )
}
