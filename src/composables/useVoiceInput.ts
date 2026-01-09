import { ref } from 'vue'
import { useToast } from './useToast'
import { useI18n } from 'vue-i18n'

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

export function useVoiceInput() {
  const isListening = ref(false)
  const { error } = useToast()
  const { t, locale } = useI18n()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition

  const isSupported = !!SpeechRecognition

  const startListening = (onResult: (text: string) => void) => {
    if (!isSupported) {
      error(t('voice_not_supported'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = locale.value === 'sv' ? 'sv-SE' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isListening.value = true
    }

    recognition.onend = () => {
      isListening.value = false
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isListening.value = false
      console.error('Speech recognition error', event.error)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript
      if (text) {
        onResult(text)
      }
    }

    recognition.start()
  }

  return {
    isListening,
    isSupported,
    startListening
  }
}
