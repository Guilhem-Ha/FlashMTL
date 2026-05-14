import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito'
import { AuthProvider, useAuth } from '../lib/authContext'
import { useNotifications } from '../hooks/useNotifications'
import { ONBOARDING_KEY } from './onboarding'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

function AppNavigator() {
  const { user } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const [fontsLoaded] = useFonts({ Nunito_900Black })
  useNotifications(user?.id)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setOnboardingDone(val === 'true')
      if (fontsLoaded) SplashScreen.hideAsync()
    })
  }, [fontsLoaded])

  // Keep splash visible until both fonts and onboarding state are ready
  if (onboardingDone === null || !fontsLoaded) return null

  return (
    <Stack
      initialRouteName={onboardingDone ? '(tabs)' : 'onboarding'}
      screenOptions={{
        gestureEnabled: true,
        fullScreenGestureEnabled: true,   // swipe back depuis n'importe où sur iOS
      }}
    >
      {/* Onboarding — fade simple, pas de retour arrière */}
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
        }}
      />

      {/* Onglets principaux */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />

      {/* Auth — monte depuis le bas */}
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      />

      {/* Création trip — modal swipe-down */}
      <Stack.Screen
        name="transport/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
