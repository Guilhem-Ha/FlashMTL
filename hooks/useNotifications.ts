import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { savePushToken } from '../lib/api'
import { SUPABASE_URL } from '../constants/theme'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

// expo-notifications ne fonctionne pas dans Expo Go depuis SDK 53
// Seulement disponible dans un development build ou production
const IS_EXPO_GO = Constants.appOwnership === 'expo'

// Configure how notifications are displayed while app is foregrounded
// (no-op en Expo Go, mais n'errore pas)
if (!IS_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

export async function registerForPushNotifications(): Promise<string | null> {
  // Pas supporté dans Expo Go depuis SDK 53
  if (IS_EXPO_GO) return null

  if (!Device.isDevice) return null

  // Android: create a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FlashMTL',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C8A96E',
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const tokenData = await Notifications.getExpoPushTokenAsync()
  return tokenData.data
}

export function useNotifications(userId: string | undefined) {
  useEffect(() => {
    // Pas de notifications en Expo Go — silencieux
    if (IS_EXPO_GO || !userId) return

    // Register and save token
    registerForPushNotifications().then(async token => {
      if (token && !USE_MOCK) {
        await savePushToken(userId, token)
      }
    })

    // Listen for incoming notifications (foreground)
    const subReceived = Notifications.addNotificationReceivedListener(
      _notification => {
        // Notification displayed via handler above
      }
    )

    // Listen for user tapping a notification
    const subResponse = Notifications.addNotificationResponseReceivedListener(
      _response => {
        // Navigate based on _response.notification.request.content.data
      }
    )

    return () => {
      subReceived.remove()
      subResponse.remove()
    }
  }, [userId])
}
