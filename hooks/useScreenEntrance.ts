import { useRef, useCallback, useEffect } from 'react'
import { Animated } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

/**
 * Fade + slide-up animation that triggers each time the screen is focused.
 * Use on navigation stack screens (offre detail, auth, etc.) via Animated.View root.
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

/**
 * Fade + slide-up animation driven by an `active` boolean prop.
 * Use on PagerView tab screens where focus events don't fire automatically.
 */
export function useActiveEntrance(active: boolean, duration = 220, translateDistance = 14) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(translateDistance)).current

  useEffect(() => {
    if (active) {
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
    }
  }, [active])

  return {
    style: {
      opacity,
      transform: [{ translateY }],
    } as const,
  }
}
