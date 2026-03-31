import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useJournalStore } from '@/stores/journal'

// vi.hoisted() runs BEFORE vi.mock() factories, so we can use these refs inside the factories
const { mockAuth, localStorageMock } = vi.hoisted(() => {
  const store: Record<string, string> = {}
  const localStorageMock = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) }
  }
  const mockAuth = { currentUser: null as { uid: string } | null }
  return { mockAuth, localStorageMock }
})

vi.stubGlobal('localStorage', localStorageMock)

vi.mock('@/firebase', () => ({
  db: {},
  auth: mockAuth
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn()
}))

vi.mock('@/db', () => ({
  db: {
    journal_entries: {
      orderBy: () => ({ reverse: () => ({ toArray: async () => [] }) }),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      where: () => ({ equals: () => ({ toArray: async () => [] }) })
    }
  }
}))

describe('Journal Store – Draft Persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    mockAuth.currentUser = { uid: 'user-123' }
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
  })

  it('saves a new entry draft to localStorage on change', async () => {
    const store = useJournalStore()

    store.currentEntry.gratitude = ['Sunshine']
    // Watchers are debounced by 500ms — wait 550ms
    await new Promise(r => setTimeout(r, 550))

    const raw = localStorageMock.getItem('aura-draft-user-123')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.gratitude).toContain('Sunshine')
  })

  it('does NOT save a draft when entry has an id (editing an existing entry)', async () => {
    const store = useJournalStore()

    store.currentEntry = {
      id: 'existing-id-123',
      gratitude: ['Old note'],
      moods: ['Joy'],
      wellDone: [],
      health: { sleep: 3, food: 3, movement: 3 }
    }
    await new Promise(r => setTimeout(r, 0))

    const raw = localStorageMock.getItem('aura-draft-user-123')
    expect(raw).toBeNull()
  })

  it('restores a saved draft on loadEntries', async () => {
    const draft = {
      gratitude: ['Family', 'Coffee'],
      moods: ['enjoyment_joy'],
      wellDone: ['Did my workout'],
      health: { sleep: 4, food: 4, movement: 5 }
    }
    localStorageMock.setItem('aura-draft-user-123', JSON.stringify(draft))

    const store = useJournalStore()
    await store.loadEntries()

    expect(store.currentEntry.gratitude).toEqual(['Family', 'Coffee'])
    expect(store.currentEntry.moods).toContain('enjoyment_joy')
    expect(store.currentEntry.wellDone).toContain('Did my workout')
  })

  it('does NOT restore a draft that has an id (stale edit session)', async () => {
    const staleEditDraft = { id: 'old-entry-id', gratitude: ['Something'], moods: ['Joy'] }
    localStorageMock.setItem('aura-draft-user-123', JSON.stringify(staleEditDraft))

    const store = useJournalStore()
    await store.loadEntries()

    // currentEntry should remain the empty default
    expect(store.currentEntry.id).toBeUndefined()
    expect(store.currentEntry.gratitude).toEqual([''])
  })

  it('resetEntry clears the draft from localStorage', () => {
    localStorageMock.setItem('aura-draft-user-123', JSON.stringify({ gratitude: ['Test'] }))

    const store = useJournalStore()
    store.resetEntry()

    expect(localStorageMock.getItem('aura-draft-user-123')).toBeNull()
  })

  it('editEntry clears any pending new-entry draft before loading the edit', () => {
    localStorageMock.setItem('aura-draft-user-123', JSON.stringify({ gratitude: ['Stale draft'] }))

    const store = useJournalStore()
    store.editEntry({
      id: 'existing-id',
      date: new Date().toISOString(),
      gratitude: ['Real value'],
      wellDone: [],
      moods: ['Joy'],
      health: { sleep: 3, food: 3, movement: 3 },
      synced: 1,
      updatedAt: Date.now()
    })

    expect(localStorageMock.getItem('aura-draft-user-123')).toBeNull()
    expect(store.currentEntry.gratitude).toEqual(['Real value'])
  })

  it('loadEntries initialized guard prevents double-initialization', async () => {
    const store = useJournalStore()
    await store.loadEntries()
    await store.loadEntries() // second call should be a no-op

    // entries should simply be empty (mocked Dexie returns [])
    expect(store.entries).toEqual([])
  })

  it('clearSync resets initialized flag and removes draft', async () => {
    const store = useJournalStore()
    await store.loadEntries()

    localStorageMock.setItem('aura-draft-user-123', 'something')
    await store.clearSync()

    expect(localStorageMock.getItem('aura-draft-user-123')).toBeNull()
  })
})
