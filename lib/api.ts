import { supabase } from './supabase'
import type { Offre } from '../types'

// ── Offres ────────────────────────────────────────────────────

export async function fetchOffresActives(): Promise<Offre[]> {
  const { data, error } = await supabase
    .from('offres')
    .select(`
      *,
      commerce:commerces (
        id, nom, adresse, quartier,
        latitude, longitude, photo_url, categories
      )
    `)
    .eq('est_active', true)
    .gt('expire_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Offre[]
}

export async function fetchOffreById(id: string): Promise<Offre | null> {
  const { data, error } = await supabase
    .from('offres')
    .select(`
      *,
      commerce:commerces (
        id, nom, adresse, quartier,
        latitude, longitude, photo_url, categories
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as Offre
}
