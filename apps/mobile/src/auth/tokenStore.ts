import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'wakeup_access_token'
const REFRESH_TOKEN_KEY = 'wakeup_refresh_token'

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export async function getTokens(): Promise<Tokens | null> {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken }
    }
    return null
  } catch (error) {
    console.error('Failed to get tokens:', error)
    return null
  }
}

export async function setTokens(tokens: Tokens): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken)
  } catch (error) {
    console.error('Failed to set tokens:', error)
    throw error
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to clear tokens:', error)
  }
}
