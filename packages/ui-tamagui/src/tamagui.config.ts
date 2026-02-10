import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/config/v3'
import { createInterFont } from '@tamagui/font-inter'
import { discordColors } from './tokens/discord'

const headingFont = createInterFont({
  size: {
    6: 15,
    7: 18,
    8: 21,
    9: 28,
    10: 38,
  },
  weight: {
    6: '400',
    7: '600',
    8: '700',
  },
})

const bodyFont = createInterFont(
  {
    size: {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
    },
  },
  {
    sizeLineHeight: (size) => size + 6,
  }
)

// Discord dark theme using semantic Tamagui theme tokens
const discordDark = {
  background: discordColors.bgPrimary,
  backgroundHover: discordColors.bgModifierHover,
  backgroundPress: discordColors.bgModifierActive,
  backgroundFocus: discordColors.bgModifierActive,
  backgroundStrong: discordColors.bgSecondary,
  backgroundTransparent: 'transparent',

  color: discordColors.textNormal,
  colorHover: discordColors.textNormal,
  colorPress: discordColors.textNormal,
  colorFocus: discordColors.textNormal,
  colorTransparent: 'transparent',

  borderColor: discordColors.border,
  borderColorHover: discordColors.border,
  borderColorFocus: discordColors.brandPrimary,
  borderColorPress: discordColors.border,

  placeholderColor: discordColors.textMuted,

  // Semantic colors
  blue: discordColors.brandPrimary,
  green: discordColors.green,
  red: discordColors.red,
  yellow: discordColors.yellow,
}

export const config = createTamagui({
  themes: {
    ...themes,
    discordDark,
  },
  tokens,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  defaultTheme: 'discordDark',
})

export default config

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
