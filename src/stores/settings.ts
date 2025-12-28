import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db, auth } from '@/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useBiometricLock } from '@/composables/useBiometricLock'

export const useSettingsStore = defineStore('settings', () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const { locale } = useI18n()
  const biometricLock = ref(localStorage.getItem('aura-history-lock') === 'true')

  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  const setBiometricLock = async (val: boolean): Promise<boolean> => {
    if (val) {
      // If enabling, try to register platform credentials
      const { register } = useBiometricLock()
      const success = await register()
      if (!success) return false
    }

    biometricLock.value = val
    localStorage.setItem('aura-history-lock', String(val))
    await saveSettings()
    return true
  }

  const setLocale = (lang: string) => {
    locale.value = lang
    saveSettings()
  }

  const saveSettings = async () => {
    if (!auth.currentUser) return

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'prefs')
      await setDoc(userRef, {
        isDark: isDark.value,
        locale: locale.value,
        biometricLock: biometricLock.value,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const loadSettings = async () => {
    if (!auth.currentUser) return
    loading.value = true

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'prefs')
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.isDark !== undefined) isDark.value = data.isDark
        if (data.locale) locale.value = data.locale
        if (data.biometricLock !== undefined) {
          biometricLock.value = data.biometricLock
          localStorage.setItem('aura-history-lock', String(data.biometricLock))
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      loading.value = false
    }

    // Setup listener for real-time sync across devices
    if (unsubscribe) unsubscribe()
    const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'prefs')
    unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        if (data.isDark !== undefined) isDark.value = data.isDark
        if (data.locale) locale.value = data.locale
        if (data.biometricLock !== undefined) {
          biometricLock.value = data.biometricLock
          localStorage.setItem('aura-history-lock', String(data.biometricLock))
        }
      }
    })
  }

  const clearSettings = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Watch for local changes to save back to Firestore (auto-sync)
  watch([isDark, locale], () => {
    saveSettings()
  })

  return {
    isDark,
    toggleDark,
    locale,
    biometricLock,
    loading,
    setBiometricLock,
    setLocale,
    loadSettings,
    saveSettings,
    clearSettings
  }
})
