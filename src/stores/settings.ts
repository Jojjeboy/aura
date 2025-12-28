import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db, auth } from '@/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
// import { useBiometricLock } from '@/composables/useBiometricLock' // Removed

export const useSettingsStore = defineStore('settings', () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const { locale } = useI18n()
  const pinHash = ref<string | null>(localStorage.getItem('aura-pin-hash'))

  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  // Utility: Hash PIN using SHA-256
  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const setPin = async (pin: string) => {
    const hash = await hashPin(pin)
    pinHash.value = hash
    localStorage.setItem('aura-pin-hash', hash)
    await saveSettings()
  }

  const removePin = async () => {
    pinHash.value = null
    localStorage.removeItem('aura-pin-hash')
    await saveSettings()
  }

  const verifyPin = async (inputPin: string): Promise<boolean> => {
    if (!pinHash.value) return true // No lock means accessible
    const inputHash = await hashPin(inputPin)
    return inputHash === pinHash.value
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
        pinHash: pinHash.value,
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
        if (data.pinHash !== undefined) {
          pinHash.value = data.pinHash
          if (data.pinHash) {
             localStorage.setItem('aura-pin-hash', data.pinHash)
          } else {
             localStorage.removeItem('aura-pin-hash')
          }
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
        if (data.pinHash !== undefined) {
           pinHash.value = data.pinHash
           if (data.pinHash) {
              localStorage.setItem('aura-pin-hash', data.pinHash)
           } else {
              localStorage.removeItem('aura-pin-hash')
           }
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
    pinHash,
    loading,
    setPin,
    removePin,
    verifyPin,
    setLocale,
    loadSettings,
    saveSettings,
    clearSettings
  }
})
