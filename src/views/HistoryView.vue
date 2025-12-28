<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark p-6 pb-24 transition-colors duration-300">
    <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-6">{{ $t('nav_history') }}</h1>

    <!-- Lock State -->
    <div v-if="settingsStore.pinHash && !authStore.isHistoryUnlocked" class="flex flex-col items-center justify-center py-10">
      <PinPad
        mode="unlock"
        :error="error"
        @submit="handleUnlock"
        @forgot="handleForgot"
      />
    </div>

    <div v-else>
      <!-- Tab Switcher -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'log'"
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all"
          :class="activeTab === 'log'
            ? 'bg-aura-accent text-white shadow-md'
            : 'bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          {{ $t('log_tab') }}
        </button>
        <button
          @click="activeTab = 'calendar'"
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all"
          :class="activeTab === 'calendar'
            ? 'bg-aura-accent text-white shadow-md'
            : 'bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          {{ $t('calendar_tab') }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-10 text-aura-muted">{{ $t('loading') }}</div>

      <!-- Log Tab -->
      <div v-else-if="activeTab === 'log'" class="space-y-4">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-5 border border-transparent hover:border-aura-accent/20 transition-all duration-300"
        >
          <!-- Header: Date and Moods -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col">
              <span class="text-[0.65rem] uppercase tracking-wider text-aura-muted font-bold mb-0.5">
                {{ new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long' }) }}
              </span>
              <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark">
                {{ new Date(entry.date).toLocaleDateString() }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1 justify-end max-w-[50%]">
              <span
                v-for="(mood, idx) in entry.moods"
                :key="idx"
                class="px-2.5 py-1 text-[0.65rem] font-bold rounded-full whitespace-nowrap"
                :class="idx === 0 ? 'bg-aura-accent text-white' : 'bg-aura-accent/10 text-aura-accent'"
              >
                {{ $t(`emotions.${mood}`) }}
              </span>
            </div>
          </div>

          <!-- Content: Gratitude & Health -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-slate-800/30">
            <!-- Gratitude Section -->
            <div class="space-y-1.5">
              <h4 class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1 flex items-center gap-1">
                <span>✨</span>
                <span>{{ $t('grateful_prompt') }}</span>
              </h4>
              <div class="space-y-1">
                <p v-for="(g, i) in entry.gratitude.filter(item => item.trim() !== '')" :key="i" class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed break-words">
                  <span class="text-aura-accent opacity-50">•</span> {{ g }}
                </p>
              </div>
            </div>

            <!-- Health Metrics Section -->
            <div class="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 space-y-3">
              <h4 class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1">{{ $t('scales.health') || 'Daily Metrics' }}</h4>

              <div class="flex items-center justify-between group">
                <div class="flex items-center gap-2">
                  <span class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300">🌙</span>
                  <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{ $t('scales.sleep') }}</span>
                </div>
                <div class="flex gap-0.5">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-1.5 h-1.5 rounded-full"
                    :class="i <= (entry.health?.sleep || 0) ? 'bg-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.5)]' : 'bg-slate-200 dark:bg-slate-700'"
                  ></div>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <div class="flex items-center gap-2">
                  <span class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300">🍏</span>
                  <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{ $t('scales.food') }}</span>
                </div>
                <div class="flex gap-0.5">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-1.5 h-1.5 rounded-full"
                    :class="i <= (entry.health?.food || 0) ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'bg-slate-200 dark:bg-slate-700'"
                  ></div>
                </div>
              </div>

              <div class="flex items-center justify-between group">
                <div class="flex items-center gap-2">
                  <span class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300">🏃</span>
                  <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{ $t('scales.movement') }}</span>
                </div>
                <div class="flex gap-0.5">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="w-1.5 h-1.5 rounded-full"
                    :class="i <= (entry.health?.movement || 0) ? 'bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.5)]' : 'bg-slate-200 dark:bg-slate-700'"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end mt-4 gap-1">
            <button
              @click="handleDelete(entry)"
              class="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/5 rounded-full transition-all"
              :title="$t('delete_entry')"
            >
              <span>🗑</span>
            </button>
            <button
              @click="handleEdit(entry)"
              class="w-8 h-8 flex items-center justify-center text-aura-accent hover:bg-aura-accent/5 rounded-full transition-all"
              :title="$t('edit_entry')"
            >
              <span>✎</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Tab -->
      <div v-else-if="activeTab === 'calendar'">
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-4 bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-4">
          <button
            @click="prevMonth"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            :title="$t('prev_month')"
          >
            <svg class="w-5 h-5 text-aura-text dark:text-aura-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
            {{ currentMonthName }}
          </h2>
          <button
            @click="nextMonth"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            :title="$t('next_month')"
          >
            <svg class="w-5 h-5 text-aura-text dark:text-aura-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-4">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" class="text-center text-xs font-bold text-aura-muted">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="(dayObj, index) in calendarDays"
              :key="index"
              @click="handleDateClick(dayObj)"
              :disabled="dayObj.isFuture || !dayObj.day"
              class="aspect-square flex items-center justify-center rounded-lg relative transition-all"
              :class="[
                dayObj.day
                  ? dayObj.isFuture
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 text-aura-muted/40 cursor-not-allowed'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-aura-text dark:text-aura-text-dark hover:bg-aura-accent/10 dark:hover:bg-aura-accent/20 cursor-pointer'
                  : 'cursor-default',
              ]"
            >
              <span v-if="dayObj.day" class="text-sm font-medium z-10">{{ dayObj.day }}</span>
              <div
                v-if="dayObj.hasEntry"
                class="absolute inset-0 rounded-lg border-2 border-aura-accent pointer-events-none"
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Entry Modal -->
    <div
      v-if="selectedDate"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      @click.self="selectedDate = null"
    >
      <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
            {{ selectedDate.toLocaleDateString() }}
          </h3>
          <button
            @click="selectedDate = null"
            class="text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- If entry exists -->
        <div v-if="selectedEntry">
          <div class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('mood_prompt') }}</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(mood, idx) in selectedEntry.moods"
                :key="idx"
                class="px-2 py-0.5 text-xs rounded-full"
                :class="idx === 0 ? 'bg-aura-accent/10 text-aura-accent' : 'bg-aura-accent/5 text-aura-accent/70'"
              >
                {{ $t(`emotions.${mood}`) }}
              </span>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('grateful_prompt') }}</h4>
            <div class="space-y-1">
              <p v-for="(g, i) in selectedEntry.gratitude" :key="i" class="text-sm text-aura-text dark:text-aura-text-dark">
                • {{ g }}
              </p>
            </div>
          </div>
          <button
            @click="handleEditFromModal(selectedEntry)"
            class="w-full py-2.5 px-4 bg-aura-accent text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {{ $t('edit_entry') }}
          </button>
        </div>

        <!-- If no entry exists -->
        <div v-else class="text-center py-6">
          <p class="text-aura-muted mb-4">{{ $t('no_entry_for_date') }}</p>
          <button
            @click="handleCreateEntry()"
            class="w-full py-2.5 px-4 bg-aura-accent text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {{ $t('add_entry') }}
          </button>
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
import { useI18n } from 'vue-i18n'

