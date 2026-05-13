import React from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, BorderRadius } from '../constants/theme'
import { useCountdown } from '../hooks/useOffres'
import type { Offre } from '../types'

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 2 * 60 * 60 * 1000
}

const CATEGORIE_LABELS: Record<string, string> = {
  resto: 'Restaurant',
  bar: 'Bar',
  show: 'Spectacle',
  activite: 'Activité',
  transport: 'Transport',
}

interface Props {
  offre: Offre
  onPress: () => void
}

export default function OffreCard({ offre, onPress }: Props) {
  const { timeLeft, isUrgent } = useCountdown(offre.expire_at)
  const urgentPlaces = offre.places_disponibles <= 3
  const nouveau = isNew(offre.created_at)

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >

      {/* ── Image hero ── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: offre.commerce.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradient overlay bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(26,22,18,0.72)']}
          style={styles.gradient}
        />

        {/* Badges top */}
        <View style={styles.badgesTop}>
          <View style={styles.badgesLeft}>
            <View style={styles.badgeReduction}>
              <Text style={styles.badgeText}>−{offre.reduction_pct}%</Text>
            </View>
            {nouveau && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>✦ Nouveau</Text>
              </View>
            )}
          </View>
          <View style={[styles.countdown, isUrgent && styles.countdownUrgent]}>
            <View style={[styles.dot, isUrgent && styles.dotUrgent]} />
            <Text style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
              {timeLeft}
            </Text>
          </View>
        </View>

        {/* Commerce name + quartier on image */}
        <View style={styles.imageFooter}>
          <Text style={styles.imageCommerce} numberOfLines={1}>
            {offre.commerce.nom}
          </Text>
          <Text style={styles.imageQuartier}>
            📍 {offre.commerce.quartier}
          </Text>
        </View>
      </View>

      {/* ── Contenu ── */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.categorie}>
            {CATEGORIE_LABELS[offre.categorie]}
          </Text>
          <View style={[styles.placesBadge, urgentPlaces && styles.placesBadgeUrgent]}>
            <View style={[styles.placesDot, urgentPlaces && styles.placesDotUrgent]} />
            <Text style={[styles.placesText, urgentPlaces && styles.placesTextUrgent]}>
              {offre.places_disponibles} place{offre.places_disponibles > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <Text style={styles.titre} numberOfLines={2}>
          {offre.titre}
        </Text>

        <View style={styles.prixRow}>
          <Text style={styles.prixAvant}>{offre.prix_normal} $</Text>
          <Text style={styles.prixFlash}>{offre.prix_flash} $</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{offre.code_promo}</Text>
          </View>
        </View>
      </View>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cream,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  badgesTop: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgesLeft: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'flex-start',
  },
  badgeReduction: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeNew: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeNewText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  badgeText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countdown: {
    backgroundColor: 'rgba(245,240,232,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownUrgent: {
    backgroundColor: 'rgba(192,57,43,0.95)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  dotUrgent: {
    backgroundColor: Colors.cream,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  countdownTextUrgent: {
    color: Colors.cream,
  },
  imageFooter: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    gap: 2,
  },
  imageCommerce: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.cream,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageQuartier: {
    fontSize: 12,
    color: 'rgba(245,240,232,0.85)',
    fontWeight: '400',
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.sm + 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categorie: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  placesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xl,
  },
  placesBadgeUrgent: {
    backgroundColor: '#FDF0EE',
  },
  placesDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  placesDotUrgent: {
    backgroundColor: Colors.danger,
  },
  placesText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.success,
  },
  placesTextUrgent: {
    color: Colors.danger,
  },
  titre: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.inkLight,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  prixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  prixAvant: {
    fontSize: 13,
    color: Colors.inkMuted,
    textDecorationLine: 'line-through',
  },
  prixFlash: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
  },
  codeBox: {
    marginLeft: 'auto',
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.inkLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
