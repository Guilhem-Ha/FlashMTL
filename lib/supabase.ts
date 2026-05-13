import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/theme'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Domaines universitaires montréalais acceptés
export const UNIVERSITY_DOMAINS = [
  'umontreal.ca',
  'udem.ca',
  'concordia.ca',
  'live.concordia.ca',
  'mcgill.ca',
  'mail.mcgill.ca',
  'etsmtl.ca',
  'polymtl.ca',
  'hec.ca',
  'uqam.ca',
]

export function isUniversityEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return false
  return UNIVERSITY_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))
}

export const CAMPUS_OPTIONS = [
  { label: 'Université de Montréal', domain: 'umontreal.ca' },
  { label: 'McGill University', domain: 'mcgill.ca' },
  { label: 'Concordia University', domain: 'concordia.ca' },
  { label: 'Polytechnique Montréal', domain: 'polymtl.ca' },
  { label: 'HEC Montréal', domain: 'hec.ca' },
  { label: 'UQAM', domain: 'uqam.ca' },
  { label: 'ÉTS', domain: 'etsmtl.ca' },
]
