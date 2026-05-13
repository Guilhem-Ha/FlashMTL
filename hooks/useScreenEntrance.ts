import { useRef, useCallback } from 'react'
import { Animated } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

/**
 * Fade + slide-up animation that triggers each time the screen is focused.
 * Use the returned style on the screen's root Animated.View.
 */
export function useScreenEntrance(duration = 220, translateDistance = 14) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(translateDistance)).current

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0)
      translateY.setValue(translateDistance)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start()
    }, [duration, translateDistance])
  )

  return {
    style: {
      opacity,
      transform: [{ translateY }],
    } as const,
  }
}
