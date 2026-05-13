import { supabase } from './supabase'
import type { Offre, Trip } from '../types'

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

// ── Trips ─────────────────────────────────────────────────────

export async function fetchTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .gte('date_depart', new Date().toISOString().split('T')[0])
    .order('date_depart', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Trip[]
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'places_restantes'>): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({ ...trip, places_restantes: trip.places_total })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Trip
}

export async function joinTrip(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_participants')
    .insert({ trip_id: tripId, user_id: userId })

  if (error) throw new Error(error.message)
}

export async function leaveTrip(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_participants')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function fetchMyOrganizedTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('organisateur_id', userId)
    .order('date_depart', { ascending: true })

  if (error) return []
  return (data ?? []) as unknown as Trip[]
}

export async function fetchMyTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trip_participants')
    .select('trips(*)')
    .eq('user_id', userId)

  if (error) return []
  return (data ?? [])
    .map((r: { trips: Trip | Trip[] }) => r.trips)
    .flat()
    .filter(Boolean) as Trip[]
}

export async function fetchMyTripIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('trip_participants')
    .select('trip_id')
    .eq('user_id', userId)

  if (error) return []
  return (data ?? []).map((r: { trip_id: string }) => r.trip_id)
}

// ── Push notifications ────────────────────────────────────────

export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('utilisateurs')
    .update({ push_token: token })
    .eq('id', userId)

  if (error) console.warn('savePushToken error:', error.message)
}

export async function notifyTripOwner(
  tripId: string,
  joinerPrenom: string,
  destination: string,
  ownerId: string,
): Promise<void> {
  // Fetch owner push token
  const { data } = await supabase
    .from('utilisateurs')
    .select('push_token, prenom')
    .eq('id', ownerId)
    .single()

  if (!data?.push_token) return

  // Call Supabase Edge Function
  await supabase.functions.invoke('send-push', {
    body: {
      token: data.push_token,
      title: '🚗 Quelqu\'un embarque !',
      body: `${joinerPrenom} a rejoint ton trip vers ${destination}`,
      data: { tripId },
    },
  })
}
