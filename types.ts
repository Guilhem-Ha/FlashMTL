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

export interface Utilisateur {
  id: string
  email: string
  prenom: string
  campus: string
  push_token: string | null
  created_at: string
}
