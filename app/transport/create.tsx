import React, { useState, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Platform, Alert, KeyboardAvoidingView,
  ActivityIndicator, Modal, FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { SUPABASE_URL } from '../../constants/theme'
import { createTrip } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import type { TripType } from '../../types'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

// ── Données statiques ────────────────────────────────────────────

const VILLES = [
  'Montréal', 'Québec City', 'Ottawa', 'Toronto',
  'Sherbrooke', 'Trois-Rivières', 'Mont-Tremblant',
  'Gatineau', 'Laval', 'Longueuil', 'Drummondville',
  'Saint-Jean-sur-Richelieu', 'Saguenay', 'Rimouski',
]

const PICKUP_SUGGESTIONS: Record<string, string[]> = {
  'Montréal': [
    'Métro Berri-UQAM', 'Métro McGill', 'Métro Côte-des-Neiges',
    'Métro Montmorency', 'Métro Lionel-Groulx', 'Campus UdeM',
    'Campus McGill', 'Campus Concordia (SGW)', 'Campus UQAM',
    'Campus ÉTS', 'Aéroport YUL',
  ],
  'Québec City': [
    'Université Laval', 'Vieux-Port de Québec',
    'Place d\'Youville', 'Gare du Palais',
  ],
  'Ottawa': [
    'Université d\'Ottawa', 'Carleton University',
    'Gare d\'Ottawa', 'Place de la Cité',
  ],
  'Toronto': [
    'Union Station', 'Université de Toronto',
    'Yorkdale Mall',
  ],
  'Sherbrooke': ['Université de Sherbrooke', 'Centre-ville Sherbrooke'],
  'Trois-Rivières': ['UQTR', 'Centre-ville Trois-Rivières'],
  'Mont-Tremblant': ['Village Tremblant', 'Station Mont-Tremblant'],
  'Gatineau': ['UQO Gatineau', 'Centre-ville Gatineau'],
  'Laval': ['Métro Montmorency', 'Métro Cartier', 'UdeM Laval'],
}

// Prix suggérés (aller simple, par personne) selon route
const PRIX_SUGGERES: Record<string, number> = {
  'Montréal|Québec City': 20,
  'Montréal|Ottawa': 25,
  'Montréal|Toronto': 45,
  'Montréal|Mont-Tremblant': 15,
  'Montréal|Sherbrooke': 18,
  'Montréal|Trois-Rivières': 15,
  'Montréal|Gatineau': 22,
  'Montréal|Laval': 8,
  'Montréal|Longueuil': 6,
  'Québec City|Montréal': 20,
  'Ottawa|Montréal': 25,
  'Toronto|Montréal': 45,
}

const TRIP_TYPES: { value: TripType; label: string; icon: string; desc: string }[] = [
  { value: 'aller_simple', label: 'Aller simple', icon: '→', desc: 'Un seul trajet' },
  { value: 'aller_retour', label: 'Aller-retour', icon: '↔', desc: 'Avec retour' },
  { value: 'recurrent', label: 'Récurrent', icon: '↺', desc: 'Chaque semaine' },
]

const JOURS_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const JOURS_FULL = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ── Sous-composants ──────────────────────────────────────────────

function Field({ label, children, required, hint }: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>
        {label}{required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      {children}
      {hint && <Text style={fieldStyles.hint}>{hint}</Text>}
    </View>
  )
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: 11, fontWeight: '600', color: Colors.inkMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  required: { color: Colors.danger },
  hint: {
    fontSize: 11, color: Colors.accent, fontWeight: '500',
    marginTop: 5, letterSpacing: 0.2,
  },
})

