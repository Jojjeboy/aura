import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { db as dexieDb, type JournalEntry } from '@/db'
import { db as firestore, auth } from '@/firebase'
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  collection,
  query,
  orderBy
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useOnline } from '@vueuse/core'

export const useJournalStore = defineStore('journal', () => {
  const online = useOnline()
  const currentEntry = ref<Partial<JournalEntry>>({
    gratitude: ['', '', ''],
    moods: [],
    health: { sleep: 3, food: 3, movement: 3 }
  })

  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)

  // Helper: Sync a single entry to Firestore
  const syncToFirestore = async (entry: JournalEntry) => {
    if (!online.value || !auth.currentUser) return false

    try {
      const entryRef = doc(firestore, 'users', auth.currentUser.uid, 'journal_entries', entry.id!)

      // Prepare data for Firestore (remove synced flag and add server timestamp)
      const { synced, ...firestoreData } = entry
      await setDoc(entryRef, {
        ...firestoreData,
        updatedAt: serverTimestamp()
      })

      // Update local synced status
      await dexieDb.journal_entries.update(entry.id!, { synced: 1 })
      return true
    } catch (error) {
      console.error('Error syncing to Firestore:', error)
      return false
    }
  }

  // Actions
  const saveEntry = async () => {
    if (!currentEntry.value.moods?.length) return

    const id = currentEntry.value.id || uuidv4()

    // Create the entry object and ensure it is deeply cloned (no proxies)
    const rawEntry: JournalEntry = JSON.parse(JSON.stringify({
        id,
        date: currentEntry.value.date || new Date().toISOString(),
        gratitude: currentEntry.value.gratitude,
        moods: currentEntry.value.moods,
        health: currentEntry.value.health,
        synced: 0,
        updatedAt: Date.now()
    }))

    // Save to IndexedDB (Upsert)
    await dexieDb.journal_entries.put(rawEntry)

    // Optimistic UI update
    const index = entries.value.findIndex(e => e.id === rawEntry.id)
    if (index > -1) {
       entries.value[index] = rawEntry
    } else {
       entries.value.unshift(rawEntry)
    }

    // Attempt to sync to Firestore
    const syncSuccess = await syncToFirestore(rawEntry)
    if (syncSuccess) {
        rawEntry.synced = 1
    }

    // Reset current entry
    resetEntry()
  }

  const loadEntries = async () => {
      loading.value = true

      // Load from Dexie sorted by date desc
      let localEntries = await dexieDb.journal_entries.orderBy('date').reverse().toArray()

      // If local is empty and we are online, try to fetch from Firestore
      if (localEntries.length === 0 && online.value && auth.currentUser) {
          try {
              const entriesRef = collection(firestore, 'users', auth.currentUser.uid, 'journal_entries')
              const q = query(entriesRef, orderBy('date', 'desc'))
              const snapshot = await getDocs(q)

              if (!snapshot.empty) {
                  const remoteEntries = snapshot.docs.map(doc => ({
                      ...doc.data(),
                      id: doc.id,
                      synced: 1,
                      // Firestore timestamp to ms if needed
                      updatedAt: (doc.data().updatedAt as any)?.toMillis?.() || Date.now()
                  })) as JournalEntry[]

                  // Save all to local Dexie
                  await dexieDb.journal_entries.bulkPut(remoteEntries)
                  localEntries = remoteEntries
              }
          } catch (error) {
              console.error('Error fetching from Firestore:', error)
          }
      }

      entries.value = localEntries
      loading.value = false
  }

  const resetEntry = () => {
    currentEntry.value = {
      gratitude: ['', '', ''],
      moods: [],
      health: { sleep: 3, food: 3, movement: 3 }
    }
  }

  const editEntry = (entry: JournalEntry) => {
    currentEntry.value = JSON.parse(JSON.stringify(entry))
  }

  const deleteEntry = async (id: string) => {
    // Delete from Local
    await dexieDb.journal_entries.delete(id)
    entries.value = entries.value.filter(e => e.id !== id)

    // Delete from Firestore
    if (online.value && auth.currentUser) {
        try {
            const entryRef = doc(firestore, 'users', auth.currentUser.uid, 'journal_entries', id)
            await deleteDoc(entryRef)
        } catch (error) {
            console.error('Error deleting from Firestore:', error)
        }
    }
  }

  // Auto-sync watcher: when coming back online, sync pending entries
  watch(online, async (isOnline) => {
    if (isOnline && auth.currentUser) {
      const pending = await dexieDb.journal_entries.where('synced').equals(0).toArray()
      for (const entry of pending) {
        await syncToFirestore(entry)
      }
    }
  })

  // Computed for Streak (placeholder logic)
  const streak = computed(() => {
    return 0
  })

  const isEditing = computed(() => !!currentEntry.value.id)

  const todayEntry = computed(() => {
    const today = new Date().toLocaleDateString()
    return entries.value.find(e => new Date(e.date).toLocaleDateString() === today)
  })

  return {
    currentEntry,
    entries,
    loading,
    saveEntry,
    loadEntries,
    streak,
    todayEntry,
    isEditing,
    resetEntry,
    editEntry,
    deleteEntry
  }
})
