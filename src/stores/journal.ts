import { defineStore } from 'pinia'
import { ref, computed, watch, toRaw } from 'vue'
import { db as dexieDb, type JournalEntry } from '@/db'
import { db as firestore, auth } from '@/firebase'
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useOnline } from '@vueuse/core'

export const useJournalStore = defineStore('journal', () => {
  const online = useOnline()
  const currentEntry = ref<Partial<JournalEntry>>({
    gratitude: [''],
    wellDone: [''],
    moods: [],
    health: { sleep: 3, food: 3, movement: 3 }
  })

  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)
  const initialized = ref(false)
  let unsubscribe: (() => void) | null = null

  // ---------- Draft persistence helpers ----------
  const getDraftKey = () =>
    auth.currentUser ? `aura-draft-${auth.currentUser.uid}` : null

  const saveDraft = (entry: Partial<JournalEntry>) => {
    const key = getDraftKey()
    // Only persist drafts for NEW entries (no id = not yet saved)
    // Editing an existing entry is already persisted in IndexedDB/Firestore
    if (key && !entry.id) {
      localStorage.setItem(key, JSON.stringify(entry))
    }
  }

  const clearDraft = () => {
    const key = getDraftKey()
    if (key) localStorage.removeItem(key)
  }

  const restoreDraft = () => {
    const key = getDraftKey()
    if (!key) return
    const saved = localStorage.getItem(key)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as Partial<JournalEntry>
      // Only restore if it's genuinely a new-entry draft (no id)
      if (!parsed.id) {
        currentEntry.value = parsed
      }
    } catch (e) {
      console.error('Failed to parse journal draft:', e)
    }
  }
  // -----------------------------------------------

  // Helper: Sync a single entry to Firestore (for offline-to-online sync)
  const syncToFirestore = async (entry: JournalEntry) => {
    if (!online.value || !auth.currentUser) return false

    try {
      const entryRef = doc(firestore, 'users', auth.currentUser.uid, 'journal_entries', entry.id!)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const { synced: _, ...firestoreData } = entry as any

      await setDoc(entryRef, {
        ...firestoreData,
        updatedAt: serverTimestamp()
      })

      await dexieDb.journal_entries.update(entry.id!, { synced: 1 })
      return true
    } catch (error) {
      console.error('Error syncing to Firestore:', error)
      return false
    }
  }

  // Real-time synchronization
  const startRealtimeSync = () => {
    if (!auth.currentUser) return
    if (unsubscribe) unsubscribe()

    loading.value = true
    const entriesRef = collection(firestore, 'users', auth.currentUser.uid, 'journal_entries')
    const q = query(entriesRef, orderBy('date', 'desc'))

    unsubscribe = onSnapshot(q, async (snapshot) => {
      // Process changes individually
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data()
        const id = change.doc.id

        if (change.type === 'added' || change.type === 'modified') {
          const entry = {
            ...data,
            id,
            synced: 1,
            updatedAt: (data.updatedAt as { toMillis?: () => number })?.toMillis?.() || Date.now()
          } as JournalEntry
          await dexieDb.journal_entries.put(entry)
        } else if (change.type === 'removed') {
          await dexieDb.journal_entries.delete(id)
        }
      }

      // After all processing, refresh the local list from Dexie
      entries.value = await dexieDb.journal_entries.orderBy('date').reverse().toArray()
      loading.value = false
    }, (error) => {
      console.error('Firestore snapshot error:', error)
      loading.value = false
    })
  }

  // Actions
  const saveEntry = async () => {
    if (!currentEntry.value.moods?.length) return

    const id = currentEntry.value.id || uuidv4()

    const rawEntry: JournalEntry = structuredClone(toRaw({
        id,
        date: currentEntry.value.date || new Date().toISOString(),
        gratitude: toRaw(currentEntry.value.gratitude || []),
        wellDone: toRaw(currentEntry.value.wellDone || []),
        moods: toRaw(currentEntry.value.moods),
        thoughts: currentEntry.value.thoughts,
        health: toRaw(currentEntry.value.health),
        synced: 0,
        updatedAt: Date.now()
    })) as JournalEntry

    // Save to Local indexedDB first (Offline-first)
    await dexieDb.journal_entries.put(rawEntry)

    // Manual refresh of local state for immediate feedback
    // (Snapshot listener will eventually fire, but we want it NOW)
    const index = entries.value.findIndex(e => e.id === rawEntry.id)
    if (index > -1) {
       entries.value[index] = rawEntry
    } else {
       entries.value.unshift(rawEntry)
    }

    // Sync to Firestore
    await syncToFirestore(rawEntry)

    resetEntry()
  }

  const loadEntries = async () => {
      // Guard: only initialise once per session. Both JournalView and HistoryView
      // call this on mount — without the guard each navigation restarts the
      // Firestore listener, doubling cold-start latency.
      if (initialized.value) return
      initialized.value = true

      // Always load from local Dexie first for speed
      entries.value = await dexieDb.journal_entries.orderBy('date').reverse().toArray()

      // Then start/restart real-time sync if online
      if (auth.currentUser) {
          startRealtimeSync()
          restoreDraft()
      }
  }

  const resetEntry = () => {
    currentEntry.value = {
      gratitude: [''],
      wellDone: [''],
      moods: [],
      thoughts: '',
      health: { sleep: 3, food: 3, movement: 3 }
    }
    clearDraft()
  }

  const editEntry = (entry: JournalEntry) => {
    // Clear any new-entry draft before loading an existing entry
    clearDraft()
    currentEntry.value = structuredClone(toRaw(entry))
  }

  const deleteEntry = async (id: string) => {
    // Delete from Local
    await dexieDb.journal_entries.delete(id)
    entries.value = entries.value.filter(e => e.id !== id)

    // Delete from Firestore
    if (auth.currentUser) {
        try {
            const entryRef = doc(firestore, 'users', auth.currentUser.uid, 'journal_entries', id)
            await deleteDoc(entryRef)
        } catch (error) {
            console.error('Error deleting from Firestore:', error)
        }
    }
  }

  const clearSync = async () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    entries.value = []
    initialized.value = false  // reset so next login triggers a fresh load
    clearDraft()
    // Clear local cache so the next user doesn't see this user's data
    await dexieDb.journal_entries.clear()
  }

  // Auto-sync watcher: push local-only changes when coming online
  watch(online, async (isOnline) => {
    if (isOnline && auth.currentUser) {
      const pending = await dexieDb.journal_entries.where('synced').equals(0).toArray()
      for (const entry of pending) {
        await syncToFirestore(entry)
      }
      // Also ensure sync is running
      startRealtimeSync()
    }
  })

  // Draft persistence watcher — saves on every change for new entries
  watch(currentEntry, (newVal) => {
    saveDraft(toRaw(newVal))
  }, { deep: true })

  // Computed for Streak (placeholder logic)
  const streak = computed(() => 0)

  const isEditing = computed(() => !!currentEntry.value.id)

  const todayEntry = computed(() => {
    // toDateString() is faster than toLocaleDateString() and locale-independent
    const today = new Date().toDateString()
    return entries.value.find(e => new Date(e.date).toDateString() === today)
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
    deleteEntry,
    clearSync
  }
})
