<template>
  <div class="flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-300">
    <div class="text-center space-y-2">
      <div v-if="mode === 'unlock'" class="bg-aura-accent/10 p-4 rounded-full inline-flex mb-2">
        <svg class="w-8 h-8 text-aura-accent" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark">
        {{ title }}
      </h2>
      <p v-if="error" class="text-red-500 text-sm font-medium animate-pulse">{{ error }}</p>
      <p v-else class="text-aura-muted text-sm">{{ subtitle }}</p>
    </div>

    <!-- Dots Display -->
    <div class="flex gap-4 mb-4">
      <div
        v-for="i in 4"
        :key="i"
        class="w-4 h-4 rounded-full border-2 transition-all duration-200"
        :class="input.length >= i ? 'bg-aura-accent border-aura-accent scale-110' : 'border-slate-300 dark:border-slate-600'"
      ></div>
    </div>

    <!-- Keypad -->
    <div class="grid grid-cols-3 gap-6 w-full max-w-[280px]">
      <button
        v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
        :key="num"
        @click="addCheck(num)"
        class="h-16 w-16 rounded-full text-2xl font-medium text-aura-text dark:text-aura-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 flex items-center justify-center"
      >
        {{ num }}
      </button>
      <div class="opacity-0"></div> <!-- Spacer -->
      <button
        @click="addCheck('0')"
        class="h-16 w-16 rounded-full text-2xl font-medium text-aura-text dark:text-aura-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 flex items-center justify-center"
      >
        0
      </button>
      <button
        @click="del"
        class="h-16 w-16 rounded-full text-aura-text dark:text-aura-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 flex items-center justify-center text-sm font-medium uppercase tracking-wider"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7v10a2 2 0 0 1-2 2h-8.2a2 2 0 0 1-1.4-.6L3 12l6.4-6.4a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2Z"/>
        </svg>
      </button>
    </div>

    <!-- Actions (Forgot PIN) -->
    <div v-if="mode === 'unlock'" class="pt-4">
      <button @click="$emit('forgot')" class="text-sm font-semibold text-aura-accent hover:underline">
        {{ $t('forgot_pin') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  mode: 'set' | 'confirm' | 'unlock'
  error?: string
}>()

const emit = defineEmits(['submit', 'forgot'])
const { t } = useI18n()

const input = ref('')

const title = computed(() => {
  if (props.mode === 'set') return t('set_pin')
  if (props.mode === 'confirm') return t('confirm_pin')
  return t('enter_pin') // unlock
})

const subtitle = computed(() => {
  if (props.mode === 'set') return t('create_pin_desc')
  if (props.mode === 'confirm') return t('confirm_pin_desc')
  return t('unlock_desc')
})

const addCheck = (num: string) => {
  if (input.value.length < 4) {
    input.value += num
    if (input.value.length === 4) {
      // Small delay for UX
      setTimeout(() => {
        emit('submit', input.value)
        // Auto clear if not permanent success (handled by parent logic usually resetting or changing mode)
        // But we clear effectively by parent clearing us or changing mode.
        // If error, parent passes error prop.
        if (props.mode === 'unlock') {
           // keep for a sec
           setTimeout(() => { if (props.error) input.value = '' }, 500)
        } else {
            input.value = ''
        }
      }, 100)
    }
  }
}

const del = () => {
  input.value = input.value.slice(0, -1)
}
</script>
