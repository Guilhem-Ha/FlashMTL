import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider, useAuth } from '../lib/authContext'
import { useNotifications } from '../hooks/useNotifications'
import { ONBOARDING_KEY } from './onboarding'
// Note: offre screens kept for future use

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

function AppNavigator() {
  const { user } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  useNotifications(user?.id)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setOnboardingDone(val === 'true')
      SplashScreen.hideAsync()
    })
  }, [])

  if (onboardingDone === null) return null

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

      {/* Fiche offre — slide classique depuis la droite */}
      <Stack.Screen
        name="offre/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
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

      {/* Bon de réduction — modal plein écran, pas de swipe down */}
      <Stack.Screen
        name="offre/redemption"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: false,
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
