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
      gratitude_examples: ['Example 1', 'Example 2', 'Example 3', 'Example 4', 'Example 5', 'Example 6', 'Example 7', 'Example 8', 'Example 9', 'Example 10', 'Example 11']
    }
  }
})

describe('GratitudeInput.vue Inspiration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows inspiration list when lightbulb is clicked', async () => {
    const wrapper = mount(GratitudeInput, {
      global: {
        plugins: [i18n]
      }
    })

    const bulb = wrapper.find('button[title]') // Title is "Need inspiration?" translated
    expect(bulb.exists()).toBe(true)

    expect(wrapper.text()).not.toContain('Example 1')

    await bulb.trigger('click')

    // Check if some examples are rendered
    const buttons = wrapper.findAll('.flex-wrap button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('fills input when example is clicked', async () => {
    const wrapper = mount(GratitudeInput, {
      global: {
        plugins: [i18n]
      }
    })
    const store = useJournalStore()

    const bulb = wrapper.find('button')
    await bulb.trigger('click')

    const firstExample = wrapper.find('.flex-wrap button')
    const exampleText = firstExample.text()

    await firstExample.trigger('click')

    expect(store.currentEntry.gratitude![0]).toBe(exampleText)
    // List should close after selection
    expect(wrapper.find('.flex-wrap').exists()).toBe(false)
  })
})
