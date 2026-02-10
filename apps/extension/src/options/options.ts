import { setTokens, setUser } from '../shared/storage'
import { api } from '../shared/api'
import { syncRules } from '../shared/rules'

const loadingEl = document.getElementById('loading')!
const successEl = document.getElementById('success')!
const errorEl = document.getElementById('error')!
const errorMessageEl = document.getElementById('error-message')!
const noCodeEl = document.getElementById('no-code')!

async function handleCodeExchange() {
  // Get code from URL
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    loadingEl.style.display = 'none'
    noCodeEl.style.display = 'block'
    return
  }

  try {
    // Exchange code for tokens
    const response = await api.exchangeCode(code)

    // Store tokens and user
    await setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    })
    await setUser(response.user)

    // Sync rules
    await syncRules()

    // Show success
    loadingEl.style.display = 'none'
    successEl.style.display = 'block'

    // Close tab after a moment
    setTimeout(() => {
      window.close()
    }, 2000)
  } catch (err) {
    console.error('Failed to exchange code:', err)
    loadingEl.style.display = 'none'
    errorEl.style.display = 'block'
    errorMessageEl.textContent = err instanceof Error ? err.message : 'Connection failed'
  }
}

handleCodeExchange()
