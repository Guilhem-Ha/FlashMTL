import React from 'react'
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Spacing } from '../../constants/theme'
import { useOffres } from '../../hooks/useOffres'
import OffreCard from '../../components/OffreCard'
import type { Offre } from '../../types'

export default function FeedScreen() {
  const router = useRouter()
  const { offres, loading, error, refresh } = useOffres()

  const handleOffrePress = (offre: Offre) => {
    router.push(`/offre/${offre.id}`)
  }

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>FlashMtl</Text>
        <Text style={styles.subtitle}>
          {offres.length} offre{offres.length !== 1 ? 's' : ''} ce soir
        </Text>
      </View>
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>En direct</Text>
      </View>
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
        data={offres}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OffreCard offre={item} onPress={() => handleOffrePress(item)} />
        )}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucune offre pour l'instant</Text>
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
    paddingBottom: Spacing.lg,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 0.5,
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
