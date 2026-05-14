/**
 * Junto — i18n layer
 *
 * Language detection order:
 *  1. Device locale (via expo-localization)
 *  2. Defaults to French ('fr')
 *
 * Usage:
 *   import i18n, { t } from '../lib/i18n'
 *
 *   // Static key
 *   t('transport.emptyTitle')
 *
 *   // With interpolation
 *   t('transport.alertLeaveBody', { destination: 'Québec City' })
 *
 *   // Pluralization (uses count key)
 *   t('tripCard.seats', { count: 2 })
 *
 * To override locale (e.g. in Profil settings):
 *   import i18n from '../lib/i18n'
 *   i18n.locale = 'en'
 */
import { I18n } from 'i18n-js'
import { getLocales } from 'expo-localization'
import fr from './locales/fr'
import en from './locales/en'

const i18n = new I18n({ fr, en })

i18n.defaultLocale = 'fr'
i18n.enableFallback = true

// Detect device language — default to French for Québec context
const deviceLang = getLocales()[0]?.languageCode ?? 'fr'
i18n.locale = deviceLang.startsWith('en') ? 'en' : 'fr'

export default i18n

/** Convenience shorthand: t('key', { opt }) */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options)
}

/**
 * Date formatter that respects the current locale.
 * Usage: localDate(trip.date_depart, { weekday: 'short', day: 'numeric', month: 'short' })
 */
export function localDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
): string {
  const d = new Date(dateStr)
  const locale = i18n.locale === 'en' ? 'en-CA' : 'fr-CA'
  return d.toLocaleDateString(locale, options)
}
