import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HistoryView from '@/views/HistoryView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useJournalStore } from '@/stores/journal'

// Mock useRouter
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    currentRoute: { value: { query: {} } }
  }))
}))

// Mock useBiometricLock
vi.mock('@/composables/useBiometricLock', () => ({
  useBiometricLock: vi.fn(() => ({
    authenticate: vi.fn().mockResolvedValue(true)
  }))
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      nav_history: 'Logged Earlier',
      log_tab: 'Log',
      calendar_tab: 'Calendar',
      edit_entry: 'Edit Entry',
      add_entry: 'Add Entry',
      no_entry_for_date: 'No entry',
      page_titles: { loading: 'loading' },
      emotions: { Joy: 'Joy' }
    }
  }
})

describe('HistoryView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useJournalStore()
    // Mock loadEntries to resolve immediately
    store.loadEntries = vi.fn().mockResolvedValue([])
    store.loading = false
    store.entries = []
  })

  it('renders tabs', async () => {
    const wrapper = mount(HistoryView, {
      global: {
        plugins: [i18n],
        stubs: ['PinPad']
      }
    })

    await flushPromises()

    // Check if tabs are present
    const tabs = wrapper.findAll('button')
    const logTab = tabs.find(t => t.text().toLowerCase().includes('log'))
    const calendarTab = tabs.find(t => t.text().toLowerCase().includes('calendar'))

    expect(logTab).toBeDefined()
    expect(calendarTab).toBeDefined()
  })

  it('switches to calendar tab', async () => {
    const wrapper = mount(HistoryView, {
      global: {
        plugins: [i18n],
        stubs: ['PinPad']
      }
    })

    await flushPromises()

    const tabs = wrapper.findAll('button')
    const calendarTab = tabs.find(t => t.text().toLowerCase().includes('calendar'))

    await calendarTab?.trigger('click')

    // Check if calendar navigation is visible (check for current month name)
    const monthName = new Date().toLocaleString('default', { month: 'long' })
    expect(wrapper.text().toLowerCase()).toContain(monthName.toLowerCase())
  })
})
