import { isConnected, getUser, getEnabled, setEnabled, clearTokens, setUser, setTokens } from '../shared/storage'
import { api } from '../shared/api'
import { getRuleCount, syncRules } from '../shared/rules'

// DOM Elements
const notConnectedEl = document.getElementById('not-connected')!
const connectedEl = document.getElementById('connected')!
const emailInput = document.getElementById('email-input') as HTMLInputElement
const passwordInput = document.getElementById('password-input') as HTMLInputElement
const loginBtn = document.getElementById('login-btn')!
const loginErrorEl = document.getElementById('login-error')!
const userStatusEl = document.getElementById('user-status')!
const enabledToggle = document.getElementById('enabled-toggle') as HTMLInputElement
const activeSessionEl = document.getElementById('active-session')!
const sessionTimeEl = document.getElementById('session-time')!
const startBtn = document.getElementById('start-btn')!
const stopBtn = document.getElementById('stop-btn')!
const syncBtn = document.getElementById('sync-btn')!
const ruleCountEl = document.getElementById('rule-count')!
const disconnectBtn = document.getElementById('disconnect-btn')!

let sessionTimer: ReturnType<typeof setInterval> | null = null
let sessionStartTime: Date | null = null

// Initialize popup
async function init() {
  const connected = await isConnected()

  if (!connected) {
    notConnectedEl.classList.remove('hidden')
    connectedEl.classList.add('hidden')
    return
  }

  notConnectedEl.classList.add('hidden')
  connectedEl.classList.remove('hidden')

  // Load user info
  let user = await getUser()
  if (!user) {
    try {
      user = await api.me()
      await setUser(user)
    } catch (err) {
      console.error('Failed to fetch user:', err)
    }
  }

  if (user) {
    userStatusEl.textContent = `Connected as ${user.display_name}`
  }

  // Load enabled state
  const enabled = await getEnabled()
  enabledToggle.checked = enabled

  // Load rule count
  await updateRuleCount()

  // Check for active session
  await checkActiveSession()
}

async function updateRuleCount() {
  const count = await getRuleCount()
  ruleCountEl.textContent = `${count} rule${count !== 1 ? 's' : ''} active`
}

async function checkActiveSession() {
  try {
    const response = await api.getActiveSession()
    if (response.session) {
      showActiveSession(new Date(response.session.started_at))
    } else {
      hideActiveSession()
    }
  } catch (err) {
    console.error('Failed to check active session:', err)
    hideActiveSession()
  }
}

function showActiveSession(startTime: Date) {
  sessionStartTime = startTime
  activeSessionEl.classList.remove('hidden')
  startBtn.classList.add('hidden')
  stopBtn.classList.remove('hidden')
  updateSessionTime()

  if (sessionTimer) clearInterval(sessionTimer)
  sessionTimer = setInterval(updateSessionTime, 1000)
}

function hideActiveSession() {
  sessionStartTime = null
  activeSessionEl.classList.add('hidden')
  startBtn.classList.remove('hidden')
  stopBtn.classList.add('hidden')

  if (sessionTimer) {
    clearInterval(sessionTimer)
    sessionTimer = null
  }
}

function updateSessionTime() {
  if (!sessionStartTime) return

  const now = new Date()
  const diffMs = now.getTime() - sessionStartTime.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    sessionTimeEl.textContent = `${hours}h ${mins}m`
  } else {
    sessionTimeEl.textContent = `${mins}m`
  }
}

// Event Handlers
enabledToggle.addEventListener('change', async () => {
  const enabled = enabledToggle.checked
  await setEnabled(enabled)

  // Notify background to sync rules
  chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' })

  await updateRuleCount()
})

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true
  startBtn.textContent = 'Starting...'

  try {
    const session = await api.startSession()
    showActiveSession(new Date(session.started_at))

    // Auto-enable blocking when session starts
    await setEnabled(true)
    enabledToggle.checked = true
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' })
    await updateRuleCount()
  } catch (err) {
    console.error('Failed to start session:', err)
    alert('Failed to start session')
  } finally {
    startBtn.disabled = false
    startBtn.textContent = 'Start Focus'
  }
})

stopBtn.addEventListener('click', async () => {
  stopBtn.disabled = true
  stopBtn.textContent = 'Stopping...'

  try {
    await api.stopSession()
    hideActiveSession()

    // Auto-disable blocking when session stops
    await setEnabled(false)
    enabledToggle.checked = false
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' })
    await updateRuleCount()
  } catch (err) {
    console.error('Failed to stop session:', err)
    alert('Failed to stop session')
  } finally {
    stopBtn.disabled = false
    stopBtn.textContent = 'Stop Focus'
  }
})

syncBtn.addEventListener('click', async () => {
  syncBtn.disabled = true
  syncBtn.textContent = 'Syncing...'

  try {
    await syncRules()
    await updateRuleCount()
  } catch (err) {
    console.error('Failed to sync rules:', err)
    alert('Failed to sync rules')
  } finally {
    syncBtn.disabled = false
    syncBtn.textContent = 'Sync Rules'
  }
})

disconnectBtn.addEventListener('click', async () => {
  if (confirm('Disconnect from WakeUp?')) {
    await clearTokens()
    await setEnabled(false)
    chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' })
    init()
  }
})

// Login handler
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  const password = passwordInput.value

  if (!email || !password) {
    loginErrorEl.textContent = 'Please enter email and password'
    loginErrorEl.classList.remove('hidden')
    return
  }

  loginBtn.textContent = 'Signing in...'
  ;(loginBtn as HTMLButtonElement).disabled = true
  loginErrorEl.classList.add('hidden')

  try {
    const response = await api.login(email, password)

    // Store tokens and user
    await setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })
    await setUser(response.user)

    // Sync rules
    await syncRules()

    // Refresh the UI
    init()
  } catch (err) {
    console.error('Failed to login:', err)
    loginErrorEl.textContent = err instanceof Error ? err.message : 'Login failed'
    loginErrorEl.classList.remove('hidden')
  } finally {
    loginBtn.textContent = 'Sign In'
    ;(loginBtn as HTMLButtonElement).disabled = false
  }
})

// Allow Enter key to submit login
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loginBtn.click()
  }
})

// Initialize
init()
