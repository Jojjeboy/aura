import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HistoryView from '@/views/HistoryView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useJournalStore } from '@/stores/journal'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    currentRoute: { value: { query: {} } }
  }))
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      nav_history: 'History',
      log_tab: 'Log',
      calendar_tab: 'Calendar',
      stats_tab: 'Stats',
      search_placeholder: 'Search...',
      emotions: { Joy: 'Joy', Sad: 'Sad' },
      grateful_prompt: 'Grateful',
      delete_entry: 'Delete',
      edit_entry: 'Edit',
      delete_confirm: 'Are you sure?'
    }
  }
})

describe('HistoryView Search and Collapse', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useJournalStore()
    store.loadEntries = vi.fn().mockResolvedValue([])
    store.loading = false
    store.entries = [
      {
        id: '1',
        date: new Date('2025-01-01').toISOString(),
        moods: ['Joy'],
        gratitude: ['Coffee', 'Sun', 'Work'],
        health: { sleep: 5, food: 5, movement: 5 },
        synced: 1,
        updatedAt: Date.now()
      },
      {
        id: '2',
        date: new Date('2025-01-02').toISOString(),
        moods: ['Sad'],
        gratitude: ['Sleep', 'Quiet', 'Tea'],
        health: { sleep: 3, food: 3, movement: 3 },
        synced: 1,
        updatedAt: Date.now()
      }
    ]
  })

  it('filters entries based on search query', async () => {
    const wrapper = mount(HistoryView, {
      global: {
        plugins: [i18n],
        stubs: ['PinPad', 'AppModal']
      }
    })

    await flushPromises()

    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)

    // Initial count
    expect(wrapper.findAll('.overflow-hidden').length).toBe(2)

    // Search for "Coffee"
    await searchInput.setValue('Coffee')
    expect(wrapper.findAll('.overflow-hidden').length).toBe(1)
    expect(wrapper.text()).toContain('2025-01-01')
    expect(wrapper.text()).not.toContain('2025-01-02')

    // Search for "Sad" (emotion)
    await searchInput.setValue('Sad')
    expect(wrapper.findAll('.overflow-hidden').length).toBe(1)
    expect(wrapper.text()).toContain('2025-01-02')
    expect(wrapper.text()).not.toContain('2025-01-01')
  })

  it('toggles collapsible entries', async () => {
    const wrapper = mount(HistoryView, {
      global: {
        plugins: [i18n],
        stubs: ['PinPad', 'AppModal']
      }
    })

    await flushPromises()

    const firstEntryHeader = wrapper.find('.cursor-pointer')

    // Content should be hidden initially
    expect(wrapper.text()).not.toContain('✨') // Gratitude icon in expanded view

    // Click to expand
    await firstEntryHeader.trigger('click')
    expect(wrapper.text()).toContain('✨')
    expect(wrapper.text()).toContain('Coffee')

    // Click to collapse
    await firstEntryHeader.trigger('click')
    expect(wrapper.text()).not.toContain('✨')
  })
})
