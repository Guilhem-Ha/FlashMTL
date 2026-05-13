import React from 'react'
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useAuth } from '../../lib/authContext'
import { CAMPUS_OPTIONS } from '../../lib/supabase'

export default function ProfilScreen() {
  const router = useRouter()
  const { user, session, signOut } = useAuth()

  const campusLabel = CAMPUS_OPTIONS.find(c => c.domain === user?.user_metadata?.campus)?.label
    ?? user?.user_metadata?.campus

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Tu vas perdre l\'accès aux notifications push.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: signOut },
      ]
    )
  }

  // ── Non connecté ─────────────────────────────────────────────
  if (!session) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.header}>
          <Text style={styles.logo}>Mon Profil</Text>
        </View>

        <View style={styles.guestContainer}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestTitle}>Rejoins FlashMtl</Text>
          <Text style={styles.guestText}>
            Connecte-toi avec ton email universitaire pour recevoir les offres flash en temps réel.
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
            Réservé aux étudiants des universités montréalaises
          </Text>
        </View>
      </View>
    )
  }

  // ── Connecté ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
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
      </View>

      {/* Infos */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Campus</Text>
          <Text style={styles.infoValue}>{campusLabel ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Statut</Text>
          <View style={styles.badgeActive}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Étudiant vérifié</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Notifications push</Text>
          <Text style={styles.infoValue}>Bientôt</Text>
        </View>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
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
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
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
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xl,
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
