import React from 'react'
import { Image, Text, StyleSheet, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { Colors } from '../constants/theme'

interface Props {
  size?: number
  variant?: 'image' | 'text'
  onDark?: boolean
  /** When variant="text", render the inline SVG huddle mark alongside the wordmark */
  withMark?: boolean
}

/**
 * Junto wordmark lockup.
 *
 * variant="image" (default) — renders the PNG logo asset. Use everywhere the
 *   logo should appear as a proper lockup (auth screens, onboarding, headers).
 *
 * variant="text" — Nunito 900 text wordmark. Optionally add `withMark` to
 *   render the inline SVG huddle mark at 78% of the font size alongside it.
 *
 * onDark — when true and variant="image", uses the transparent PNG (logo on
 *   transparent bg) instead of the opaque cream-background version.
 *
 * The brand color (#FFBC58) is ONLY used for the text/mark fallback.
 * All in-app interactive elements use accent (#C8A96E) — never brand.
 */

/** Inline SVG of the 3-person huddle mark. Scales and recolors cleanly. */
export function BrandMark({ size = 22, color = Colors.brand }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill={color} aria-hidden>
      {/* Center head */}
      <Circle cx="32" cy="14" r="7" />
      {/* Side heads */}
      <Circle cx="16" cy="22" r="6" />
      <Circle cx="48" cy="22" r="6" />
      {/* Shared body */}
      <Path d="M6 50 C 6 38, 18 32, 32 32 C 46 32, 58 38, 58 50 L 58 52 C 50 55, 42 56, 32 56 C 22 56, 14 55, 6 52 Z" />
    </Svg>
  )
}

export default function Wordmark({ size = 36, variant = 'image', onDark = false, withMark = false }: Props) {
  if (variant === 'image') {
    const source = onDark
      ? require('../assets/images/logo-junto-transparent.png')
      : require('../assets/images/logo-junto.png')

    // The PNG lockup has an approximate 2.54:1 width-to-height ratio
    return (
      <Image
        source={source}
        style={{ height: size, width: size * 2.54, resizeMode: 'contain' }}
        accessible
        accessibilityLabel="Junto"
      />
    )
  }

  // Text variant — Nunito 900 + optional inline SVG mark
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size }]}>Junto</Text>
      {withMark && <BrandMark size={Math.round(size * 0.78)} color={Colors.brand} />}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  text: {
    fontWeight: '900',
    letterSpacing: -0.5,
    color: Colors.brand,
  },
})