function CityPicker({
  visible, title, value, onSelect, onClose,
}: {
  visible: boolean; title: string; value: string;
  onSelect: (v: string) => void; onClose: () => void;
}) {
  const [search, setSearch] = useState('')
  const filtered = VILLES.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={picker.overlay} activeOpacity={1} onPress={onClose} />
      <View style={picker.sheet}>
        <View style={picker.handle} />
        <Text style={picker.title}>{title}</Text>
        <TextInput
          style={picker.search}
          placeholder="Rechercher une ville…"
          placeholderTextColor={Colors.inkMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={filtered}
          keyExtractor={item => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[picker.cityRow, item === value && picker.cityRowActive]}
              onPress={() => { onSelect(item); onClose() }}
              activeOpacity={0.7}
            >
              <Text style={[picker.cityText, item === value && picker.cityTextActive]}>
                {item}
              </Text>
              {item === value && <Text style={picker.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  )
}

const picker = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 40, maxHeight: '70%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.creamDark,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  title: {
    fontSize: 16, fontWeight: '700', color: Colors.ink,
    textAlign: 'center', paddingVertical: Spacing.sm,
  },
  search: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.cream, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.creamDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15, color: Colors.ink,
  },
  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.creamDark,
  },
  cityRowActive: { backgroundColor: 'rgba(200,169,110,0.08)' },
  cityText: { fontSize: 15, fontWeight: '400', color: Colors.ink },
  cityTextActive: { fontWeight: '700', color: Colors.ink },
  checkmark: { fontSize: 16, color: Colors.accent, fontWeight: '700' },
})

// ── Écran principal ──────────────────────────────────────────────

