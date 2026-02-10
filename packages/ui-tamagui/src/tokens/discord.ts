// Discord-style color tokens
export const discordColors = {
  // Background layers (darkest to lightest)
  bgTertiary: '#1e1f22',      // Rail background
  bgSecondary: '#28282D',     // Sidebar background
  bgPrimary: '#2E2E34',       // Main content background
  bgModifierHover: '#35373c',
  bgModifierActive: '#404249',
  bgModifierSelected: '#404249',

  // Sidebar-specific hover/active (from Discord CSS reference)
  channelHover: '#38393b',    // Sidebar row hover
  channelActive: '#404249',   // Sidebar row active/selected
  channelTextHover: '#dbdee1', // Text on hover

  // Text colors
  textNormal: '#dbdee1',
  textMuted: '#949ba4',
  textLink: '#00a8fc',

  // Brand colors
  brandPrimary: '#5865f2',    // Discord blurple
  brandHover: '#4752c4',

  // Status colors
  statusOnline: '#44A25B',
  statusIdle: '#f0b232',
  statusDnd: '#f23f43',
  statusOffline: '#80848e',

  // Accent colors
  green: '#44A25B',
  yellow: '#f0b232',
  red: '#f23f43',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  headerBorder: 'rgba(0, 0, 0, 0.24)',

  // Rail specific
  railPill: '#ffffff',
  railIconHover: '#36373d',

  // Interactive (icons)
  interactiveNormal: '#b5bac1',
  interactiveHover: '#dbdee1',
  interactiveActive: '#ffffff',

  // Header
  headerPrimary: '#f2f3f5',

  // Channel/sidebar
  channelDefault: '#80848e',
  channelTextSelected: '#ffffff',

  // Search
  searchBg: '#1e1f22',

  // Shadows
  shadowMd: 'rgba(0, 0, 0, 0.3)',
} as const

// Layout constants
export const discordLayout = {
  // Web dimensions (exact Discord geometry)
  railWidth: 72,
  sidebarWidth: 240,
  headerHeight: 48,
  asideWidth: 340,

  // Mobile dimensions
  mobileHeaderHeight: 56,
  tabBarHeight: 60,
  sheetHandleHeight: 24,

  // Border radii (server icon animation)
  iconRadiusCircle: 24,   // Default circle
  iconRadiusHover: 16,    // On hover
  iconRadiusActive: 13,   // Active state

  // Transitions
  transitionFast: '100ms',
  transitionNormal: '150ms',
  transitionSlow: '300ms',
} as const

export type DiscordColors = typeof discordColors
export type DiscordLayout = typeof discordLayout
