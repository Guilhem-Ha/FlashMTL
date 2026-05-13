import React, { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Dimensions, PanResponder,
  Animated, StatusBar, TouchableOpacity, Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { validateReservation } from '../../lib/api'

const { width } = Dimensions.get('window')
const TRACK_PADDING = 6
const HANDLE_SIZE = 56
const TRACK_WIDTH = width - Spacing.md * 2
const SWIPE_MAX = TRACK_WIDTH - HANDLE_SIZE - TRACK_PADDING * 2

export default function RedemptionScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{
    reservation_id: string
    offre_id: string
    commerce_nom: string
    commerce_photo_url: string
    offre_titre: string
    code_promo: string
    prix_flash: string
    prix_normal: string
    reduction_pct: string
    status: string
  }>()

  const alreadyValidated = params.status === 'validated'
  const [validated, setValidated] = useState(alreadyValidated)
  const [validating, setValidating] = useState(false)

  // ── Swipe animation ──────────────────────────────────────────
  const slideX = useRef(new Animated.Value(alreadyValidated ? SWIPE_MAX : 0)).current
  const successOpacity = useRef(new Animated.Value(alreadyValidated ? 1 : 0)).current
  const swipeOpacity = useRef(new Animated.Value(alreadyValidated ? 0 : 1)).current

  const handleValidate = async () => {
    if (validating || validated) return
    setValidating(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Animate swipe out → success in
    Animated.parallel([
      Animated.timing(swipeOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start()

    try {
      await validateReservation(params.reservation_id)
    } catch { /* fail silently — UX doesn't block */ }
    setValidated(true)
    setValidating(false)
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !validated,
      onMoveShouldSetPanResponder: (_, gs) =>
        !validated && gs.dx > 2 && Math.abs(gs.dy) < gs.dx,
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(gs.dx, SWIPE_MAX))
        slideX.setValue(x)
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx >= SWIPE_MAX * 0.82 || gs.vx > 1.2) {
          Animated.timing(slideX, {
            toValue: SWIPE_MAX,
            duration: 120,
            useNativeDriver: true,
          }).start(handleValidate)
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
            tension: 80,
          }).start()
        }
      },
    })
  ).current

  const fillWidth = slideX.interpolate({
    inputRange: [0, SWIPE_MAX],
    outputRange: [HANDLE_SIZE + TRACK_PADDING * 2, TRACK_WIDTH],
    extrapolate: 'clamp',
  })

  const arrowOpacity = slideX.interpolate({
    inputRange: [0, SWIPE_MAX * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.ink} />

      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.logo}>FlashMtl ⚡</Text>
        {validated && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Commerce avatar */}
      <View style={styles.avatarWrapper}>
        {params.commerce_photo_url ? (
          <Image
            source={{ uri: params.commerce_photo_url }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {params.commerce_nom?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={styles.reductionBadge}>
          <Text style={styles.reductionText}>−{params.reduction_pct}%</Text>
        </View>
      </View>

      {/* Offer info */}
      <View style={styles.infoBlock}>
        <Text style={styles.commerceNom}>{params.commerce_nom}</Text>
        <Text style={styles.offreTitre}>{params.offre_titre}</Text>

        <View style={styles.prixRow}>
          <Text style={styles.prixNormal}>{params.prix_normal} $</Text>
          <Text style={styles.prixFlash}>{params.prix_flash} $</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Code promo */}
      <View style={styles.codeBlock}>
        <Text style={styles.codeLabel}>CODE PROMO</Text>
        <Text style={styles.codeValue}>{params.code_promo}</Text>
        <Text style={styles.codeHint}>
          {validated
            ? '✓ Bon validé — merci pour ta visite !'
            : 'Présente ce bon à la caisse'}
        </Text>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Swipe / Success zone */}
      <View style={[styles.bottomZone, { paddingBottom: Math.max(insets.bottom, 24) }]}>

        {/* Success overlay */}
        <Animated.View
          style={[styles.successView, { opacity: successOpacity }]}
          pointerEvents={validated ? 'auto' : 'none'}
        >
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Validé !</Text>
          <Text style={styles.successSub}>Bon appétit — profite bien de l'offre ⚡</Text>
        </Animated.View>

        {/* Swipe track */}
        <Animated.View style={[styles.swipeWrapper, { opacity: swipeOpacity }]}>
          <View style={styles.swipeTrack}>
            {/* Fill */}
            <Animated.View style={[styles.swipeFill, { width: fillWidth }]} />

            {/* Label */}
            <Text style={styles.swipeLabel}>Glisser pour valider →</Text>

            {/* Handle */}
            <Animated.View
              style={[
                styles.swipeHandle,
                { transform: [{ translateX: slideX }] },
              ]}
              {...panResponder.panHandlers}
            >
              <Animated.Text style={[styles.handleArrow, { opacity: arrowOpacity }]}>
                →
              </Animated.Text>
            </Animated.View>
          </View>
        </Animated.View>

        {!validated && (
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
            <Text style={styles.laterLink}>Plus tard</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  closeBtn: {
    backgroundColor: 'rgba(245,240,232,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  closeBtnText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '500',
  },
  avatarWrapper: {
    marginTop: Spacing.lg,
    position: 'relative',
    alignItems: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.ink,
  },
  reductionBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  reductionText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.cream,
  },
  infoBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: 4,
  },
  commerceNom: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.cream,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  offreTitre: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  prixRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4,
  },
  prixNormal: {
    fontSize: 14,
    color: 'rgba(245,240,232,0.4)',
    textDecorationLine: 'line-through',
  },
  prixFlash: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  divider: {
    width: width - Spacing.xl * 2,
    height: 1,
    backgroundColor: 'rgba(245,240,232,0.12)',
    marginVertical: Spacing.lg,
  },
  codeBlock: {
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(245,240,232,0.45)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.cream,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  codeHint: {
    fontSize: 13,
    color: 'rgba(245,240,232,0.5)',
    fontWeight: '300',
    marginTop: 2,
  },
  bottomZone: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
  },
  successView: {
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  successIcon: {
    fontSize: 48,
    color: Colors.accent,
    fontWeight: '300',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.cream,
  },
  successSub: {
    fontSize: 14,
    color: 'rgba(245,240,232,0.6)',
    fontWeight: '300',
    textAlign: 'center',
  },
  swipeWrapper: {
    width: '100%',
  },
  swipeTrack: {
    height: HANDLE_SIZE + TRACK_PADDING * 2,
    backgroundColor: 'rgba(245,240,232,0.1)',
    borderRadius: (HANDLE_SIZE + TRACK_PADDING * 2) / 2,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  swipeFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accent,
    borderRadius: (HANDLE_SIZE + TRACK_PADDING * 2) / 2,
  },
  swipeLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(245,240,232,0.55)',
    letterSpacing: 0.3,
  },
  swipeHandle: {
    position: 'absolute',
    left: TRACK_PADDING,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  handleArrow: {
    fontSize: 20,
    color: Colors.ink,
    fontWeight: '700',
  },
  laterLink: {
    fontSize: 13,
    color: 'rgba(245,240,232,0.35)',
    fontWeight: '400',
    paddingVertical: 4,
  },
})
