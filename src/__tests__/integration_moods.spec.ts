import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useJournalStore } from '@/stores/journal'
import { AFFECTS } from '@/constants/affects'
import { mount } from '@vue/test-utils'
import MoodAccordion from '@/components/journal/MoodAccordion.vue'
import MoodDetailModal from '@/components/journal/MoodDetailModal.vue'

// Mock i18n
const replaceI18n = {
  global: {
    t: (key: string) => key
  }
}

describe('Affect Theory Implementation', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('AFFECTS constant has correct structure', () => {
        expect(AFFECTS).toHaveLength(9)
        const interest = AFFECTS.find(a => a.id === 'interest_excitement')
        expect(interest).toBeDefined()
        expect(interest?.related).toContain('curiosity')
    })

    it('MoodDetailModal emits close event', async () => {
        const wrapper = mount(MoodDetailModal, {
            props: {
                show: true,
                affectId: 'interest_excitement'
            },
            global: {
                mocks: {
                    $t: (msg: string) => msg
                }
            }
        })

        await wrapper.find('button.w-full').trigger('click')
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('MoodAccordion renders 9 basic affects', () => {
        const wrapper = mount(MoodAccordion, {
            global: {
                mocks: {
                    $t: (msg: string) => msg
                }
            }
        })
        const buttons = wrapper.findAll('button.rounded-full.border-2')
        expect(buttons).toHaveLength(9)
    })
})
