const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const links = {
  signIn: `${APP_URL}/login`,
  createAccount: `${APP_URL}/register`,
  dashboard: `${APP_URL}/`,
}

export { APP_URL }
