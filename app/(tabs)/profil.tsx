import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, Alert, ScrollView, ActivityIndicator, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveEntrance } from '../../hooks/useScreenEntrance'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useAuth } from '../../lib/authContext'
import { CAMPUS_OPTIONS } from '../../lib/supabase'
import { registerForPushNotifications } from '../../hooks/useNotifications'
import Constants from 'expo-constants'

const IS_EXPO_GO = Constants.appOwnership === 'expo'

interface Props { active?: boolean }

export default function ProfilScreen({ active = true }: Props) {
  const router = useRouter()
  const { user, session, signOut } = useAuth()
  const entrance = useActiveEntrance(active)

  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null)

  const insets = useSafeAreaInsets()
  const campusLabel = CAMPUS_OPTIONS.find(c => c.domain === user?.user_metadata?.campus)?.label
    ?? user?.user_metadata?.campus

  useEffect(() => {
    if (!user) return
    // Check push permission status (non disponible en Expo Go)
    if (!IS_EXPO_GO) {
      import('expo-notifications').then(async Notifications => {
        const { status } = await Notifications.getPermissionsAsync()
        setPushEnabled(status === 'granted')
      })
    } else {
      setPushEnabled(null) // null = masqué en Expo Go
    }
  }, [user])

  const handleEnablePush = async () => {
    const token = await registerForPushNotifications()
    setPushEnabled(token !== null)
    if (!token) {
      Alert.alert(
        'Notifications bloquées',
        'Active les notifications dans les réglages de ton téléphone pour Junto.',
      )
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Tu vas être déconnecté de Junto.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
      ]
    )
  }

  // ── Non connecté ─────────────────────────────────────────────
  if (!session) {
    return (
      <Animated.View style={[styles.container, entrance.style]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.logo}>Mon Profil</Text>
        </View>

        <View style={styles.guestContainer}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestTitle}>Rejoins Junto</Text>
          <Text style={styles.guestText}>
            Connecte-toi avec ton email universitaire pour accéder au covoiturage étudiant.
          </Text>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/auth/signup' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/login' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Se connecter</Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            Réservé aux étudiants des universités montréalaises (UdeM, McGill, Concordia, UQAM…)
          </Text>
        </View>
      </Animated.View>
    )
  }

  // ── Connecté ─────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.container, entrance.style]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={[styles.headerRow, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.logo}>Mon Profil</Text>
        </View>

        {/* Avatar + nom */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.user_metadata?.prenom?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.prenom}>{user?.user_metadata?.prenom}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.badgeActive}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Étudiant vérifié</Text>
          </View>
        </View>

        {/* Infos */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Campus</Text>
            <Text style={styles.infoValue}>{campusLabel ?? '—'}</Text>
          </View>
          {!IS_EXPO_GO && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notifications push</Text>
                {pushEnabled === null ? (
                  <ActivityIndicator size="small" color={Colors.inkMuted} />
                ) : pushEnabled ? (
                  <View style={styles.pushOn}>
                    <View style={styles.pushDot} />
                    <Text style={styles.pushOnText}>Activées</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleEnablePush} activeOpacity={0.75}>
                    <Text style={styles.pushOffText}>Activer →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.5,
  },

  // ── Guest ────────────────────────────────────────────────────
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  guestIcon: {
    fontSize: 52,
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
    paddingHorizontal: Spacing.xxl,
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
    paddingHorizontal: Spacing.xxl,
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

  // ── Logged in ────────────────────────────────────────────────
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent,
  },
  prenom: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
  },
  emailText: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
  },
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xl,
    marginTop: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: Colors.cream,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    paddingHorizontal: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.creamDark,
  },
  pushOn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pushDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  pushOnText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '500',
  },
  pushOffText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },

  // ── Trips section ────────────────────────────────────────────
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  emptyTrips: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTripsText: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
  },
  emptyTripsLink: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  tripRow: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tripLeft: {
    flex: 1,
    gap: 3,
  },
  tripDestination: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  tripMeta: {
    fontSize: 12,
    color: Colors.inkMuted,
    fontWeight: '300',
  },
  tripPriceBadge: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  tripPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
  },

  tripRowOrganized: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  tripOrganizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  organizerBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  organizerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: 0.3,
  },

  // ── Sign out ─────────────────────────────────────────────────
  signOutBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8C4BE',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600',
  },
})
