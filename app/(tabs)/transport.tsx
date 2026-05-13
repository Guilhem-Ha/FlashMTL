import React from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import { Colors, Spacing } from '../../constants/theme'

export default function TransportScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.logo}>Flash Transport</Text>
        <Text style={styles.subtitle}>Covoiturage entre étudiants</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🚗</Text>
        <Text style={styles.placeholderTitle}>Bientôt disponible</Text>
        <Text style={styles.placeholderText}>
          Partage de trajets entre campus montréalais.{'\n'}
          Cette section arrive dans la prochaine version.
        </Text>
      </View>
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
  subtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
    marginTop: 2,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: -Spacing.xxl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
  },
})
