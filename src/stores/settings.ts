import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db, auth } from '@/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

export const useSettingsStore = defineStore('settings', () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const { locale } = useI18n()
  const pinHash = ref<string | null>(localStorage.getItem('aura-pin-hash'))
  const reminderEnabled = ref(false)
  const reminderTime = ref('20:00') // Default 8 PM
  interface CustomMood { mood: string; affectId: string }
  const customMoods = ref<CustomMood[]>([])

  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  const saveSettings = async () => {
    if (!auth.currentUser) return
    const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'prefs')
    await setDoc(userRef, {
      isDark: isDark.value,
      locale: locale.value,
      pinHash: pinHash.value,
      reminderEnabled: reminderEnabled.value,
      reminderTime: reminderTime.value,
      customMoods: customMoods.value,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  // Use a targeted watch array instead of whole store to avoid loops
  watch([isDark, locale, pinHash, reminderEnabled, reminderTime], () => {
    saveSettings()
  })

  const setPin = async (hash: string) => {
    pinHash.value = hash
    localStorage.setItem('aura-pin-hash', hash)
    await saveSettings()
  }

  const removePin = async () => {
    pinHash.value = null
    localStorage.removeItem('aura-pin-hash')
    await saveSettings()
  }

  const verifyPin = (input: string) => {
    // Basic verification for now, in a real app this would be more secure
    return pinHash.value === input
  }

  const setLocale = async (newLocale: string) => {
    locale.value = newLocale
    await saveSettings()
  }

  const clearSettings = () => {
    pinHash.value = null
    reminderEnabled.value = false
    customMoods.value = []
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  const addCustomMood = async (mood: string, affectId: string) => {
    if (!mood || !affectId || customMoods.value.some(m => m.mood === mood && m.affectId === affectId)) return
    customMoods.value.push({ mood, affectId })
    await saveSettings()
  }

  const removeCustomMood = async (mood: string, affectId: string) => {
    customMoods.value = customMoods.value.filter(m => !(m.mood === mood && m.affectId === affectId))
    await saveSettings()
  }

  const updateCustomMood = async (oldMood: string, newMood: string, affectId: string) => {
    if (!newMood || !affectId || customMoods.value.some(m => m.mood === newMood && m.affectId === affectId)) return
    const index = customMoods.value.findIndex(m => m.mood === oldMood && m.affectId === affectId)
    if (index !== -1 && customMoods.value[index]) {
      customMoods.value[index].mood = newMood
      await saveSettings()
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
        if (data.reminderEnabled !== undefined) reminderEnabled.value = data.reminderEnabled
        if (data.reminderTime) reminderTime.value = data.reminderTime

        // Use deep equality check to prevent reactivity loops
        if (data.customMoods && JSON.stringify(data.customMoods) !== JSON.stringify(customMoods.value)) {
          // Migration: convert string[] to { mood: string, affectId: string }[] if needed
          if (Array.isArray(data.customMoods) && data.customMoods.length > 0 && typeof data.customMoods[0] === 'string') {
             customMoods.value = (data.customMoods as string[]).map(m => ({ mood: m, affectId: 'interest_excitement' }))
          } else {
             customMoods.value = [...data.customMoods]
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
        if (data.reminderEnabled !== undefined) reminderEnabled.value = data.reminderEnabled
        if (data.reminderTime) reminderTime.value = data.reminderTime

        if (data.customMoods && JSON.stringify(data.customMoods) !== JSON.stringify(customMoods.value)) {
          if (Array.isArray(data.customMoods) && data.customMoods.length > 0 && typeof data.customMoods[0] === 'string') {
             customMoods.value = (data.customMoods as string[]).map(m => ({ mood: m, affectId: 'interest_excitement' }))
          } else {
             customMoods.value = [...data.customMoods]
          }
        }
      }
    })
  }

  return {
    isDark,
    toggleDark,
    locale,
    pinHash,
    reminderEnabled,
    reminderTime,
    customMoods,
    loading,
    setPin,
    removePin,
    verifyPin,
    addCustomMood,
    removeCustomMood,
    updateCustomMood,
    loadSettings,
    saveSettings,
    setLocale,
    clearSettings
  }
})
