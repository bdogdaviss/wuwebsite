// Storage keys
const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ENABLED: 'enabled',
  LAST_RULES_SYNC: 'lastRulesSyncAt',
} as const

export interface User {
  id: string
  email: string
  display_name: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

// Token management
export async function getTokens(): Promise<Tokens | null> {
  const result = await chrome.storage.local.get([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN])
  if (result[KEYS.ACCESS_TOKEN] && result[KEYS.REFRESH_TOKEN]) {
    return {
      accessToken: result[KEYS.ACCESS_TOKEN],
      refreshToken: result[KEYS.REFRESH_TOKEN],
    }
  }
  return null
}

export async function setTokens(tokens: Tokens): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.ACCESS_TOKEN]: tokens.accessToken,
    [KEYS.REFRESH_TOKEN]: tokens.refreshToken,
  })
}

export async function clearTokens(): Promise<void> {
  await chrome.storage.local.remove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER])
}

// User management
export async function getUser(): Promise<User | null> {
  const result = await chrome.storage.local.get(KEYS.USER)
  return result[KEYS.USER] || null
}

export async function setUser(user: User): Promise<void> {
  await chrome.storage.local.set({ [KEYS.USER]: user })
}

// Enabled state
export async function getEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(KEYS.ENABLED)
  return result[KEYS.ENABLED] ?? false
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEYS.ENABLED]: enabled })
}

// Last sync time
export async function getLastRulesSync(): Promise<number | null> {
  const result = await chrome.storage.local.get(KEYS.LAST_RULES_SYNC)
  return result[KEYS.LAST_RULES_SYNC] || null
}

export async function setLastRulesSync(timestamp: number): Promise<void> {
  await chrome.storage.local.set({ [KEYS.LAST_RULES_SYNC]: timestamp })
}

// Check if connected
export async function isConnected(): Promise<boolean> {
  const tokens = await getTokens()
  return tokens !== null
}
