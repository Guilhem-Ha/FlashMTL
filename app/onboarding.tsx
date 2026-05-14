import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, StatusBar, Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors, Spacing, BorderRadius } from '../constants/theme'
import Wordmark from '../components/Wordmark'
import { t } from '../lib/i18n'

const { width } = Dimensions.get('window')

export const ONBOARDING_KEY = 'junto_onboarding_done'

// ── Slide 1 : Hero route ─────────────────────────────────────────
function Slide1() {
  return (
    <View style={[slide.root, { backgroundColor: Colors.ink }]}>
      <StatusBar barStyle="light-content" />

      {/* Wordmark */}
      <View style={slide.topBlock}>
        <Wordmark size={44} onDark />
        <Text style={slide.tagline}>{t('onboarding.tagline')}</Text>
      </View>

      {/* Route hero */}
      <View style={slide.routeCard}>
        <LinearGradient
          colors={[Colors.heroFrom, Colors.heroTo]}
          style={slide.routeGradient}
        >
          {/* Route line */}
          <View style={slide.routeRow}>
            <View style={slide.routeCity}>
              <View style={slide.dotAccent} />
              <Text style={slide.citySmall}>MONTRÉAL</Text>
            </View>
            <View style={slide.routeLineWrap}>
              <View style={slide.routeLine} />
              <Text style={slide.routeArrow}>›</Text>
            </View>
            <View style={[slide.routeCity, slide.routeCityRight]}>
              <View style={slide.dotCream} />
              <Text style={[slide.cityBig]}>Québec City</Text>
            </View>
          </View>
          <Text style={slide.routeMeta}>Sam 17 mai · 9h00  ·  20 $ / pers.</Text>
        </LinearGradient>
        {/* Card body preview */}
        <View style={slide.cardBody}>
          <View style={slide.cardBodyRow}>
            <View style={slide.miniAvatar}>
              <Text style={slide.miniAvatarText}>A</Text>
            </View>
            <View>
              <Text style={slide.cardBodyLabel}>{t('onboarding.slide1.pickupLabel')}</Text>
              <Text style={slide.cardBodyValue}>{t('onboarding.slide1.pickupValue')}</Text>
            </View>
          </View>
          <View style={slide.cardDivider} />
          <View style={slide.cardBodyFooter}>
            <View style={slide.seatsRow}>
              {[true, true, false, false].map((taken, i) => (
                <View key={i} style={[slide.seat, taken && slide.seatTaken]} />
              ))}
              <Text style={slide.seatsText}>{t('onboarding.slide1.seatsText')}</Text>
            </View>
            <View style={slide.miniCta}>
              <Text style={slide.miniCtaText}>{t('onboarding.slide1.cta')}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={slide.sub}>{t('onboarding.slide1.sub')}</Text>
    </View>
  )
}

