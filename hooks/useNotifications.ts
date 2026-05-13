import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { savePushToken } from '../lib/api'
import { SUPABASE_URL } from '../constants/theme'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

// Configure how notifications are displayed while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Simulators / emulators can't receive push notifications
    return null
  }

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
    if (!userId) return

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
        // Could navigate to relevant screen based on
        // _response.notification.request.content.data
      }
    )

    return () => {
      subReceived.remove()
      subResponse.remove()
    }
  }, [userId])
}
