import { useState, useEffect, useCallback } from 'react'
import { fetchOffresActives } from '../lib/api'
import { MOCK_OFFRES } from '../mockData'
import { SUPABASE_URL } from '../constants/theme'
import type { Offre } from '../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

export function useCountdown(expireAt: string) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expireAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expiré')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      setIsUrgent(diff < 60 * 60 * 1000)

      if (h > 0) setTimeLeft(`${h}h ${m.toString().padStart(2, '0')}min`)
      else if (m > 0) setTimeLeft(`${m}min ${s.toString().padStart(2, '0')}s`)
      else setTimeLeft(`${s}s`)
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expireAt])

  return { timeLeft, isUrgent }
}

export function useOffres() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = USE_MOCK ? MOCK_OFFRES : await fetchOffresActives()
      setOffres(data)
    } catch (e) {
      setError('Impossible de charger les offres')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { offres, loading, error, refresh: load }
}
