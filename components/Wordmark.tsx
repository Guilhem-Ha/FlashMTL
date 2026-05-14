import React from 'react'
import { Image, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/theme'

interface Props {
  size?: number
  variant?: 'image' | 'text'
  onDark?: boolean
}

/**
 * Junto wordmark lockup.
 *
 * variant="image" (default) — renders the PNG logo asset. Use everywhere the
 *   logo should appear as a proper lockup (auth screens, onboarding, headers).
 *   Falls back to text if the image fails to load.
 *
 * variant="text" — plain Nunito 900 text. Use only when a PNG import is not
 *   possible (e.g., inside an SVG context or as a placeholder before fonts load).
 *
 * onDark — when true and variant="image", uses the transparent PNG (white logo)
 *   instead of the default opaque version so it reads on dark backgrounds.
 *
 * The brand color (#FFBC58) is ONLY used for the text fallback.
 * All in-app interactive elements use accent (#C8A96E) — not brand.
 */
export default function Wordmark({ size = 36, variant = 'image', onDark = false }: Props) {
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

  return (
    <Text style={[styles.text, { fontSize: size }]}>Junto</Text>
  )
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    letterSpacing: -0.5,
    color: Colors.brand,
  },
})
