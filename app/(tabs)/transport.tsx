import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as Haptics from 'expo-haptics'
import { useActiveEntrance } from '../../hooks/useScreenEntrance'
import { tabScrollCallbacks } from '../../lib/tabScrollRefs'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { SUPABASE_URL } from '../../constants/theme'
import { fetchTrips, joinTrip, leaveTrip, fetchMyTripIds, notifyTripOwner } from '../../lib/api'
import { MOCK_TRIPS } from '../../mockData'
import { useAuth } from '../../lib/authContext'
import TripCard from '../../components/TripCard'
import type { Trip } from '../../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

interface Props { active?: boolean }

export default function TransportScreen({ active = true }: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const entrance = useActiveEntrance(active)
  const { user } = useAuth()
  const flatRef = useRef<FlatList>(null)

  const [trips, setTrips] = useState<Trip[]>([])
  const [myTripIds, setMyTripIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  // Register scroll-to-top callback for tab press (tab 0)
  useEffect(() => {
    tabScrollCallbacks[0] = () =>
      flatRef.current?.scrollToOffset({ offset: 0, animated: true })
    return () => { tabScrollCallbacks[0] = null }
  }, [])

  const load = useCallback(async () => {
    try {
      const data = USE_MOCK ? MOCK_TRIPS : await fetchTrips()
      setTrips(data)
      if (user && !USE_MOCK) {
        const ids = await fetchMyTripIds(user.id)
        setMyTripIds(ids)
      }
    } catch {
      // fail silently — list stays empty
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  // Reload data when tab becomes active (replaces useFocusEffect)
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

  const handleJoin = async (trip: Trip) => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        "Connecte-toi pour rejoindre un trip.",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login' as any) },
        ]
      )
      return
    }

    const alreadyJoined = myTripIds.includes(trip.id)

    if (alreadyJoined) {
      Alert.alert(
        'Quitter ce trip ?',
        `Tu vas libérer ta place pour ${trip.destination}.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: async () => {
              setJoiningId(trip.id)
              try {
                await leaveTrip(trip.id, user.id)
                setMyTripIds(prev => prev.filter(id => id !== trip.id))
                setTrips(prev =>
                  prev.map(t =>
                    t.id === trip.id
                      ? { ...t, places_restantes: t.places_restantes + 1 }
                      : t
                  )
                )
              } catch {
                Alert.alert('Erreur', 'Impossible de quitter ce trip.')
              } finally {
                setJoiningId(null)
              }
            },
          },
        ]
      )
      return
    }

    if (trip.places_restantes === 0) return

    setJoiningId(trip.id)
    try {
      if (!USE_MOCK) {
        await joinTrip(trip.id, user.id)
        // Notify trip owner (fire-and-forget — never blocks UX)
        const joinerPrenom = user.user_metadata?.prenom ?? 'Un étudiant'
        notifyTripOwner(trip.id, joinerPrenom, trip.destination, trip.organisateur_id).catch(() => {})
      }
      setMyTripIds(prev => [...prev, trip.id])
      setTrips(prev =>
        prev.map(t =>
          t.id === trip.id
            ? { ...t, places_restantes: t.places_restantes - 1 }
            : t
        )
      )
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('🎉 Tu embarques !', `Place réservée pour ${trip.destination}.`)
    } catch {
      Alert.alert('Erreur', 'Impossible de rejoindre ce trip.')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <Animated.View style={[styles.root, entrance.style]} pointerEvents="box-none">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View>
          <Text style={styles.logo}>Junto 🚗</Text>
          <Text style={styles.subtitle}>Covoiturage étudiant • Montréal</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Aucun trip pour l'instant</Text>
          <Text style={styles.emptyText}>
            Sois le premier à organiser un covoiturage !
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onJoin={() => handleJoin(item)}
              isOwner={user?.id === item.organisateur_id}
              hasJoined={myTripIds.includes(item.id)}
              joiningId={joiningId}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.accent}
            />
          }
        />
      )}

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '300',
    marginTop: 2,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: -60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
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