const store = useJournalStore()
const router = useRouter()
const { entries, loading } = storeToRefs(store)
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()

const error = ref('')
const activeTab = ref<'log' | 'calendar'>('log')
const selectedDate = ref<Date | null>(null)
const selectedEntry = ref<JournalEntry | null>(null)

// Calendar Logic
const currentDate = ref(new Date())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('default', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = []

  // Fill in empty days before the first day of the month
  const startDay = firstDay.getDay()
  // Adjust key to start week on Monday (0 = Sunday in JS, but 1 = Monday is standard here)
  // Standard JS: 0=Sun, 1=Mon... 6=Sat
  // We want to shift so Mon is first.
  // If Sun(0), padding is 6. If Mon(1), padding is 0.
  const padding = startDay === 0 ? 6 : startDay - 1

  for (let i = 0; i < padding; i++) {
    days.push({ day: null, date: null, hasEntry: false, isFuture: false })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toDateString()
    const hasEntry = entries.value.some(e => new Date(e.date).toDateString() === dateStr)
    const isFuture = date > today
    days.push({ day: i, date, hasEntry, isFuture })
  }

  return days
})

const handleDateClick = (dayObj: { day: number | null; date: Date | null; hasEntry: boolean; isFuture: boolean }) => {
  if (!dayObj.day || dayObj.isFuture || !dayObj.date) return

  selectedDate.value = dayObj.date
  const dateStr = dayObj.date.toDateString()
  selectedEntry.value = entries.value.find(e => new Date(e.date).toDateString() === dateStr) || null
}

const handleEditFromModal = (entry: JournalEntry) => {
  selectedDate.value = null
  selectedEntry.value = null
  handleEdit(entry)
}

const handleCreateEntry = () => {
  if (selectedDate.value) {
    const dateStr = selectedDate.value.toISOString()
    selectedDate.value = null
    selectedEntry.value = null
    // Navigate to journal view to create entry for that date
    router.push({ path: '/', query: { date: dateStr } })
  } else {
    router.push('/')
  }
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleUnlock = async (pin: string) => {
  const isValid = await settingsStore.verifyPin(pin)
  if (isValid) {
    authStore.isHistoryUnlocked = true
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
       authStore.isHistoryUnlocked = true
    } else {
       toastError('Authentication failed.')
    }
  }
}

const handleEdit = (entry: JournalEntry) => {
  store.editEntry(entry)
  router.push('/')
}

const handleDelete = async (entry: JournalEntry) => {
  if (!entry.id) return
  if (confirm(t('delete_confirm'))) {
    await store.deleteEntry(entry.id)
    success(t('entry_deleted'))
  }
}

onMounted(() => {
    store.loadEntries()
})
</script>
