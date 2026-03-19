import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Theme, YStack, Spinner, Text } from 'tamagui'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { DiscordShell } from './layout/DiscordShell'
import { Overview } from './pages/Overview'
import { Discover } from './pages/Discover'
import { Rituals } from './pages/Rituals'
import { DirectMessage } from './pages/DirectMessage'
import { NestChannelView } from './pages/NestChannelView'
import { ExtensionConnect } from './pages/ExtensionConnect'
import { YouWake, hasCompletedYouWake } from './pages/YouWake'
import { discordColors } from '@wakeup/ui'


function LoadingScreen() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: 'var(--app-vh)' }}
      backgroundColor={discordColors.bgPrimary}
    >
      <Spinner size="large" color={discordColors.brandPrimary} />
      <Text marginTop="$4" color={discordColors.textMuted}>
        Loading...
      </Text>
    </YStack>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/** Redirects to /you-wake if the user hasn't completed it this session */
function RequireYouWake({ children }: { children: React.ReactNode }) {
  if (!hasCompletedYouWake()) {
    return <Navigate to="/you-wake" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* You Wake? screen — shown once per session before dashboard */}
      <Route
        path="/you-wake"
        element={
          <ProtectedRoute>
            <YouWake />
          </ProtectedRoute>
        }
      />

      {/* Extension connect - protected but outside AppShell */}
      <Route
        path="/extension-connect"
        element={
          <ProtectedRoute>
            <ExtensionConnect />
          </ProtectedRoute>
        }
      />

      {/* Protected routes with DiscordShell — gated behind YouWake */}
      <Route
        element={
          <ProtectedRoute>
            <RequireYouWake>
              <DiscordShell />
            </RequireYouWake>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Overview />} />
        <Route path="/dm/:id" element={<DirectMessage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/rituals" element={<Rituals />} />
        <Route path="/nest/:nestId/:channelId" element={<NestChannelView />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Theme name="discordDark">
      <div style={{ minHeight: 'var(--app-vh)', backgroundColor: discordColors.bgPrimary }}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>

      </div>
    </Theme>
  )
}

export default App
