import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing, BorderRadius } from '../../constants/theme'
import { useAuth } from '../../lib/authContext'
import { isUniversityEmail, CAMPUS_OPTIONS } from '../../lib/supabase'
import Wordmark from '../../components/Wordmark'
import { t } from '../../lib/i18n'
import { useLocale } from '../../lib/locale'

export default function SignupScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { signUp } = useAuth()
  const { locale } = useLocale() // eslint-disable-line @typescript-eslint/no-unused-vars

  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [campus, setCampus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validate = (): string | null => {
    if (!prenom.trim()) return t('auth.signup.errorPrenom')
    if (!email.trim()) return t('auth.signup.errorEmail')
    if (!isUniversityEmail(email)) return t('auth.signup.errorEmailInvalid')
    if (password.length < 8) return t('auth.signup.errorPasswordShort')
    if (password !== confirm) return t('auth.signup.errorPasswordMatch')
    if (!campus) return t('auth.signup.errorCampus')
    return null
  }

  const handleSignup = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)
    const { error } = await signUp(email.trim().toLowerCase(), password, prenom.trim(), campus)
    setLoading(false)

    if (error) {
      if (error.includes('already registered')) {
        setError(t('auth.signup.errorAlreadyUsed'))
      } else {
        setError(error)
      }
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✉️</Text>
        <Text style={styles.successTitle}>{t('auth.signup.successTitle')}</Text>
        <Text style={styles.successText}>
          {t('auth.signup.successBody', { email }).split(email).map((part, i, arr) =>
            i < arr.length - 1
              ? [part, <Text key={i} style={{ fontWeight: '600', color: Colors.ink }}>{email}</Text>]
              : part
          )}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login' as any)}>
          <Text style={styles.btnText}>{t('auth.signup.successCta')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoBlock}>
          <Wordmark size={44} />
          <Text style={styles.logoSub}>{t('auth.tagline')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.signup.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>

          {/* Prénom */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('auth.signup.prenomLabel')}</Text>
            <TextInput
              style={styles.input}
              value={prenom}
              onChangeText={setPrenom}
              placeholder={t('auth.signup.prenomPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('auth.signup.emailLabel')}</Text>
            <TextInput
              style={[
                styles.input,
                email.length > 4 && (isUniversityEmail(email) ? styles.inputValid : styles.inputInvalid),
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.signup.emailPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email.length > 4 && !isUniversityEmail(email) && (
              <Text style={styles.fieldHint}>{t('auth.signup.emailHint')}</Text>
            )}
          </View>

          {/* Campus */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('auth.signup.campusLabel')}</Text>
            <View style={styles.campusGrid}>
              {CAMPUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.domain}
                  style={[styles.campusChip, campus === opt.domain && styles.campusChipActive]}
                  onPress={() => setCampus(opt.domain)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.campusChipText, campus === opt.domain && styles.campusChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('auth.signup.passwordLabel')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.signup.passwordPlaceholder')}
              placeholderTextColor={Colors.inkMuted}
              secureTextEntry
            />
          </View>

          {/* Confirm */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('auth.signup.confirmLabel')}</Text>
            <TextInput
              style={[
                styles.input,
                confirm.length > 0 && (confirm === password ? styles.inputValid : styles.inputInvalid),
              ]}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              placeholderTextColor={Colors.inkMuted}
              secureTextEntry
            />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={Colors.cream} />
              : <Text style={styles.btnText}>{t('auth.signup.submit')}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signup.footerText')}</Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
            <Text style={styles.footerLink}>{t('auth.signup.footerLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  logoBlock: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  logoSub: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '300',
    marginBottom: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.inkLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '400',
  },
  inputValid: {
    borderColor: Colors.success,
  },
  inputInvalid: {
    borderColor: Colors.danger,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '300',
  },
  campusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  campusChip: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  campusChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  campusChipText: {
    fontSize: 12,
    color: Colors.inkLight,
    fontWeight: '500',
  },
  campusChipTextActive: {
    color: Colors.cream,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  btn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    fontSize: 52,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: '300',
  },
  footerLink: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
})
