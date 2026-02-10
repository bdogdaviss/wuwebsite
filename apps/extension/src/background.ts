import { syncRules } from './shared/rules'
import { isConnected, getEnabled } from './shared/storage'

// Sync rules on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension starting up...')
  const connected = await isConnected()
  if (connected) {
    await syncRules()
  }
})

// Sync rules when extension is installed/updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated')

  // Create alarm for periodic sync
  chrome.alarms.create('syncRules', { periodInMinutes: 5 })

  const connected = await isConnected()
  if (connected) {
    await syncRules()
  }
})

// Handle alarm for periodic sync
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncRules') {
    const connected = await isConnected()
    const enabled = await getEnabled()
    if (connected && enabled) {
      await syncRules()
    }
  }
})

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_RULES') {
    syncRules()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true // Keep channel open for async response
  }

  if (message.type === 'TOGGLE_ENABLED') {
    syncRules()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }

  return false
})

console.log('WakeUp background service worker loaded')
