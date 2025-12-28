import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sv from './locales/sv.json'

// TypeScript translation type inference
export type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'sv'>({
  legacy: false, // Composition API mode
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    sv
  }
})

export default i18n
