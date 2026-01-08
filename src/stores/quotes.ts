import { defineStore } from 'pinia'
import { ref } from 'vue'
import quotesData from '@/assets/qoutes.json'

export interface Quote {
  id: number
  quote: string
  author: string
}

export const useQuotesStore = defineStore('quotes', () => {
  const showModal = ref(false)
  const currentQuote = ref<Quote | null>(null)

  const getRandomQuote = () => {
    const quotes = quotesData.quotes as Quote[]
    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex] || null
  }

  const showRandomQuote = () => {
    currentQuote.value = getRandomQuote()
    showModal.value = true
  }

  const nextQuote = () => {
    currentQuote.value = getRandomQuote()
  }

  const closeQuotes = () => {
    showModal.value = false
  }

  return {
    showModal,
    currentQuote,
    showRandomQuote,
    nextQuote,
    closeQuotes
  }
})
