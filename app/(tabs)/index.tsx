import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveEntrance } from '../../hooks/useScreenEntrance'
import { tabScrollCallbacks } from '../../lib/tabScrollRefs'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { SUPABASE_URL } from '../../constants/theme'
import { fetchMyTrips, fetchMyOrganizedTrips } from '../../lib/api'
import { MOCK_TRIPS } from '../../mockData'
import { useAuth } from '../../lib/authContext'
import type { Trip } from '../../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

const TYPE_LABELS: Record<string, string> = {
  aller_simple: 'Aller simple',
  aller_retour: 'Aller-retour',
  recurrent: 'Récurrent',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface Props { active?: boolean }

export default function MesTripsScreen({ active = true }: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const entrance = useActiveEntrance(active)
  const { user, session } = useAuth()
  const scrollRef = useRef<ScrollView>(null)

  const [joinedTrips, setJoinedTrips] = useState<Trip[]>([])
  const [organizedTrips, setOrganizedTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Register scroll-to-top callback (tab 1)
  useEffect(() => {
    tabScrollCallbacks[1] = () =>
      scrollRef.current?.scrollTo({ y: 0, animated: true })
    return () => { tabScrollCallbacks[1] = null }
  }, [])

  const load = useCallback(async () => {
    if (!user) { setLoading(false); setRefreshing(false); return }
    try {
      if (USE_MOCK) {
        setOrganizedTrips(MOCK_TRIPS.slice(1, 2))
        setJoinedTrips(MOCK_TRIPS.slice(0, 1))
      } else {
        const [joined, organized] = await Promise.all([
          fetchMyTrips(user.id),
          fetchMyOrganizedTrips(user.id),
        ])
        setJoinedTrips(joined)
        setOrganizedTrips(organized)
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    if (active) {
      setLoading(true)
      load()
    }
  }, [active, load])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  // ── Not logged in ─────────────────────────────────────────────
  if (!session) {
    return (
      <Animated.View style={[styles.root, entrance.style]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.headerTitle}>Mes trajets</Text>
        </View>
        <View style={styles.guestContainer}>
          <Text style={styles.guestIcon}>🎒</Text>
          <Text style={styles.guestTitle}>Tes trajets ici</Text>
          <Text style={styles.guestText}>
            Connecte-toi pour voir les covoiturages que tu as organisés ou rejoints.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/auth/signup' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Créer un compte étudiant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/login' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Se connecter</Text>
          </TouchableOpacity>
          <Text style={styles.guestNote}>Réservé aux étudiants des universités montréalaises</Text>
        </View>
      </Animated.View>
    )
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <Animated.View style={[styles.root, entrance.style]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.headerTitle}>Mes trajets</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </Animated.View>
    )
  }

  const hasAny = organizedTrips.length > 0 || joinedTrips.length > 0

  return (
    <Animated.View style={[styles.root, entrance.style]} pointerEvents="box-none">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md, paddingBottom: 88 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mes trajets</Text>
        </View>

        {/* Empty global */}
        {!hasAny && (
          <View style={styles.emptyGlobal}>
            <Text style={styles.emptyGlobalIcon}>🗺️</Text>
            <Text style={styles.emptyGlobalTitle}>Aucun trajet pour l'instant</Text>
            <Text style={styles.emptyGlobalText}>
              Rejoins un covoiturage dans l'onglet Trajets, ou propose le tien.
            </Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => router.push('/transport/create' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Proposer un trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Organisés ── */}
        {organizedTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Organisés par toi</Text>
            {organizedTrips.map(trip => (
              <TripRow key={trip.id} trip={trip} isOrganized />
            ))}
          </View>
        )}

        {/* ── Rejoints ── */}
        {joinedTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎒 Trips rejoints</Text>
            {joinedTrips.map(trip => (
              <TripRow key={trip.id} trip={trip} isOrganized={false} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/transport/create' as any)}
        activeOpacity={0.88}
      >
        <Text style={styles.fabText}>+  Proposer un trip</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

function TripRow({ trip, isOrganized }: { trip: Trip; isOrganized: boolean }) {
  const route = `${trip.ville_depart || 'Montréal'} → ${trip.destination}`
  const typeLabel = trip.type ? TYPE_LABELS[trip.type] : null

  return (
    <View style={[styles.tripCard, isOrganized && styles.tripCardOrganized]}>
      <View style={styles.tripTop}>
        <Text style={styles.tripRoute} numberOfLines={1}>{route}</Text>
        <View style={styles.tripBadges}>
          {isOrganized && (
            <View style={styles.orgBadge}>
              <Text style={styles.orgBadgeText}>Organisateur</Text>
            </View>
          )}
          {typeLabel && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.tripMeta}>
        {formatDate(trip.date_depart)} · {trip.heure_depart} · {trip.lieu_depart}
      </Text>
      <View style={styles.tripFooter}>
        {isOrganized && (
          <Text style={styles.tripPlaces}>
            {trip.places_restantes}/{trip.places_total} places libres
          </Text>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{trip.prix_par_personne} $ / pers.</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {},
  headerRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Guest ────────────────────────────────────────────────────
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  guestIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  guestText: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
    marginBottom: Spacing.xl,
  },
  btnPrimary: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnPrimaryText: {
    color: Colors.cream,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  btnSecondaryText: {
    color: Colors.ink,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  guestNote: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontWeight: '300',
  },

  // ── Empty ─────────────────────────────────────────────────────
  emptyGlobal: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyGlobalIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyGlobalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptyGlobalText: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
    marginBottom: Spacing.md,
  },

  // ── Sections ──────────────────────────────────────────────────
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },

  // ── Trip card ─────────────────────────────────────────────────
  tripCard: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 5,
  },
  tripCardOrganized: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  tripTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    justifyContent: 'space-between',
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    flex: 1,
    letterSpacing: 0.2,
  },
  tripBadges: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 0,
  },
  orgBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  orgBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  typeBadge: {
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.inkMuted,
    letterSpacing: 0.2,
  },
  tripMeta: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '300',
  },
  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  tripPlaces: {
    fontSize: 12,
    color: Colors.inkLight,
    fontWeight: '500',
  },
  priceBadge: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginLeft: 'auto',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cream,
  },

  // ── FAB ───────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.4,
  },
})
