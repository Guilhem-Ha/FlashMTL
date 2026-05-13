import { supabase } from './supabase'
import { SUPABASE_URL } from '../constants/theme'
import type { Offre, Trip, Reservation } from '../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

// ── In-memory reservation store (mock mode) ───────────────────
const _mockReservations: Reservation[] = []

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

// ── Reservations ──────────────────────────────────────────────

export async function createReservation(
  data: Omit<Reservation, 'id' | 'created_at' | 'status'>,
): Promise<Reservation> {
  if (USE_MOCK) {
    const res: Reservation = {
      ...data,
      id: Math.random().toString(36).slice(2),
      created_at: new Date().toISOString(),
      status: 'active',
    }
    _mockReservations.push(res)
    return res
  }
  const { data: row, error } = await supabase
    .from('reservations')
    .insert([{ ...data, status: 'active' }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  return row as Reservation
}

export async function fetchMyReservationForOffer(
  userId: string,
  offreId: string,
): Promise<Reservation | null> {
  if (USE_MOCK) {
    return _mockReservations.find(
      r => r.user_id === userId && r.offre_id === offreId,
    ) ?? null
  }
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .eq('offre_id', offreId)
    .maybeSingle()
  if (error) return null
  return data as Reservation | null
}

export async function fetchMyReservations(userId: string): Promise<Reservation[]> {
  if (USE_MOCK) {
    return _mockReservations.filter(r => r.user_id === userId)
  }
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Reservation[]
}

export async function validateReservation(id: string): Promise<void> {
  if (USE_MOCK) {
    const r = _mockReservations.find(r => r.id === id)
    if (r) r.status = 'validated'
    return
  }
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'validated', validated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
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
