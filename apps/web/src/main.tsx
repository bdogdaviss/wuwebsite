import React from 'react'
import ReactDOM from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import { registerSW } from 'virtual:pwa-register'
import { config } from './tamagui.config'
import App from './App'

import '@tamagui/core/reset.css'

// Register service worker with auto-update
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TamaguiProvider config={config}>
      <App />
    </TamaguiProvider>
  </React.StrictMode>
)
