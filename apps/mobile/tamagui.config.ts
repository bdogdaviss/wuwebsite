import { config } from '@wakeup/ui-tamagui'

export { config }
export default config

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
