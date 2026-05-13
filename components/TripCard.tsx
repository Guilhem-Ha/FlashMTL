import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native'
import { Colors, Spacing, BorderRadius } from '../constants/theme'
import type { Trip } from '../types'

interface Props {
  trip: Trip
  onJoin: () => void
  isOwner?: boolean
  hasJoined?: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-CA', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default function TripCard({ trip, onJoin, isOwner, hasJoined }: Props) {
  const placesLeft = trip.places_restantes
  const isFull = placesLeft === 0
  const isUrgent = placesLeft === 1

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.destinationRow}>
          <Text style={styles.destinationIcon}>📍</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
        <View style={[styles.placesBadge, isFull && styles.placesBadgeFull, isUrgent && styles.placesBadgeUrgent]}>
          <Text style={[styles.placesText, isFull && styles.placesTextFull, isUrgent && styles.placesTextUrgent]}>
            {isFull ? 'Complet' : `${placesLeft} place${placesLeft > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Infos */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Départ</Text>
          <Text style={styles.infoValue}>{formatDate(trip.date_depart)}</Text>
          <Text style={styles.infoSub}>{trip.heure_depart}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Point de rendez-vous</Text>
          <Text style={styles.infoValue} numberOfLines={2}>{trip.lieu_depart}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Prix</Text>
          <Text style={styles.infoValue}>{trip.prix_par_personne} $</Text>
          <Text style={styles.infoSub}>par personne</Text>
        </View>
      </View>

      {/* Description */}
      {trip.description ? (
        <Text style={styles.description} numberOfLines={2}>{trip.description}</Text>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.spotsRow}>
          {Array.from({ length: trip.places_total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.spot,
                i < (trip.places_total - trip.places_restantes) && styles.spotFilled,
              ]}
            />
          ))}
        </View>

        {isOwner ? (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerText}>Ton trip</Text>
          </View>
        ) : hasJoined ? (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedText}>✓ Inscrit</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.joinBtn, isFull && styles.joinBtnDisabled]}
            onPress={onJoin}
            disabled={isFull}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinBtnText, isFull && styles.joinBtnTextDisabled]}>
              {isFull ? 'Complet' : "J'embarque"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cream,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  destinationIcon: {
    fontSize: 16,
  },
  destination: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: 0.2,
    flex: 1,
  },
  placesBadge: {
    backgroundColor: '#EBF5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xl,
  },
  placesBadgeFull: {
    backgroundColor: Colors.creamDark,
  },
  placesBadgeUrgent: {
    backgroundColor: '#FDF0EE',
  },
  placesText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  placesTextFull: {
    color: Colors.inkMuted,
  },
  placesTextUrgent: {
    color: Colors.danger,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoDivider: {
    width: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  infoSub: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '300',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.inkLight,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  spotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  spot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.inkMuted,
  },
  spotFilled: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  joinBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  joinBtnDisabled: {
    backgroundColor: Colors.creamDark,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  joinBtnTextDisabled: {
    color: Colors.inkMuted,
  },
  ownerBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ink,
  },
  joinedBadge: {
    backgroundColor: '#EBF5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
})
