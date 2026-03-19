const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const links = {
  signIn: `${APP_URL}/login`,
  createAccount: '/register',
  dashboard: `${APP_URL}/`,
}

export { APP_URL, API_URL }
