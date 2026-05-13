import React from 'react'
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Colors, Spacing, BorderRadius } from '../constants/theme'
import { useCountdown } from '../hooks/useOffres'
import type { Offre } from '../types'

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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: offre.commerce.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeReduction}>
          <Text style={styles.badgeText}>−{offre.reduction_pct}%</Text>
        </View>
        <View style={[styles.countdown, isUrgent && styles.countdownUrgent]}>
          <View style={[styles.dot, isUrgent && styles.dotUrgent]} />
          <Text style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
            {timeLeft}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.categorie}>
            {CATEGORIE_LABELS[offre.categorie]} · {offre.commerce.quartier}
          </Text>
          <Text style={styles.places}>
            {offre.places_disponibles} place{offre.places_disponibles > 1 ? 's' : ''}
          </Text>
        </View>

        <Text style={styles.commerceNom} numberOfLines={1}>
          {offre.commerce.nom}
        </Text>
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
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeReduction: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countdown: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
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
  content: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categorie: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  places: {
    fontSize: 11,
    color: Colors.inkMuted,
  },
  commerceNom: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
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
