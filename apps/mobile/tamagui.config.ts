import { createTamagui } from 'tamagui'
import { config as tamaguiConfig } from '@tamagui/config/v3'

export const config = createTamagui(tamaguiConfig)

export default config

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
