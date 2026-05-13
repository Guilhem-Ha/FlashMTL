export type OffreCategorie = 'resto' | 'bar' | 'show' | 'activite' | 'transport'

export interface Commerce {
  id: string
  nom: string
  adresse: string
  quartier: string
  latitude: number
  longitude: number
  photo_url: string
  categories: OffreCategorie[]
}

export interface Offre {
  id: string
  commerce: Commerce
  titre: string
  description: string
  categorie: OffreCategorie
  prix_normal: number
  prix_flash: number
  reduction_pct: number
  code_promo: string
  places_disponibles: number
  expire_at: string
  created_at: string
  est_active: boolean
}

export interface Trip {
  id: string
  destination: string
  date_depart: string
  heure_depart: string
  lieu_depart: string
  places_total: number
  places_restantes: number
  prix_par_personne: number
  organisateur_id: string
  description: string
  created_at: string
}

export interface Utilisateur {
  id: string
  email: string
  prenom: string
  campus: string
  preferences: OffreCategorie[]
  push_token: string | null
  created_at: string
}
