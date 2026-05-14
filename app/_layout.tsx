import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts, Nunito_900Black } from '@expo-google-fonts/nunito'
import { AuthProvider, useAuth } from '../lib/authContext'
import { useNotifications } from '../hooks/useNotifications'
import { LocaleProvider, LOCALE_KEY } from '../lib/locale'
import i18n from '../lib/i18n'
import { ONBOARDING_KEY } from './onboarding'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

function AppNavigator() {
  const { user } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const [initialLocale, setInitialLocale] = useState<string | null>(null)
  const [fontsLoaded] = useFonts({ Nunito_900Black })
  useNotifications(user?.id)

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(LOCALE_KEY),
    ]).then(([onboardingVal, localeVal]) => {
      // Apply saved locale before any screen renders
      if (localeVal) i18n.locale = localeVal
      setOnboardingDone(onboardingVal === 'true')
      setInitialLocale(localeVal ?? i18n.locale)
    })
  }, [])

  useEffect(() => {
    if (onboardingDone !== null && fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [onboardingDone, fontsLoaded])

  if (onboardingDone === null || !fontsLoaded || initialLocale === null) return null

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <Stack
        initialRouteName={onboardingDone ? '(tabs)' : 'onboarding'}
        screenOptions={{
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        {/* Onboarding */}
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

        {/* Auth */}
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

        {/* Création trip */}
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
    </LocaleProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}
