/**
 * Junto locale context — reactive language switching.
 *
 * Wraps the app in <LocaleProvider initialLocale="fr"> so that any component
 * calling useLocale() re-renders automatically when the language changes.
 *
 * Usage:
 *   // Read current locale or switch it
 *   const { locale, setLocale } = useLocale()
 *
 *   // In a screen, subscribe to locale changes (forces re-render):
 *   const { locale } = useLocale()
 *   // Now every t() call in this render cycle uses the updated locale.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from './i18n'

export const LOCALE_KEY = 'junto_locale'

type LocaleContextType = {
  locale: string
  setLocale: (locale: string) => Promise<void>
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'fr',
  setLocale: async () => {},
})

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: string
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  const setLocale = useCallback(async (l: string) => {
    i18n.locale = l
    setLocaleState(l)
    await AsyncStorage.setItem(LOCALE_KEY, l)
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
