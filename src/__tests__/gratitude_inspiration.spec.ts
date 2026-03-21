import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GratitudeInput from '@/components/journal/GratitudeInput.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useJournalStore } from '@/stores/journal'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      grateful_placeholder: 'I am grateful for...',
      reveal_more: 'Reveal more',
      gratitude_inspiration_title: 'Need inspiration?'
    }
  }
})

describe('GratitudeInput.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a new empty field when the last field is populated', async () => {
    const wrapper = mount(GratitudeInput, {
      global: {
        plugins: [i18n]
      }
    })
    const store = useJournalStore()
    store.currentEntry.gratitude = ['']

    let inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(1)

    // Simulate typing in the first input
    store.currentEntry.gratitude[0] = 'Family'
    
    // The watcher should push an empty string
    await wrapper.vm.$nextTick()
    
    inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(2)
    expect(store.currentEntry.gratitude.length).toBe(2)
    expect(store.currentEntry.gratitude[1]).toBe('')
  })

  it('shows inspiration modal when click on button', async () => {
    const wrapper = mount(GratitudeInput, {
      global: {
        plugins: [i18n]
      }
    })

    const bulb = wrapper.find('[data-test="inspiration-btn"]')
    expect(bulb.exists()).toBe(true)

    expect(wrapper.find('.fixed').exists()).toBe(false)

    await bulb.trigger('click')

    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('fills input when example is selected and added', async () => {
    const wrapper = mount(GratitudeInput, {
      global: {
        plugins: [i18n]
      }
    })
    const store = useJournalStore()
    store.currentEntry.gratitude = ['']

    // Open Modal
    await wrapper.find('[data-test="inspiration-btn"]').trigger('click')

    // Find the first option
    const options = wrapper.findAll('.fixed button')
    // Find buttons that are likely gratitude options (not action buttons)
    const gratitudeOptions = options.filter(b => 
      !b.text().includes('Add') && 
      !b.text().includes('Cancel') && 
      !b.text().includes('Show others') &&
      !b.text().includes('quote_new_quote') &&
      !b.text().includes('Slumpa')
    )
    
    expect(gratitudeOptions.length).toBeGreaterThan(0)
    const firstOption = gratitudeOptions[0]
    const exampleText = firstOption.text()

    // Select it
    await firstOption.trigger('click')

    // Find the add button
    const addBtn = wrapper.findAll('.fixed button').find(b => 
      b.text().includes('Add') || 
      b.text().includes('journal_add_item') ||
      b.text().includes('Lägg till')
    )
    
    expect(addBtn).toBeDefined()
    await addBtn!.trigger('click')
    
    expect(store.currentEntry.gratitude[0]).toBe(exampleText)
    // Watcher in component will have added another empty string
    expect(store.currentEntry.gratitude.length).toBe(2)
    expect(store.currentEntry.gratitude[1]).toBe('')
  })
})
