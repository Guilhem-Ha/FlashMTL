import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  Share,
  Animated,
  PanResponder,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import MapView, { Marker } from 'react-native-maps'

import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useCountdown } from '../../hooks/useOffres'
import { fetchOffreById, createReservation, fetchMyReservationForOffer } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { MOCK_OFFRES } from '../../mockData'
import { SUPABASE_URL } from '../../constants/theme'
import type { Offre, Reservation } from '../../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')
const { width: SCREEN_WIDTH, height } = Dimensions.get('window')
const IMAGE_HEIGHT = Math.min(height * 0.44, 360)

const CATEGORIE_LABELS: Record<string, string> = {
  resto: 'Restaurant',
  bar: 'Bar',
  show: 'Spectacle',
  activite: 'Activité',
  transport: 'Transport',
}

export default function OffreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  const [offre, setOffre] = useState<Offre | null>(null)
  const [fetching, setFetching] = useState(true)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [reserving, setReserving] = useState(false)

  // ── Swipe-left to dismiss ─────────────────────────────────────
  const slideX = useRef(new Animated.Value(0)).current
  const bgOpacity = slideX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        gs.dx > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderMove: (_, gs) => {
        if (gs.dx > 0) slideX.setValue(gs.dx)
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 80 || gs.vx > 0.6) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          Animated.timing(slideX, {
            toValue: SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(() => router.back())
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

  useEffect(() => {
    if (!id) return
    if (USE_MOCK) {
      setOffre(MOCK_OFFRES.find(o => o.id === id) ?? null)
      setFetching(false)
      return
    }
    fetchOffreById(id).then(data => {
      setOffre(data)
      setFetching(false)
    })
  }, [id])

  // Check existing reservation when user + offre are loaded
  useEffect(() => {
    if (!user || !offre) return
    fetchMyReservationForOffer(user.id, offre.id).then(setReservation)
  }, [user, offre])

  const { timeLeft, isUrgent } = useCountdown(offre?.expire_at ?? '')

  if (fetching) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    )
  }

  if (!offre || !offre.commerce) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Offre introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.retourLink}>← Retour au fil</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const economie = offre.prix_normal - offre.prix_flash

  const openRedemption = (res: Reservation) => {
    router.push({
      pathname: '/offre/redemption' as any,
      params: {
        reservation_id: res.id,
        offre_id: res.offre_id,
        commerce_nom: res.commerce_nom,
        commerce_photo_url: res.commerce_photo_url,
        offre_titre: res.offre_titre,
        code_promo: res.code_promo,
        prix_flash: String(res.prix_flash),
        prix_normal: String(res.prix_normal),
        reduction_pct: String(res.reduction_pct),
        status: res.status,
      },
    })
  }

  const handleReserver = async () => {
    if (!user) {
      router.push('/auth/login' as any)
      return
    }
    if (reservation) {
      openRedemption(reservation)
      return
    }
    setReserving(true)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const res = await createReservation({
        user_id: user.id,
        offre_id: offre.id,
        commerce_nom: offre.commerce.nom,
        commerce_photo_url: offre.commerce.photo_url,
        offre_titre: offre.titre,
        code_promo: offre.code_promo,
        prix_flash: offre.prix_flash,
        prix_normal: offre.prix_normal,
        reduction_pct: offre.reduction_pct,
      })
      setReservation(res)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      openRedemption(res)
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la réservation.')
    } finally {
      setReserving(false)
    }
  }

  const handleOpenMaps = () => {
    const { latitude, longitude, nom, adresse } = offre!.commerce
    const label = encodeURIComponent(`${nom} — ${adresse}`)
    const url = Platform.select({
      ios: `maps:?q=${label}&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${label}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    })
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
      }
    })
  }

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Share.share({
      message: `🔥 Offre flash chez ${offre.commerce.nom} — ${offre.titre}\n${offre.reduction_pct}% de réduction · Code : ${offre.code_promo}\n\nVia FlashMtl 📍 ${offre.commerce.quartier}, Montréal`,
      title: `FlashMtl — ${offre.commerce.nom}`,
    })
  }

  return (
    <Animated.View
      style={[styles.root, { transform: [{ translateX: slideX }], opacity: bgOpacity }]}
      {...panResponder.panHandlers}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero image ─────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: offre.commerce.photo_url }}
            style={styles.hero}
            resizeMode="cover"
          />
          <View style={styles.heroGradient} />

          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
            style={[styles.shareBtn, { top: insets.top + 12 }]}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.shareBtnText}>↑</Text>
          </TouchableOpacity>

          <View style={[styles.badgeReduction, { top: insets.top + 12 }]}>
            <Text style={styles.badgeText}>−{offre.reduction_pct}%</Text>
          </View>

          <View style={[styles.countdown, isUrgent && styles.countdownUrgent]}>
            <View style={[styles.countdownDot, isUrgent && styles.countdownDotUrgent]} />
            <Text style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
              {timeLeft}
            </Text>
          </View>
        </View>

        {/* ── Contenu ─────────────────────────────────────────────── */}
        <View style={styles.content}>

          <Text style={styles.meta}>
            {CATEGORIE_LABELS[offre.categorie]}  ·  {offre.commerce.quartier}
          </Text>
          <Text style={styles.commerceNom}>{offre.commerce.nom}</Text>
          <Text style={styles.titre}>{offre.titre}</Text>

          <View style={styles.placesRow}>
            <View style={[styles.dot, offre.places_disponibles <= 3 && styles.dotUrgent]} />
            <Text style={styles.placesText}>
              {offre.places_disponibles} place{offre.places_disponibles !== 1 ? 's' : ''} disponible{offre.places_disponibles !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>À propos</Text>
          <Text style={styles.description}>{offre.description}</Text>

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Tarif flash</Text>
          <View style={styles.prixBlock}>
            <View>
              <Text style={styles.prixAvant}>{offre.prix_normal} $</Text>
              <Text style={styles.prixFlash}>{offre.prix_flash} $</Text>
            </View>
            <View style={styles.economieBox}>
              <Text style={styles.economieLabel}>Tu économises</Text>
              <Text style={styles.economieValeur}>{economie} $</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionLabel}>Où nous trouver</Text>
          <Text style={styles.adresse}>{offre.commerce.adresse}</Text>
          <Text style={styles.adresseQuartier}>{offre.commerce.quartier}, Montréal</Text>

          <TouchableOpacity
            style={styles.mapContainer}
            onPress={handleOpenMaps}
            activeOpacity={1}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: offre.commerce.latitude,
                longitude: offre.commerce.longitude,
                latitudeDelta: 0.006,
                longitudeDelta: 0.006,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              pointerEvents="none"
            >
              <Marker
                coordinate={{
                  latitude: offre.commerce.latitude,
                  longitude: offre.commerce.longitude,
                }}
                title={offre.commerce.nom}
                description={offre.commerce.adresse}
                pinColor={Colors.accent}
              />
            </MapView>
            {/* Hint overlay */}
            <View style={styles.mapHintOverlay}>
              <View style={styles.mapHintBadge}>
                <Text style={styles.mapHintText}>📍 Ouvrir dans Maps</Text>
              </View>
            </View>
          </TouchableOpacity>


          <View style={{ height: 112 }} />
        </View>
      </ScrollView>

      {/* ── CTA sticky ──────────────────────────────────────────── */}
      <View style={[styles.ctaContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, reservation && styles.ctaBtnReserved, reserving && styles.ctaBtnDisabled]}
          onPress={handleReserver}
          activeOpacity={0.88}
          disabled={reserving}
        >
          {reserving
            ? <ActivityIndicator color={Colors.cream} />
            : <Text style={styles.ctaBtnText}>
                {!user
                  ? 'Connecte-toi pour réserver'
                  : reservation
                    ? 'Voir mon bon  →'
                    : `Réserver  —  ${offre.prix_flash} $`}
              </Text>
          }
        </TouchableOpacity>
        <Text style={styles.ctaHint}>
          {reservation
            ? 'Ta réservation est confirmée ✓'
            : `Expire${timeLeft ? ' dans ' + timeLeft : ' bientôt'}  ·  ${offre.places_disponibles} places`}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT * 0.4,
  },
  backBtn: {
    position: 'absolute',
    top: 0, // overridden inline with insets
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,22,18,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: Colors.cream,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  shareBtn: {
    position: 'absolute',
    left: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,22,18,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: {
    color: Colors.cream,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  badgeReduction: {
    position: 'absolute',
    top: 0, // overridden inline with insets
    right: Spacing.md,
    backgroundColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: Colors.cream,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countdown: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(245,240,232,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  countdownUrgent: {
    backgroundColor: 'rgba(192,57,43,0.95)',
  },
  countdownDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  countdownDotUrgent: {
    backgroundColor: Colors.cream,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  countdownTextUrgent: {
    color: Colors.cream,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  commerceNom: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  titre: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.inkLight,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  placesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  dotUrgent: {
    backgroundColor: Colors.danger,
  },
  placesText: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.inkLight,
    lineHeight: 24,
  },
  prixBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  prixAvant: {
    fontSize: 15,
    color: Colors.inkMuted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  prixFlash: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -1,
  },
  economieBox: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  economieLabel: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  economieValeur: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.cream,
  },
  codeBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    marginTop: 2,
  },
  codeBlockActive: {
    borderColor: Colors.accent,
    backgroundColor: '#FAF5EC',
  },
  codeLabel: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  codeValeur: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: Colors.creamDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  copyBtnActive: {
    backgroundColor: Colors.accent,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.inkLight,
    letterSpacing: 0.3,
  },
  copyBtnTextActive: {
    color: Colors.cream,
  },
  adresse: {
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '400',
    marginBottom: 2,
  },
  adresseQuartier: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
    marginBottom: Spacing.md,
  },
  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.creamDark,
    height: 200,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapHintOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
  },
  mapHintBadge: {
    backgroundColor: 'rgba(26,22,18,0.82)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  mapHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: 0.2,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  retourLink: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
  },
  ctaBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnReserved: {
    backgroundColor: Colors.accent,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.4,
  },
  ctaHint: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontWeight: '300',
  },
})
