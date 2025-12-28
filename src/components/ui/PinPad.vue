<template>
  <div class="flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in-95 duration-300">
    <div class="text-center space-y-2">
      <div v-if="mode === 'unlock'" class="bg-aura-accent/10 p-4 rounded-full inline-flex mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-aura-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
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