export default function CreateTripScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  // Route
  const [villeDepart, setVilleDepart] = useState('Montréal')
  const [destination, setDestination] = useState('')
  const [showVillePicker, setShowVillePicker] = useState<'depart' | 'dest' | null>(null)

  // Type
  const [tripType, setTripType] = useState<TripType>('aller_simple')

  // Pickup
  const [lieuDepart, setLieuDepart] = useState('')

  // Aller simple & aller-retour : date/heure départ
  const [dateDepart, setDateDepart] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const [showDateDepart, setShowDateDepart] = useState(false)
  const [heureDepart, setHeureDepart] = useState('08:00')

  // Aller-retour : retour
  const [dateRetour, setDateRetour] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))
  const [showDateRetour, setShowDateRetour] = useState(false)
  const [heureRetour, setHeureRetour] = useState('20:00')

  // Récurrent
  const [joursSemaine, setJoursSemaine] = useState<number[]>([])
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [showDateFin, setShowDateFin] = useState(false)

  // Logistique
  const [placesTotal, setPlacesTotal] = useState('3')
  const [prixParPersonne, setPrixParPersonne] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Dérivés ────────────────────────────────────────────────────

  const pickupSuggestions = PICKUP_SUGGESTIONS[villeDepart] ?? []
  const routeKey = `${villeDepart}|${destination}`
  const prixSuggere = PRIX_SUGGERES[routeKey] ?? null

  const formatDate = (d: Date) =>
    d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })

  const toggleJour = (idx: number) =>
    setJoursSemaine(prev =>
      prev.includes(idx) ? prev.filter(j => j !== idx) : [...prev, idx].sort()
    )

  // ── Validation ────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!villeDepart.trim()) return 'Indique une ville de départ.'
    if (!destination.trim()) return 'Indique une destination.'
    if (villeDepart.trim() === destination.trim()) return 'Départ et destination doivent être différents.'
    if (!lieuDepart.trim()) return 'Indique un point de rendez-vous.'
    if (tripType === 'recurrent' && joursSemaine.length === 0)
      return 'Sélectionne au moins un jour de la semaine.'
    if (tripType !== 'recurrent' && !heureDepart.match(/^\d{1,2}[h:]\d{2}$/))
      return "Format heure invalide (ex : 8h00 ou 08:00)."
    if (tripType === 'aller_retour' && !heureRetour.match(/^\d{1,2}[h:]\d{2}$/))
      return "Format heure de retour invalide."
    if (tripType === 'aller_retour' && dateRetour < dateDepart)
      return 'La date de retour doit être après la date de départ.'
    const places = parseInt(placesTotal, 10)
    if (isNaN(places) || places < 1 || places > 8) return 'Nombre de places invalide (1–8).'
    const prix = parseFloat(prixParPersonne)
    if (prixParPersonne && (isNaN(prix) || prix < 0)) return 'Prix invalide.'
    return null
  }

  // ── Submit ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Tu dois être connecté pour créer un trip.')
      return
    }
    const err = validate()
    if (err) { Alert.alert('Champ manquant', err); return }

    setSubmitting(true)
    try {
      const tripData: any = {
        ville_depart: villeDepart.trim(),
        destination: destination.trim(),
        type: tripType,
        lieu_depart: lieuDepart.trim(),
        places_total: parseInt(placesTotal, 10),
        prix_par_personne: parseFloat(prixParPersonne) || prixSuggere || 0,
        organisateur_id: user.id,
        description: description.trim(),
        // Dates selon type
        date_depart: tripType === 'recurrent'
          ? (dateFin ? dateFin.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
          : dateDepart.toISOString().split('T')[0],
        heure_depart: tripType === 'recurrent' ? '' : heureDepart.trim(),
      }
      if (tripType === 'aller_retour') {
        tripData.date_retour = dateRetour.toISOString().split('T')[0]
        tripData.heure_retour = heureRetour.trim()
      }
      if (tripType === 'recurrent') {
        tripData.jours_semaine = joursSemaine
        if (dateFin) tripData.date_fin = dateFin.toISOString().split('T')[0]
      }

      if (!USE_MOCK) await createTrip(tripData)

      Alert.alert(
        '🎉 Trip créé !',
        `Ton covoiturage ${villeDepart} → ${destination} est en ligne.`,
        [{ text: 'Super !', onPress: () => router.back() }]
      )
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le trip. Réessaie.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proposer un trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Section : Trajet ── */}
          <SectionHeader label="Trajet" />

          {/* Ville départ + Destination */}
          <View style={styles.routeBlock}>
            {/* Départ */}
            <TouchableOpacity
              style={styles.cityBtn}
              onPress={() => setShowVillePicker('depart')}
              activeOpacity={0.75}
            >
              <View style={styles.cityDot} />
              <View style={styles.cityBtnContent}>
                <Text style={styles.cityBtnLabel}>DÉPART</Text>
                <Text style={styles.cityBtnValue}>{villeDepart || 'Choisir…'}</Text>
              </View>
              <Text style={styles.cityChevron}>›</Text>
            </TouchableOpacity>

            {/* Ligne route */}
            <View style={styles.routeConnector}>
              <View style={styles.routeConnectorLine} />
            </View>

            {/* Destination */}
            <TouchableOpacity
              style={styles.cityBtn}
              onPress={() => setShowVillePicker('dest')}
              activeOpacity={0.75}
            >
              <View style={[styles.cityDot, styles.cityDotDest]} />
              <View style={styles.cityBtnContent}>
                <Text style={styles.cityBtnLabel}>DESTINATION</Text>
                <Text style={[
                  styles.cityBtnValue,
                  !destination && styles.cityBtnPlaceholder,
                ]}>
                  {destination || 'Choisir une ville…'}
                </Text>
              </View>
              <Text style={styles.cityChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* ── Type de trajet ── */}
          <SectionHeader label="Type de trajet" />

          <View style={styles.typeGrid}>
            {TRIP_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeCard, tripType === t.value && styles.typeCardActive]}
                onPress={() => setTripType(t.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.typeIcon, tripType === t.value && styles.typeIconActive]}>
                  {t.icon}
                </Text>
                <Text style={[styles.typeLabel, tripType === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
                <Text style={[styles.typeDesc, tripType === t.value && styles.typeDescActive]}>
                  {t.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Section : Horaire ── */}
          <SectionHeader label="Horaire" />

          {/* Aller simple & aller-retour : date départ */}
          {tripType !== 'recurrent' && (
            <View style={styles.row}>
              <View style={{ flex: 1.6, marginRight: Spacing.sm }}>
                <Field label="Date de départ" required>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDateDepart(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateText}>{formatDate(dateDepart)}</Text>
                  </TouchableOpacity>
                  {showDateDepart && (
                    <DateTimePicker
                      value={dateDepart}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={(_, d) => {
                        setShowDateDepart(Platform.OS === 'ios')
                        if (d) setDateDepart(d)
                      }}
                    />
                  )}
                </Field>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Field label="Heure" required>
                  <TextInput
                    style={styles.input}
                    placeholder="08h00"
                    placeholderTextColor={Colors.inkMuted}
                    value={heureDepart}
                    onChangeText={setHeureDepart}
                    returnKeyType="next"
                  />
                </Field>
              </View>
            </View>
          )}

          {/* Récurrent : jours de la semaine */}
          {tripType === 'recurrent' && (
            <Field label="Jours de la semaine" required>
              <View style={styles.joursRow}>
                {JOURS_LABELS.map((j, i) => {
                  const idx = i + 1
                  const active = joursSemaine.includes(idx)
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.jourBtn, active && styles.jourBtnActive]}
                      onPress={() => toggleJour(idx)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.jourText, active && styles.jourTextActive]}>{j}</Text>
                      <Text style={[styles.jourFull, active && styles.jourFullActive]}>
                        {JOURS_FULL[i]}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              {joursSemaine.length > 0 && (
                <Text style={styles.joursResume}>
                  Chaque {joursSemaine.map(j => JOURS_FULL[j - 1]).join(', ')}
                </Text>
              )}
            </Field>
          )}

          {/* Récurrent : heure habituelle */}
          {tripType === 'recurrent' && (
            <Field label="Heure habituelle de départ" required>
              <TextInput
                style={styles.input}
                placeholder="08h00"
                placeholderTextColor={Colors.inkMuted}
                value={heureDepart}
                onChangeText={setHeureDepart}
                returnKeyType="next"
              />
            </Field>
          )}

          {/* Récurrent : date de fin */}
          {tripType === 'recurrent' && (
            <Field label="Jusqu'au (optionnel)">
              <TouchableOpacity
                style={[styles.input, styles.inputOptional]}
                onPress={() => setShowDateFin(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateText, !dateFin && { color: Colors.inkMuted }]}>
                  {dateFin ? formatDate(dateFin) : 'Sans date de fin'}
                </Text>
                {dateFin && (
                  <TouchableOpacity
                    onPress={() => setDateFin(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              {showDateFin && (
                <DateTimePicker
                  value={dateFin ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(_, d) => {
                    setShowDateFin(Platform.OS === 'ios')
                    if (d) setDateFin(d)
                  }}
                />
              )}
            </Field>
          )}

          {/* Aller-retour : date et heure de retour */}
          {tripType === 'aller_retour' && (
            <View style={[styles.retourBlock]}>
              <Text style={styles.retourBlockTitle}>↩ Retour</Text>
              <View style={styles.row}>
                <View style={{ flex: 1.6, marginRight: Spacing.sm }}>
                  <Field label="Date de retour" required>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDateRetour(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateText}>{formatDate(dateRetour)}</Text>
                    </TouchableOpacity>
                    {showDateRetour && (
                      <DateTimePicker
                        value={dateRetour}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={dateDepart}
                        onChange={(_, d) => {
                          setShowDateRetour(Platform.OS === 'ios')
                          if (d) setDateRetour(d)
                        }}
                      />
                    )}
                  </Field>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Field label="Heure" required>
                    <TextInput
                      style={styles.input}
                      placeholder="20h00"
                      placeholderTextColor={Colors.inkMuted}
                      value={heureRetour}
                      onChangeText={setHeureRetour}
                      returnKeyType="next"
                    />
                  </Field>
                </View>
              </View>
            </View>
          )}

          {/* ── Section : Lieu de RDV ── */}
          <SectionHeader label="Point de rendez-vous" />

          <Field label="Adresse ou lieu" required>
            <TextInput
              style={styles.input}
              placeholder="Ex : Métro Berri-UQAM"
              placeholderTextColor={Colors.inkMuted}
              value={lieuDepart}
              onChangeText={setLieuDepart}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>

          {/* Suggestions chips */}
          {pickupSuggestions.length > 0 && (
            <View style={styles.suggestionsBlock}>
              <Text style={styles.suggestionsLabel}>Lieux courants à {villeDepart}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsRow}
              >
                {pickupSuggestions.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, lieuDepart === s && styles.chipActive]}
                    onPress={() => setLieuDepart(s)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, lieuDepart === s && styles.chipTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Section : Logistique ── */}
          <SectionHeader label="Places & prix" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Field label="Places dispo" required>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlacesTotal(p => String(Math.max(1, parseInt(p, 10) - 1)))}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{placesTotal}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlacesTotal(p => String(Math.min(8, parseInt(p, 10) + 1)))}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </Field>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Field
                label="Prix / pers."
                required
                hint={prixSuggere && !prixParPersonne
                  ? `Prix suggéré : ~${prixSuggere} $`
                  : undefined}
              >
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.input, { flex: 1, paddingRight: 28 }]}
                    placeholder={prixSuggere ? `~${prixSuggere}` : '0'}
                    placeholderTextColor={Colors.inkMuted}
                    value={prixParPersonne}
                    onChangeText={setPrixParPersonne}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                  <Text style={styles.unit}>$</Text>
                </View>
              </Field>
            </View>
          </View>

          <Field label="Message aux passagers (optionnel)">
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Bagages acceptés, préférences musique, co-pilote bienvenu…"
              placeholderTextColor={Colors.inkMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>

          <View style={{ height: Spacing.xxl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        {/* Preview route */}
        {destination ? (
          <View style={styles.routePreview}>
            <Text style={styles.routePreviewText}>
              {villeDepart} → {destination}
              {tripType === 'aller_retour' && '  ↩'}
              {tripType === 'recurrent' && joursSemaine.length > 0
                && `  ↺ ${joursSemaine.map(j => JOURS_LABELS[j - 1]).join(' ')}`}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.88}
        >
          {submitting
            ? <ActivityIndicator color={Colors.cream} />
            : <Text style={styles.submitText}>Publier le trip</Text>
          }
        </TouchableOpacity>
      </View>

      {/* City pickers */}
      <CityPicker
        visible={showVillePicker === 'depart'}
        title="Ville de départ"
        value={villeDepart}
        onSelect={v => { setVilleDepart(v); setLieuDepart('') }}
        onClose={() => setShowVillePicker(null)}
      />
      <CityPicker
        visible={showVillePicker === 'dest'}
        title="Destination"
        value={destination}
        onSelect={setDestination}
        onClose={() => setShowVillePicker(null)}
      />
    </View>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={sectionStyles.row}>
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.line} />
    </View>
  )
}
const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, marginTop: Spacing.sm, gap: Spacing.sm,
  },
  label: {
    fontSize: 13, fontWeight: '700', color: Colors.ink, letterSpacing: 0.2,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.creamDark },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.creamDark,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, color: Colors.ink, fontWeight: '300', lineHeight: 22 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink, letterSpacing: 0.2 },

  scrollContent: {
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl,
  },

  // ── Route block ───────────────────────────────────────────────
  routeBlock: {
    backgroundColor: Colors.cream, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.creamDark,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  cityBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14, gap: 12,
  },
  cityDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent, flexShrink: 0,
  },
  cityDotDest: {
    backgroundColor: Colors.background,
    borderWidth: 2, borderColor: Colors.accent,
  },
  cityBtnContent: { flex: 1, gap: 2 },
  cityBtnLabel: {
    fontSize: 9, fontWeight: '600', color: Colors.inkMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  cityBtnValue: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  cityBtnPlaceholder: { color: Colors.inkMuted, fontWeight: '400' },
  cityChevron: { fontSize: 20, color: Colors.inkMuted, fontWeight: '300' },
  routeConnector: {
    paddingLeft: Spacing.md + 12 + 4,
    paddingVertical: 0,
    borderTopWidth: 1, borderTopColor: Colors.creamDark,
  },
  routeConnectorLine: {
    width: 1.5, height: 16, backgroundColor: Colors.creamDark,
    marginLeft: 4,
  },

  // ── Type cards ────────────────────────────────────────────────
  typeGrid: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  typeCard: {
    flex: 1, backgroundColor: Colors.cream, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.creamDark,
    padding: Spacing.sm, alignItems: 'center', gap: 3,
  },
  typeCardActive: {
    backgroundColor: Colors.ink, borderColor: Colors.ink,
  },
  typeIcon: { fontSize: 20, color: Colors.inkMuted },
  typeIconActive: { color: Colors.accent },
  typeLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.inkLight, letterSpacing: 0.2,
  },
  typeLabelActive: { color: Colors.cream },
  typeDesc: { fontSize: 9, color: Colors.inkMuted, fontWeight: '400' },
  typeDescActive: { color: 'rgba(245,240,232,0.55)' },

  // ── Inputs ────────────────────────────────────────────────────
  input: {
    backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15, color: Colors.ink, fontWeight: '400',
  },
  inputOptional: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateText: { fontSize: 15, color: Colors.ink, fontWeight: '400' },
  textarea: { height: 90, paddingTop: 12 },
  row: { flexDirection: 'row' },
  inputWithUnit: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  unit: { position: 'absolute', right: 14, fontSize: 15, color: Colors.inkMuted },
  clearBtn: { fontSize: 14, color: Colors.inkMuted, paddingLeft: 4 },

  // ── Jours semaine ─────────────────────────────────────────────
  joursRow: {
    flexDirection: 'row', gap: 5,
  },
  jourBtn: {
    flex: 1, backgroundColor: Colors.cream, borderWidth: 1.5,
    borderColor: Colors.creamDark, borderRadius: BorderRadius.md,
    paddingVertical: 8, alignItems: 'center', gap: 1,
  },
  jourBtnActive: {
    backgroundColor: Colors.ink, borderColor: Colors.ink,
  },
  jourText: { fontSize: 13, fontWeight: '800', color: Colors.inkMuted },
  jourTextActive: { color: Colors.accent },
  jourFull: { fontSize: 8, color: Colors.inkMuted, fontWeight: '500' },
  jourFullActive: { color: 'rgba(245,240,232,0.5)' },
  joursResume: {
    fontSize: 12, color: Colors.inkLight, fontWeight: '400',
    marginTop: 6, fontStyle: 'italic',
  },

  // ── Retour block ──────────────────────────────────────────────
  retourBlock: {
    backgroundColor: 'rgba(200,169,110,0.06)',
    borderRadius: BorderRadius.lg, borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.25)',
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  retourBlockTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.accent,
    marginBottom: Spacing.sm, letterSpacing: 0.2,
  },

  // ── Suggestions ───────────────────────────────────────────────
  suggestionsBlock: { marginBottom: Spacing.md, marginTop: -4 },
  suggestionsLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.inkMuted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7,
  },
  suggestionsRow: { paddingBottom: 4 },
  chip: {
    backgroundColor: Colors.cream, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.creamDark,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.inkLight },
  chipTextActive: { color: Colors.cream },

  // ── Stepper ───────────────────────────────────────────────────
  stepperRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cream, borderWidth: 1,
    borderColor: Colors.creamDark, borderRadius: BorderRadius.md, overflow: 'hidden',
  },
  stepperBtn: {
    width: 44, height: 48, alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.creamDark,
  },
  stepperBtnText: { fontSize: 20, fontWeight: '300', color: Colors.ink, lineHeight: 24 },
  stepperValue: {
    flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.ink,
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.creamDark,
    gap: Spacing.sm,
  },
  routePreview: {
    backgroundColor: Colors.cream, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    alignItems: 'center',
  },
  routePreviewText: {
    fontSize: 13, fontWeight: '600', color: Colors.ink, letterSpacing: 0.2,
  },
  submitBtn: {
    backgroundColor: Colors.ink, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    fontSize: 16, fontWeight: '700', color: Colors.cream, letterSpacing: 0.4,
  },
})
