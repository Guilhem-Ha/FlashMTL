import React, { useState, useMemo } from 'react'
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar,
  TouchableOpacity, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useOffres } from '../../hooks/useOffres'
import OffreCard from '../../components/OffreCard'
import type { Offre, OffreCategorie } from '../../types'

const CATEGORIES: { key: OffreCategorie | 'all'; label: string; icon: string }[] = [
  { key: 'all',      label: 'Tout',       icon: '⚡' },
  { key: 'resto',    label: 'Restos',     icon: '🍽️' },
  { key: 'bar',      label: 'Bars',       icon: '🍻' },
  { key: 'show',     label: 'Shows',      icon: '🎭' },
  { key: 'activite', label: 'Activités',  icon: '🎯' },
]

export default function FeedScreen() {
  const router = useRouter()
  const { offres, loading, error, refresh } = useOffres()
  const [activeFilter, setActiveFilter] = useState<OffreCategorie | 'all'>('all')

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return offres
    return offres.filter(o => o.categorie === activeFilter)
  }, [offres, activeFilter])

  const handleOffrePress = (offre: Offre) => {
    router.push(`/offre/${offre.id}`)
  }

  const Header = () => (
    <View>
      {/* Title row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>FlashMtl ⚡</Text>
          <Text style={styles.subtitle}>
            {filtered.length} offre{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>En direct</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {CATEGORIES.map(cat => {
          const isActive = activeFilter === cat.key
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveFilter(cat.key)}
              activeOpacity={0.75}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OffreCard offre={item} onPress={() => handleOffrePress(item)} />
        )}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              {CATEGORIES.find(c => c.key === activeFilter)?.icon ?? '🔍'}
            </Text>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all'
                ? 'Aucune offre pour l\'instant'
                : `Aucune offre "${CATEGORIES.find(c => c.key === activeFilter)?.label}" ce soir`}
            </Text>
            <Text style={styles.emptySubtitle}>
              Reviens ce soir — les offres arrivent en fin de journée.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.inkLight,
  },
  filtersRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.xl,
  },
  chipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.inkLight,
  },
  chipLabelActive: {
    color: Colors.cream,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.inkLight,
    fontSize: 14,
  },
  empty: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
})
