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

export type TripType = 'aller_simple' | 'aller_retour' | 'recurrent'

export interface Trip {
  id: string
  ville_depart: string
  destination: string
  date_depart: string
  heure_depart: string
  lieu_depart: string
  places_total: number
  places_restantes: number
  prix_par_personne: number
  organisateur_id: string
  description: string
  type?: TripType
  // Aller-retour
  date_retour?: string
  heure_retour?: string
  // Récurrent
  jours_semaine?: number[]   // 1=Lun … 7=Dim
  date_fin?: string
  created_at: string
}

export interface Reservation {
  id: string
  user_id: string
  offre_id: string
  commerce_nom: string
  commerce_photo_url: string
  offre_titre: string
  code_promo: string
  prix_flash: number
  prix_normal: number
  reduction_pct: number
  created_at: string
  status: 'active' | 'validated' | 'expired'
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
