import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors, Spacing, BorderRadius } from '../constants/theme'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    key: '1',
    icon: '🚗',
    title: 'Covoiturage\nétudiant',
    body: "De Montréal à Québec, Tremblant, Ottawa ou ailleurs. Propose ou rejoins un trip en quelques secondes.",
    bg: Colors.ink,
    textColor: Colors.cream,
    subColor: 'rgba(245,240,232,0.65)',
    accentColor: Colors.accent,
  },
  {
    key: '2',
    icon: '🎓',
    title: 'Réseau de\nconfiance',
    body: "Uniquement accessible aux étudiants des universités montréalaises. Un badge vérifié pour chaque membre.",
    bg: Colors.accent,
    textColor: Colors.ink,
    subColor: 'rgba(26,22,18,0.65)',
    accentColor: Colors.ink,
  },
  {
    key: '3',
    icon: '💸',
    title: 'Partage les\nfrais',
    body: "Fixe ton prix par personne, coordonne le point de départ. Junto s'occupe des inscriptions à ta place.",
    bg: Colors.background,
    textColor: Colors.ink,
    subColor: Colors.inkMuted,
    accentColor: Colors.ink,
  },
]

export const ONBOARDING_KEY = 'junto_onboarding_done'

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatRef = useRef<FlatList>(null)

  const isLast = currentIndex === SLIDES.length - 1
  const slide = SLIDES[currentIndex]

  const handleNext = () => {
    if (isLast) {
      finish()
    } else {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
      setCurrentIndex(currentIndex + 1)
    }
  }

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)' as any)
  }

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle={slide.bg === Colors.ink ? 'light-content' : 'dark-content'} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          style={[styles.skipBtn, { top: insets.top + Spacing.md }]}
          onPress={finish}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: slide.subColor }]}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={SLIDES.length}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
            <Text style={[styles.body, { color: item.subColor }]}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? slide.textColor : slide.subColor,
                width: i === currentIndex ? 22 : 7,
              },
            ]}
          />
        ))}
      </View>

      {/* App name chip */}
      <View style={[styles.brandChip, { borderColor: slide.subColor }]}>
        <Text style={[styles.brandText, { color: slide.subColor }]}>Junto — étudiant · fiable · simple</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, { backgroundColor: slide.textColor }]}
        onPress={handleNext}
        activeOpacity={0.88}
      >
        <Text style={[styles.ctaText, { color: slide.bg === Colors.ink ? Colors.ink : Colors.cream }]}>
          {isLast ? "C'est parti !" : 'Suivant'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: Math.max(insets.bottom, Spacing.lg) }} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    position: 'absolute',
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    zIndex: 1,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 42,
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  brandChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.lg,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cta: {
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xxl + 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
