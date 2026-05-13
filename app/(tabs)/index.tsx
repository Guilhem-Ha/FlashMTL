import React, { useState, useMemo, useRef } from 'react'
import {
  View, Text, StyleSheet, ActivityIndicator,
  RefreshControl, StatusBar, TouchableOpacity,
  ScrollView, TextInput, Platform, Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useScrollToTop } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useOffres } from '../../hooks/useOffres'
import OffreCard from '../../components/OffreCard'
import type { Offre, OffreCategorie } from '../../types'

const CATEGORIES: { key: OffreCategorie | 'all'; label: string; icon: string }[] = [
  { key: 'all',      label: 'Tout',      icon: '⚡' },
  { key: 'resto',    label: 'Restos',    icon: '🍽️' },
  { key: 'bar',      label: 'Bars',      icon: '🍻' },
  { key: 'show',     label: 'Shows',     icon: '🎭' },
  { key: 'activite', label: 'Activités', icon: '🎯' },
]

const HEADER_COLLAPSE_START = 10
const HEADER_COLLAPSE_END = 80
const BACK_TO_TOP_THRESHOLD = 350

export default function FeedScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { offres, loading, error, refresh } = useOffres()
  const [activeFilter, setActiveFilter] = useState<OffreCategorie | 'all'>('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Refs
  const flatRef = useRef<Animated.FlatList<Offre>>(null)
  useScrollToTop(flatRef as any)

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_COLLAPSE_START, HEADER_COLLAPSE_END],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })
  const titleTranslateY = scrollY.interpolate({
    inputRange: [HEADER_COLLAPSE_START, HEADER_COLLAPSE_END],
    outputRange: [0, -16],
    extrapolate: 'clamp',
  })
  const titleHeight = scrollY.interpolate({
    inputRange: [HEADER_COLLAPSE_START, HEADER_COLLAPSE_END],
    outputRange: [52, 0],
    extrapolate: 'clamp',
  })

  const backToTopOpacity = useRef(new Animated.Value(0)).current

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y
        const shouldShow = y > BACK_TO_TOP_THRESHOLD
        if (shouldShow !== showBackToTop) {
          setShowBackToTop(shouldShow)
          Animated.timing(backToTopOpacity, {
            toValue: shouldShow ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start()
        }
      },
    }
  )

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    ;(flatRef.current as any)?.scrollToOffset({ offset: 0, animated: true })
  }

  const filtered = useMemo(() => {
    let result = offres
    if (activeFilter !== 'all') result = result.filter(o => o.categorie === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.commerce.nom.toLowerCase().includes(q) ||
        o.titre.toLowerCase().includes(q) ||
        o.commerce.quartier.toLowerCase().includes(q)
      )
    }
    return result
  }, [offres, activeFilter, search])

  const handleFilterPress = (key: OffreCategorie | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveFilter(key)
  }

  const Header = () => (
    <View>
      {/* Title row — s'efface au scroll */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            height: Animated.add(titleHeight, insets.top + Spacing.md + Spacing.md),
            overflow: 'hidden',
          },
        ]}
      >
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
      </Animated.View>

      {/* Search bar */}
      <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un resto, quartier…"
          placeholderTextColor={Colors.inkMuted}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => { setSearch(''); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
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
              onPress={() => handleFilterPress(cat.key)}
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ActivityIndicator color={Colors.accent} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.centered}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.FlatList
        ref={flatRef}
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OffreCard offre={item} onPress={() => router.push(`/offre/${item.id}`)} />
        )}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              {search ? '🔍' : CATEGORIES.find(c => c.key === activeFilter)?.icon ?? '⚡'}
            </Text>
            <Text style={styles.emptyTitle}>
              {search
                ? `Aucun résultat pour "${search}"`
                : activeFilter === 'all'
                  ? "Aucune offre pour l'instant"
                  : `Aucune offre "${CATEGORIES.find(c => c.key === activeFilter)?.label}" ce soir`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Essaie un autre mot-clé.' : 'Reviens ce soir — les offres arrivent en fin de journée.'}
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Bouton retour en haut */}
      <Animated.View
        style={[styles.backToTop, { opacity: backToTopOpacity, bottom: insets.bottom + 16 }]}
        pointerEvents={showBackToTop ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.backToTopBtn}
          onPress={scrollToTop}
          activeOpacity={0.85}
        >
          <Text style={styles.backToTopText}>↑ Haut</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingBottom: Spacing.sm,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 6,
  },
  searchRowFocused: {
    borderColor: Colors.accent,
    backgroundColor: '#FAF5EC',
  },
  searchIcon: {
    fontSize: 15,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '400',
    padding: 0,
  },
  searchClear: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '500',
    paddingHorizontal: 4,
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
  backToTop: {
    position: 'absolute',
    alignSelf: 'center',
  },
  backToTopBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  backToTopText: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
