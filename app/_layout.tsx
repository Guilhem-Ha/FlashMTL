import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '../lib/authContext'
import { useNotifications } from '../hooks/useNotifications'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

// Inner component so it can access AuthContext
function AppNavigator() {
  const { user } = useAuth()
  useNotifications(user?.id)

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="offre/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="transport/create" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
