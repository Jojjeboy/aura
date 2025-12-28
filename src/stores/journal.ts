import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type JournalEntry, type Note } from '@/db'
import { v4 as uuidv4 } from 'uuid'
import { useOnline } from '@vueuse/core'
// We will implement Firestore sync later, for now just setting up the store structure

export const useJournalStore = defineStore('journal', () => {
  const online = useOnline()
  const currentEntry = ref<Partial<JournalEntry>>({
    gratitude: ['', '', ''],
    moods: [],
    health: { sleep: 3, food: 3, movement: 3 }
  })

  const notes = ref<Note[]>([])
  const entries = ref<JournalEntry[]>([])
  const loading = ref(false)

  // Actions
  const saveEntry = async () => {
    if (!currentEntry.value.moods?.length) return // Basic validation

    // Clone deeply to avoid DataCloneError with Vue Proxies
    const rawEntry = JSON.parse(JSON.stringify({
        id: currentEntry.value.id || uuidv4(),
        date: currentEntry.value.date || new Date().toISOString(),
        gratitude: currentEntry.value.gratitude,
        moods: currentEntry.value.moods,
        health: currentEntry.value.health,
        synced: false,
        updatedAt: Date.now()
    }))

    // Save to IndexedDB (Upsert)
    await db.journal_entries.put(rawEntry)

    // Optimistic UI update
    const index = entries.value.findIndex(e => e.id === rawEntry.id)
    if (index > -1) {
       entries.value[index] = rawEntry
    } else {
       entries.value.unshift(rawEntry)
    }

    // Reset current entry
    resetEntry()

    // Trigger Sync if online (placeholder)
    if (online.value) {
        // syncToFirestore(rawEntry)
    }
  }

  const loadEntries = async () => {
      loading.value = true
      // Load from Dexie sorted by date desc
      entries.value = await db.journal_entries.orderBy('date').reverse().toArray()
      loading.value = false
  }

  const saveNote = async (title: string, content: string) => {
    const note: Note = {
      id: uuidv4(),
      title,
      content,
      date: new Date().toISOString(),
      synced: false,
      updatedAt: Date.now()
    }
    await db.notes.add(note)
    notes.value.unshift(note)
  }

  const updateNote = async (id: string, title: string, content: string) => {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      note.title = title
      note.content = content
      note.updatedAt = Date.now()
      note.synced = false

      await db.notes.update(id, {
        title,
        content,
        updatedAt: note.updatedAt,
        synced: false
      })
    }
  }

  const deleteNote = async (id: string) => {
    await db.notes.delete(id)
    notes.value = notes.value.filter(n => n.id !== id)
  }

  const loadNotes = async () => {
    loading.value = true
    try {
      notes.value = (await db.notes.orderBy('date').reverse().toArray()) as Note[]
    } finally {
      loading.value = false
    }
  }

  const resetEntry = () => {
    currentEntry.value = {
      gratitude: ['', '', ''],
      moods: [],
      health: { sleep: 3, food: 3, movement: 3 }
    }
  }

  const editEntry = (entry: JournalEntry) => {
    currentEntry.value = structuredClone(entry)
  }

  // Computed for Streak (placeholder logic)
  const streak = computed(() => {
    // efficient streak calc logic would go here
    return 0
  })

  // Check if there is an entry for today
  const isEditing = computed(() => !!currentEntry.value.id)

  const todayEntry = computed(() => {
    const today = new Date().toLocaleDateString()
    return entries.value.find(e => new Date(e.date).toLocaleDateString() === today)
  })

  return {
    currentEntry,
    entries,
    notes,
    loading,
    saveEntry,
    loadEntries,
    saveNote,
    updateNote,
    deleteNote,
    loadNotes,
    streak,
    todayEntry,
    isEditing,
    resetEntry,
    editEntry
  }
})
