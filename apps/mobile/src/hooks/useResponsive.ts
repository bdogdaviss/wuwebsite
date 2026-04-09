import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

export type WidthBucket = 'compact' | 'standard' | 'large'
export type HeightCategory = 'short' | 'regular' | 'tall'

export interface ResponsiveValues {
  width: number
  height: number
  widthBucket: WidthBucket
  heightCategory: HeightCategory
  /** 0.85 for compact, 1.0 for standard, 1.1 for large */
  spacing: number
  /** 0.9 for compact, 1.0 for standard, 1.05 for large */
  font: number
  /** Horizontal screen padding */
  px: number
  /** Avatar size for lists */
  avatarSize: number
  /** List item vertical padding */
  listPadding: number
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions()

  return useMemo(() => {
    const widthBucket: WidthBucket =
      width < 390 ? 'compact' : width < 430 ? 'standard' : 'large'

    const heightCategory: HeightCategory =
      height < 700 ? 'short' : height < 850 ? 'regular' : 'tall'

    const spacing = widthBucket === 'compact' ? 0.85 : widthBucket === 'standard' ? 1.0 : 1.1
    const font = widthBucket === 'compact' ? 0.9 : widthBucket === 'standard' ? 1.0 : 1.05

    const px = widthBucket === 'compact' ? 12 : widthBucket === 'standard' ? 16 : 20
    const avatarSize = widthBucket === 'compact' ? 36 : widthBucket === 'standard' ? 40 : 44
    const listPadding = widthBucket === 'compact' ? 10 : 14

    return {
      width,
      height,
      widthBucket,
      heightCategory,
      spacing,
      font,
      px,
      avatarSize,
      listPadding,
    }
  }, [width, height])
}
