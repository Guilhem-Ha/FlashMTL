import React, { useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, BorderRadius } from '../constants/theme'
import type { Trip } from '../types'

const TYPE_ICON: Record<string, string> = {
  aller_simple: '→',
  aller_retour: '↔',
  recurrent: '↺',
}
const TYPE_LABEL: Record<string, string> = {
  aller_simple: 'Aller simple',
  aller_retour: 'Aller-retour',
  recurrent: 'Récurrent',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Initiale de l'organisateur à partir de son ID (déterministe, pour les mocks)
function seedInitial(id: string): string {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ'
  return letters[id.charCodeAt(0) % letters.length] ?? 'J'
}

interface Props {
  trip: Trip
  onJoin: () => void
  isOwner?: boolean
  hasJoined?: boolean
  joiningId?: string | null
}

export default function TripCard({ trip, onJoin, isOwner, hasJoined, joiningId }: Props) {
  const placesLeft = trip.places_restantes
  const isFull = placesLeft === 0
  const isUrgent = placesLeft === 1
  const isJoining = joiningId === trip.id
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, bounciness: 0 }).start()
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start()

  const villeDep = trip.ville_depart || 'Montréal'
  const typeIcon = trip.type ? TYPE_ICON[trip.type] : '→'
  const typeLabel = trip.type ? TYPE_LABEL[trip.type] : null

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>

      {/* ── Hero header sombre ── */}
      <LinearGradient
        colors={['#1E1A15', '#2C2620']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Badge type (coin haut droit) */}
        {typeLabel && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeIcon} {typeLabel}</Text>
          </View>
        )}

        {/* Route visualization */}
        <View style={styles.routeRow}>
          {/* Départ */}
          <View style={styles.routeEnd}>
            <View style={styles.dotDepart} />
            <Text style={styles.routeCity} numberOfLines={1}>{villeDep}</Text>
          </View>

          {/* Ligne + flèche */}
          <View style={styles.routeLineWrap}>
            <View style={styles.routeLine} />
            <Text style={styles.routeArrow}>›</Text>
          </View>

          {/* Arrivée */}
          <View style={[styles.routeEnd, styles.routeEndRight]}>
            <View style={styles.dotArrivee} />
            <Text style={[styles.routeCity, styles.routeCityDest]} numberOfLines={1}>
              {trip.destination}
            </Text>
          </View>
        </View>

        {/* Date + heure */}
        <Text style={styles.heroMeta}>
          {formatDate(trip.date_depart)} · {trip.heure_depart}
        </Text>
      </LinearGradient>

      {/* ── Corps ── */}
      <View style={styles.body}>

        {/* Lieu de RDV + avatar organisateur */}
        <View style={styles.lieuRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{seedInitial(trip.organisateur_id)}</Text>
          </View>
          <View style={styles.lieuInfo}>
            <Text style={styles.lieuLabel}>Point de départ</Text>
            <Text style={styles.lieuValue} numberOfLines={1}>{trip.lieu_depart}</Text>
          </View>
        </View>

        {/* Description */}
        {trip.description ? (
          <Text style={styles.description} numberOfLines={2}>{trip.description}</Text>
        ) : null}

        {/* Séparateur */}
        <View style={styles.divider} />

        {/* Sièges + prix + CTA */}
        <View style={styles.footer}>
          {/* Sièges */}
          <View style={styles.seatsCol}>
            <View style={styles.seatsRow}>
              {Array.from({ length: Math.min(trip.places_total, 6) }).map((_, i) => {
                const taken = i < trip.places_total - placesLeft
                return (
                  <View key={i} style={[styles.seat, taken && styles.seatTaken]} />
                )
              })}
            </View>
            <Text style={[
              styles.seatsLabel,
              isFull && styles.seatsLabelFull,
              isUrgent && styles.seatsLabelUrgent,
            ]}>
              {isFull ? 'Complet' : `${placesLeft} place${placesLeft > 1 ? 's' : ''} libre${placesLeft > 1 ? 's' : ''}`}
            </Text>
          </View>

          {/* Prix */}
          <View style={styles.priceCol}>
            <Text style={styles.price}>{trip.prix_par_personne} $</Text>
            <Text style={styles.priceLabel}>/ pers.</Text>
          </View>
        </View>

        {/* CTA pleine largeur */}
        {isOwner ? (
          <View style={styles.ownerStrip}>
            <Text style={styles.ownerStripText}>✦ Ton covoiturage</Text>
          </View>
        ) : hasJoined ? (
          <TouchableOpacity
            style={styles.joinedStrip}
            onPress={onJoin}
            activeOpacity={0.75}
          >
            <Text style={styles.joinedStripText}>✓ Inscrit  ·  Se désinscrire</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinBtn, (isFull || isJoining) && styles.joinBtnDisabled]}
            onPress={onJoin}
            onPressIn={() => { handlePressIn(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
            onPressOut={handlePressOut}
            disabled={isFull || !!isJoining}
            activeOpacity={1}
          >
            <Text style={[styles.joinBtnText, (isFull || isJoining) && styles.joinBtnTextDisabled]}>
              {isFull ? 'Complet' : isJoining ? '…' : "J'embarque →"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cream,
    // Shadow iOS
    shadowColor: '#1A1612',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    // Shadow Android
    elevation: 4,
  },

  // ── Hero ──────────────────────────────────────────────────────
  hero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 14,
    gap: 10,
  },
  typeBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(200,169,110,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xl,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 0.4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeEnd: {
    alignItems: 'flex-start',
    gap: 4,
    maxWidth: '35%',
  },
  routeEndRight: {
    alignItems: 'flex-end',
  },
  dotDepart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  dotArrivee: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(245,240,232,0.75)',
    letterSpacing: 0.2,
  },
  routeCityDest: {
    color: Colors.cream,
    fontSize: 18,
    fontWeight: '900',
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
    marginBottom: 2,
  },
  routeArrow: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '300',
    marginLeft: 2,
    lineHeight: 20,
  },
  heroMeta: {
    fontSize: 12,
    color: 'rgba(245,240,232,0.50)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },

  // ── Corps ─────────────────────────────────────────────────────
  body: {
    padding: Spacing.md,
    gap: 10,
  },
  lieuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  lieuInfo: {
    flex: 1,
    gap: 1,
  },
  lieuLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.inkMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  lieuValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  description: {
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 19,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.creamDark,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  seatsCol: {
    gap: 5,
  },
  seatsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  seat: {
    width: 11,
    height: 11,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.creamDark,
    backgroundColor: Colors.background,
  },
  seatTaken: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  seatsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.success,
  },
  seatsLabelFull: {
    color: Colors.inkMuted,
  },
  seatsLabelUrgent: {
    color: Colors.danger,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '400',
    marginTop: -2,
  },

  // ── CTA ───────────────────────────────────────────────────────
  joinBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
  },
  joinBtnDisabled: {
    backgroundColor: Colors.creamDark,
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  joinBtnTextDisabled: {
    color: Colors.inkMuted,
  },
  ownerStrip: {
    backgroundColor: 'rgba(200,169,110,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.3)',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  ownerStripText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  joinedStrip: {
    backgroundColor: '#EBF5E8',
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  joinedStripText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
    letterSpacing: 0.2,
  },
})
