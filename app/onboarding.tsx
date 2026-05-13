import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, StatusBar, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors, Spacing, BorderRadius } from '../constants/theme'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    key: '1',
    icon: '⚡',
    title: 'Des offres flash\nexclusives',
    body: "Jusqu'à −50% dans les restos, bars et shows de Montréal. Les offres apparaissent en fin de journée et expirent vite.",
    bg: Colors.ink,
    textColor: Colors.cream,
    subColor: 'rgba(245,240,232,0.7)',
  },
  {
    key: '2',
    icon: '🚗',
    title: 'Covoiturage\nentre étudiants',
    body: 'Organise ou rejoins un trip vers Mont-Tremblant, Québec ou ailleurs. Partage les frais, fais des rencontres.',
    bg: Colors.accent,
    textColor: Colors.ink,
    subColor: 'rgba(26,22,18,0.65)',
  },
  {
    key: '3',
    icon: '🎓',
    title: 'Réservé aux\nétudiants MTL',
    body: "Connecte-toi avec ton email universitaire (UdeM, McGill, Concordia, UQAM…) pour accéder à toutes les offres.",
    bg: Colors.background,
    textColor: Colors.ink,
    subColor: Colors.inkMuted,
  },
]

export const ONBOARDING_KEY = 'flashmtl_onboarding_done'

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatRef = useRef<FlatList>(null)

  const isLast = currentIndex === SLIDES.length - 1

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

  const slide = SLIDES[currentIndex]

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle={slide.bg === Colors.ink ? 'light-content' : 'dark-content'} />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
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
                backgroundColor: i === currentIndex
                  ? slide.textColor
                  : slide.subColor,
                width: i === currentIndex ? 20 : 7,
              },
            ]}
          />
        ))}
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

      <View style={{ height: Platform.OS === 'ios' ? 40 : Spacing.lg }} />
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
    top: Platform.OS === 'ios' ? 60 : Spacing.xl,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
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
    fontSize: 72,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 40,
    marginBottom: Spacing.lg,
  },
  body: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
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
