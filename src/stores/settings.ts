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
  // pinHash is loaded per-user in loadSettings — not read from localStorage at init
  const pinHash = ref<string | null>(null)
  const showQuotesAfterLogging = ref(false)
  interface CustomMood { mood: string; affectId: string }
  const customMoods = ref<CustomMood[]>([])
  const gratitudeSuggestions = ref<string[]>([])

  const loading = ref(false)
  let unsubscribe: (() => void) | null = null
  let _isApplyingRemote = false

  const saveSettings = async () => {
    if (!auth.currentUser) return
    const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'prefs')
    await setDoc(userRef, {
      isDark: isDark.value,
      locale: locale.value,
      pinHash: pinHash.value,
      showQuotesAfterLogging: showQuotesAfterLogging.value,
      customMoods: customMoods.value,
      gratitudeSuggestions: gratitudeSuggestions.value,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  // Use a targeted watch array instead of whole store to avoid loops.
  // Guard: skip saving when we are applying data received from Firestore,
  // otherwise the snapshot triggers a write which triggers another snapshot → infinite loop.
  watch([isDark, locale, pinHash, showQuotesAfterLogging, gratitudeSuggestions], () => {
    if (_isApplyingRemote) return
    saveSettings()
  }, { deep: true })

  const setPin = async (hash: string) => {
    pinHash.value = hash
    if (auth.currentUser) localStorage.setItem(`aura-pin-hash-${auth.currentUser.uid}`, hash)
    await saveSettings()
  }

  const removePin = async () => {
    pinHash.value = null
    if (auth.currentUser) localStorage.removeItem(`aura-pin-hash-${auth.currentUser.uid}`)
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
    customMoods.value = []
    gratitudeSuggestions.value = []
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

  const addGratitudeSuggestion = async (suggestion: string) => {
    if (!suggestion || gratitudeSuggestions.value.includes(suggestion)) return
    gratitudeSuggestions.value.push(suggestion)
    await saveSettings()
  }

  const removeGratitudeSuggestion = async (suggestion: string) => {
    gratitudeSuggestions.value = gratitudeSuggestions.value.filter(s => s !== suggestion)
    await saveSettings()
  }

  const updateGratitudeSuggestion = async (oldValue: string, newValue: string) => {
    if (!newValue || gratitudeSuggestions.value.includes(newValue)) return
    const index = gratitudeSuggestions.value.indexOf(oldValue)
    if (index !== -1) {
      gratitudeSuggestions.value[index] = newValue
      await saveSettings()
    }
  }

  const seedGratitudeSuggestions = async () => {
    if (gratitudeSuggestions.value.length > 0) return
    console.log('Seeding gratitude suggestions from local JSON...')
    try {
      const data = (await import('@/assets/gratitude_list.json')).default
      let all: string[] = []
      if (data && data.gratitude_list) {
        data.gratitude_list.forEach((category: { items?: string[] }) => {
          if (category.items) all = all.concat(category.items)
        })
      }
      gratitudeSuggestions.value = all
      console.log(`Successfully seeded ${all.length} suggestions.`)
      await saveSettings() // Save to Firestore immediately so it's persistent
    } catch (e) {
      console.error('Failed to seed gratitude suggestions:', e)
    }
  }

  interface SettingsData {
    isDark?: boolean
    locale?: string
    pinHash?: string | null
    showQuotesAfterLogging?: boolean
    customMoods?: (string | CustomMood)[]
    gratitudeSuggestions?: string[]
  }

  const processSettingsData = (data: SettingsData) => {
    // Set flag so the watcher knows NOT to write back to Firestore while we
    // are applying data that just arrived from Firestore (prevents infinite loop).
    _isApplyingRemote = true
    try {
      if (data.isDark !== undefined) isDark.value = data.isDark
      if (data.locale) locale.value = data.locale
      if (data.pinHash !== undefined) {
        pinHash.value = data.pinHash
        if (auth.currentUser) {
          if (data.pinHash) {
            localStorage.setItem(`aura-pin-hash-${auth.currentUser.uid}`, data.pinHash)
          } else {
            localStorage.removeItem(`aura-pin-hash-${auth.currentUser.uid}`)
          }
        }
      }
      if (data.showQuotesAfterLogging !== undefined) showQuotesAfterLogging.value = data.showQuotesAfterLogging

      if (data.customMoods && JSON.stringify(data.customMoods) !== JSON.stringify(customMoods.value)) {
        if (Array.isArray(data.customMoods) && data.customMoods.length > 0 && typeof data.customMoods[0] === 'string') {
          customMoods.value = (data.customMoods as string[]).map(m => ({ mood: m, affectId: 'interest_excitement' }))
        } else {
          customMoods.value = [...data.customMoods] as CustomMood[]
        }
      }

      if (data.gratitudeSuggestions && Array.isArray(data.gratitudeSuggestions)) {
        gratitudeSuggestions.value = [...data.gratitudeSuggestions]
      } else if (data.gratitudeSuggestions === undefined && gratitudeSuggestions.value.length === 0) {
        seedGratitudeSuggestions()
      }
    } finally {
      _isApplyingRemote = false
    }
  }

  const loadSettings = async () => {
    if (!auth.currentUser) return
    loading.value = true

    const uid = auth.currentUser.uid
    // Load scoped pin from localStorage for this user
    pinHash.value = localStorage.getItem(`aura-pin-hash-${uid}`)

    const userRef = doc(db, 'users', uid, 'settings', 'prefs')

    try {
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        processSettingsData(docSnap.data() as SettingsData)
      } else {
        // New user or missing settings document
        console.log('No settings document found, triggering initial seed...')
        await seedGratitudeSuggestions()
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      loading.value = false
    }

    // Double check if we need to seed (e.g. if document existed but gratitudeSuggestions field was missing)
    if (gratitudeSuggestions.value.length === 0) {
      await seedGratitudeSuggestions()
    }

    // Setup listener for real-time sync across devices
    if (unsubscribe) unsubscribe()
    unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        processSettingsData(snapshot.data() as SettingsData)
      }
    })
  }

  return {
    isDark,
    toggleDark,
    locale,
    pinHash,
    showQuotesAfterLogging,
    customMoods,
    gratitudeSuggestions,
    loading,
    setPin,
    removePin,
    verifyPin,
    addCustomMood,
    removeCustomMood,
    updateCustomMood,
    addGratitudeSuggestion,
    removeGratitudeSuggestion,
    updateGratitudeSuggestion,
    loadSettings,
    saveSettings,
    setLocale,
    clearSettings
  }
})