// ── Slide 2 : Confiance ──────────────────────────────────────────
function Slide2() {
  const campuses = ['UdeM', 'McGill', 'Concordia', 'UQAM', 'ÉTS', 'HEC']
  return (
    <View style={[slide.root, { backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={slide.topBlock}>
        <Text style={slide.icon}>🎓</Text>
        <Text style={[slide.wordmark, { color: Colors.ink }]}>{t('onboarding.slide2.title')}</Text>
        <Text style={[slide.tagline, { color: Colors.inkMuted }]}>
          {t('onboarding.slide2.subtitle')}
        </Text>
      </View>

      {/* Campus pills */}
      <View style={slide.pillsGrid}>
        {campuses.map(c => (
          <View key={c} style={slide.campusPill}>
            <Text style={slide.campusPillText}>{c}</Text>
          </View>
        ))}
      </View>

      {/* Trust points */}
      <View style={slide.trustList}>
        {[
          { icon: '✉️', text: t('onboarding.slide2.trust0') },
          { icon: '🔒', text: t('onboarding.slide2.trust1') },
          { icon: '⭐', text: t('onboarding.slide2.trust2') },
        ].map((item, i) => (
          <View key={i} style={slide.trustRow}>
            <Text style={slide.trustIcon}>{item.icon}</Text>
            <Text style={slide.trustText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Slide 3 : Partage ────────────────────────────────────────────
function Slide3() {
  return (
    <View style={[slide.root, { backgroundColor: Colors.accent }]}>
      <StatusBar barStyle="dark-content" />

      <View style={slide.topBlock}>
        <Text style={slide.icon}>🚗</Text>
        <Text style={[slide.wordmark, { color: Colors.ink }]}>{t('onboarding.slide3.title')}</Text>
        <Text style={[slide.tagline, { color: 'rgba(26,22,18,0.65)' }]}>
          {t('onboarding.slide3.subtitle')}
        </Text>
      </View>

      {/* Stats visuels */}
      <View style={slide.statsRow}>
        {[
          { value: t('onboarding.slide3.stat0Value'), label: t('onboarding.slide3.stat0Label') },
          { value: t('onboarding.slide3.stat1Value'), label: t('onboarding.slide3.stat1Label') },
          { value: t('onboarding.slide3.stat2Value'), label: t('onboarding.slide3.stat2Label') },
        ].map((s, i) => (
          <View key={i} style={slide.statItem}>
            <Text style={slide.statValue}>{s.value}</Text>
            <Text style={slide.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Routes populaires */}
      <View style={slide.routesList}>
        <Text style={[slide.routesTitle, { color: 'rgba(26,22,18,0.55)' }]}>{t('onboarding.slide3.routesTitle')}</Text>
        {[
          t('onboarding.slide3.route0'),
          t('onboarding.slide3.route1'),
          t('onboarding.slide3.route2'),
        ].map((r, i) => (
          <View key={i} style={slide.routeItem}>
            <Text style={slide.routeItemText}>{r}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Main ─────────────────────────────────────────────────────────
const SLIDES = [Slide1, Slide2, Slide3]
const SLIDE_BG = [Colors.ink, Colors.background, Colors.accent]
const SLIDE_TEXT = [Colors.cream, Colors.ink, Colors.ink]
const SLIDE_MUTED = [
  'rgba(245,240,232,0.45)',
  Colors.inkMuted,
  'rgba(26,22,18,0.45)',
]

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [current, setCurrent] = useState(0)
  const flatRef = useRef<FlatList>(null)
  const buttonScale = useRef(new Animated.Value(1)).current

  const isLast = current === SLIDES.length - 1
  const bg = SLIDE_BG[current]
  const textColor = SLIDE_TEXT[current]
  const mutedColor = SLIDE_MUTED[current]

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start()
  }

  const handleNext = () => {
    animateButton()
    if (isLast) {
      finish()
    } else {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true })
      setCurrent(current + 1)
    }
  }

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)' as any)
  }

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          style={[styles.skipBtn, { top: insets.top + 12 }]}
          onPress={finish}
          activeOpacity={0.6}
        >
          <Text style={[styles.skipText, { color: mutedColor }]}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={SLIDES.length}
        renderItem={({ item: SlideComponent }) => (
          <View style={{ width }}>
            <SlideComponent />
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => {
              flatRef.current?.scrollToIndex({ index: i, animated: true })
              setCurrent(i)
            }}>
              <View style={[
                styles.dot,
                { backgroundColor: i === current ? textColor : mutedColor },
                i === current && styles.dotActive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: textColor }]}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={[styles.ctaText, { color: bg }]}>
              {isLast ? t('onboarding.start') : t('onboarding.next')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

// ── Styles communs aux slides ────────────────────────────────────
const slide = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    gap: Spacing.lg,
  },
  topBlock: {
    gap: 6,
  },
  icon: {
    fontSize: 52,
    marginBottom: 4,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.cream,
    letterSpacing: 0.3,
    lineHeight: 40,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.65)',
    lineHeight: 22,
  },
  sub: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.55)',
    lineHeight: 22,
  },

  // ── Slide 1 route card ─────────────────────────────────────────
  routeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cream,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  routeGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeCity: {
    gap: 4,
    maxWidth: '35%',
  },
  routeCityRight: {
    alignItems: 'flex-end',
  },
  dotAccent: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  dotCream: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.cream,
    borderWidth: 2, borderColor: Colors.accent,
  },
  citySmall: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(245,240,232,0.65)',
    letterSpacing: 0.5,
  },
  cityBig: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.cream,
    textAlign: 'right',
  },
  routeLineWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(200,169,110,0.35)',
  },
  routeArrow: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '300',
    marginLeft: 2,
  },
  routeMeta: {
    fontSize: 11,
    color: 'rgba(245,240,232,0.45)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: Spacing.md,
    gap: 10,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  cardBodyLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBodyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.creamDark,
  },
  cardBodyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seat: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.creamDark,
    backgroundColor: Colors.background,
  },
  seatTaken: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  seatsText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '500',
    marginLeft: 2,
  },
  miniCta: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  miniCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.2,
  },

  // ── Slide 2 campus ─────────────────────────────────────────────
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  campusPill: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  campusPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
  },
  trustList: {
    gap: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  trustText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.inkLight,
    flex: 1,
    lineHeight: 20,
  },

  // ── Slide 3 stats ──────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(26,22,18,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(26,22,18,0.55)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  routesList: {
    gap: 6,
  },
  routesTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeItem: {
    backgroundColor: 'rgba(26,22,18,0.1)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  routeItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
})

// ── Styles de mise en page (bottom controls) ──────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
  },
  controls: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    backgroundColor: 'transparent',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  cta: {
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
