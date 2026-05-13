import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { SUPABASE_URL } from '../../constants/theme'
import { createTrip } from '../../lib/api'
import { useAuth } from '../../lib/authContext'

const USE_MOCK = SUPABASE_URL.includes('TON_PROJECT_ID')

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>
        {label}
        {required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      {children}
    </View>
  )
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  required: { color: Colors.danger },
})

export default function CreateTripScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  const [destination, setDestination] = useState('')
  const [lieuDepart, setLieuDepart] = useState('')
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [heureDepart, setHeureDepart] = useState('08:00')
  const [placesTotal, setPlacesTotal] = useState('3')
  const [prixParPersonne, setPrixParPersonne] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formatDateDisplay = (d: Date) =>
    d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })

  const validate = () => {
    if (!destination.trim()) return 'Indique une destination.'
    if (!lieuDepart.trim()) return 'Indique un lieu de départ.'
    if (!heureDepart.match(/^\d{1,2}[h:]\d{2}$/)) return "Format heure invalide (ex: 8h00 ou 08:00)."
    const places = parseInt(placesTotal, 10)
    if (isNaN(places) || places < 1 || places > 8) return 'Nombre de places invalide (1–8).'
    const prix = parseFloat(prixParPersonne)
    if (isNaN(prix) || prix < 0) return 'Prix invalide.'
    return null
  }

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Tu dois être connecté pour créer un trip.')
      return
    }

    const err = validate()
    if (err) {
      Alert.alert('Champ manquant', err)
      return
    }

    setSubmitting(true)
    try {
      const tripData = {
        destination: destination.trim(),
        date_depart: date.toISOString().split('T')[0],
        heure_depart: heureDepart.trim(),
        lieu_depart: lieuDepart.trim(),
        places_total: parseInt(placesTotal, 10),
        prix_par_personne: parseFloat(prixParPersonne) || 0,
        organisateur_id: user.id,
        description: description.trim(),
      }

      if (!USE_MOCK) {
        await createTrip(tripData)
      }

      Alert.alert(
        '🎉 Trip créé !',
        `Ton covoiturage vers ${destination} est en ligne.`,
        [{ text: 'Super !', onPress: () => router.back() }]
      )
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le trip. Réessaie.')
    } finally {
      setSubmitting(false)
    }
  }

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
        <Text style={styles.headerTitle}>Nouveau trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Field label="Destination" required>
            <TextInput
              style={styles.input}
              placeholder="Mont-Tremblant, Québec City…"
              placeholderTextColor={Colors.inkMuted}
              value={destination}
              onChangeText={setDestination}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>

          <Field label="Point de départ" required>
            <TextInput
              style={styles.input}
              placeholder="Métro Berri-UQAM, Campus UdeM…"
              placeholderTextColor={Colors.inkMuted}
              value={lieuDepart}
              onChangeText={setLieuDepart}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </Field>

          <Field label="Date de départ" required>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios')
                  if (selected) setDate(selected)
                }}
              />
            )}
          </Field>

          <Field label="Heure de départ" required>
            <TextInput
              style={styles.input}
              placeholder="8h00"
              placeholderTextColor={Colors.inkMuted}
              value={heureDepart}
              onChangeText={setHeureDepart}
              keyboardType="default"
              returnKeyType="next"
            />
          </Field>

          {/* Places + Prix on same row */}
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
              <Field label="Prix / pers." required>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.input, { flex: 1, paddingRight: 28 }]}
                    placeholder="0"
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

          <Field label="Description (optionnel)">
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Détails supplémentaires, règles du covoiturage…"
              placeholderTextColor={Colors.inkMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <Text style={styles.submitText}>Publier le trip</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: Colors.ink,
    fontWeight: '300',
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  input: {
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '400',
  },
  dateText: {
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '400',
  },
  textarea: {
    height: 90,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamDark,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '300',
    color: Colors.ink,
    lineHeight: 24,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  inputWithUnit: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    position: 'absolute',
    right: 14,
    fontSize: 15,
    color: Colors.inkMuted,
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
  },
  submitBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: 0.4,
  },
})
