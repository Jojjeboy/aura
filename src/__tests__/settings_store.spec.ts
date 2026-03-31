import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

// Must use vi.hoisted() so these are available inside the vi.mock() factories (which are hoisted)
const { mockAuth, setDocMock, getDocMock, snapshotCb } = vi.hoisted(() => {
  const mockAuth = { currentUser: { uid: 'test-uid' } as { uid: string } | null }
  const setDocMock = vi.fn()
  const getDocMock = vi.fn().mockResolvedValue({ exists: () => false })
  const snapshotCb = { fn: null as ((snap: object) => void) | null }
  return { mockAuth, setDocMock, getDocMock, snapshotCb }
})

vi.mock('@/firebase', () => ({
  db: {},
  auth: mockAuth
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  onSnapshot: vi.fn((_ref: unknown, cb: (snap: object) => void) => {
    snapshotCb.fn = cb
    return vi.fn()
  }),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP')
}))

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ({ value: false })),
  useToggle: vi.fn(() => vi.fn())
}))

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    locale: { value: 'en' }
  }))
}))

describe('Settings Store – Firestore Write Loop Prevention', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockClear()
    snapshotCb.fn = null
  })

  it('does NOT write to Firestore when an incoming snapshot triggers processSettingsData', async () => {
    const store = useSettingsStore()
    await store.loadSettings()

    // Wait for any watcher microtasks from loadSettings to settle
    await new Promise(r => setTimeout(r, 50))

    // Capture the write count at the moment just before the snapshot arrives
    const writesBeforeSnapshot = setDocMock.mock.calls.length

    // Simulate a Firestore snapshot arriving (e.g. from another device)
    snapshotCb.fn?.({
      exists: () => true,
      data: () => ({
        isDark: false,
        locale: 'en',
        pinHash: null,
        showQuotesAfterLogging: false,
        customMoods: [],
        gratitudeSuggestions: ['Sunshine', 'Family']
      })
    })

    // Wait for watchers to flush
    await new Promise(r => setTimeout(r, 50))

    const writesAfterSnapshot = setDocMock.mock.calls.length

    // Key assertion: the snapshot must NOT have triggered any new write (loop prevention)
    expect(writesAfterSnapshot).toBe(writesBeforeSnapshot)
  })

  it('DOES write to Firestore when the user explicitly changes a setting', async () => {
    const store = useSettingsStore()
    await store.loadSettings()

    const writesAfterLoad = setDocMock.mock.calls.length

    await store.addGratitudeSuggestion('Rainbows')

    expect(setDocMock.mock.calls.length).toBeGreaterThan(writesAfterLoad)
  })

  it('saveSettings uses { merge: true } to avoid overwriting other fields', async () => {
    const store = useSettingsStore()
    await store.saveSettings()

    const lastCallOptions = setDocMock.mock.calls.slice(-1)[0]?.[2]
    expect(lastCallOptions).toEqual({ merge: true })
  })
})

describe('Settings Store – Gratitude Suggestions CRUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockClear()
  })

  it('adds a unique suggestion', async () => {
    const store = useSettingsStore()
    await store.addGratitudeSuggestion('Ocean')
    expect(store.gratitudeSuggestions).toContain('Ocean')
  })

  it('ignores duplicate suggestions', async () => {
    const store = useSettingsStore()
    await store.addGratitudeSuggestion('Ocean')
    await store.addGratitudeSuggestion('Ocean')
    const count = store.gratitudeSuggestions.filter(s => s === 'Ocean').length
    expect(count).toBe(1)
  })

  it('removes an existing suggestion', async () => {
    const store = useSettingsStore()
    await store.addGratitudeSuggestion('Mountains')
    await store.removeGratitudeSuggestion('Mountains')
    expect(store.gratitudeSuggestions).not.toContain('Mountains')
  })

  it('updates a suggestion in place', async () => {
    const store = useSettingsStore()
    await store.addGratitudeSuggestion('Old Value')
    await store.updateGratitudeSuggestion('Old Value', 'New Value')
    expect(store.gratitudeSuggestions).not.toContain('Old Value')
    expect(store.gratitudeSuggestions).toContain('New Value')
  })
})
