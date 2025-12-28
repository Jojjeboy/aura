<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark p-6 pb-24 transition-colors duration-300">
    <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-6">{{ $t('nav_history') }}</h1>

    <!-- Lock State -->
    <div v-if="settingsStore.pinHash && !isAuthenticated" class="flex flex-col items-center justify-center py-10">
      <PinPad
        mode="unlock"
        :error="error"
        @submit="handleUnlock"
        @forgot="handleForgot"
      />
    </div>

    <div v-else>
      <div v-if="loading" class="text-center py-10 text-aura-muted">{{ $t('loading') }}</div>
      <div v-else class="space-y-4">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-5 transition-colors duration-300"
        >
          <div class="flex justify-between items-start mb-2">
              <span class="text-xs text-aura-muted font-medium">{{ new Date(entry.date).toLocaleDateString() }}</span>
              <div class="flex flex-wrap gap-1 justify-end max-w-[50%]">
                <span
                  v-for="(mood, idx) in entry.moods"
                  :key="idx"
                  class="px-2 py-0.5 text-xs rounded-full whitespace-nowrap"
                  :class="idx === 0 ? 'bg-aura-accent/10 text-aura-accent' : 'bg-aura-accent/5 text-aura-accent/70'"
                >
                  {{ $t(`emotions.${mood}`) }}
                </span>
              </div>
          </div>
          <div class="space-y-1">
              <p v-for="(g, i) in entry.gratitude" :key="i" class="text-sm text-aura-text dark:text-aura-text-dark line-clamp-1 break-words">
                  • {{ g }}
              </p>
          </div>
          <div class="flex justify-end mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
            <button
              @click="handleEdit(entry)"
              class="text-xs font-bold text-aura-accent flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <span>✎</span>
              <span>{{ $t('edit_entry') || 'Edit Entry' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import PinPad from '@/components/ui/PinPad.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { JournalEntry } from '@/db'
import { useToast } from '@/composables/useToast'

const store = useJournalStore()
const router = useRouter()
const { entries, loading } = storeToRefs(store)
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()

const isAuthenticated = ref(false)
const error = ref('')
const activeTab = ref<'log' | 'calendar'>('log')

// Calendar Logic
const currentDate = ref(new Date())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []

  // Fill in empty days before the first day of the month
  let startDay = firstDay.getDay()
  // Adjust key to start week on Monday (0 = Sunday in JS, but 1 = Monday is standard here)
  // Standard JS: 0=Sun, 1=Mon... 6=Sat
  // We want to shift so Mon is first.
  // If Sun(0), padding is 6. If Mon(1), padding is 0.
  const padding = startDay === 0 ? 6 : startDay - 1

  for (let i = 0; i < padding; i++) {
    days.push({ day: null, date: null })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = new Date(year, month, i).toDateString()
    const hasEntry = entries.value.some(e => new Date(e.date).toDateString() === dateStr)
    days.push({ day: i, date: new Date(year, month, i), hasEntry })
  }

  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleUnlock = async (pin: string) => {
  const isValid = await settingsStore.verifyPin(pin)
  if (isValid) {
    isAuthenticated.value = true
    error.value = ''
  } else {
    // Shake effect managed by error prop existing generally or we can just show text
    error.value = 'Incorrect PIN'
    setTimeout(() => error.value = '', 2000)
  }
}

const handleForgot = async () => {
  if (confirm('Authenticate with Google to reset your PIN?')) {
    const isSuccess = await authStore.reauthenticate()
    if (isSuccess) {
       // Reset PIN
       await settingsStore.removePin()
       success('App Lock removed!')
       isAuthenticated.value = true
    } else {
       toastError('Authentication failed.')
    }
  }
}

const handleEdit = (entry: JournalEntry) => {
  store.editEntry(entry)
  router.push('/')
}

onMounted(() => {
    store.loadEntries()
})
</script>
