<template>
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-2xl p-6 max-w-md w-full overflow-hidden border border-white/20 dark:border-slate-800/50"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-black text-aura-text dark:text-aura-text-dark">
            {{ $t('select_date') || 'Select Date' }}
          </h3>
          <p class="text-xs font-bold text-aura-muted uppercase tracking-widest mt-0.5">
            {{ currentMonthName }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark bg-slate-50 dark:bg-slate-800/50 rounded-full transition-all"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Month Navigation -->
      <div
        class="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-2 border border-slate-100 dark:border-slate-800/50"
      >
        <button
          @click="prevMonth"
          class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-aura-muted shadow-sm hover:shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span
          class="text-sm font-bold text-aura-text dark:text-aura-text-dark min-w-[140px] text-center capitalize"
        >
          {{ currentMonthName }}
        </span>
        <button
          @click="nextMonth"
          :disabled="isCurrentMonth"
          class="p-2 rounded-xl transition-all text-aura-muted disabled:opacity-30 disabled:cursor-not-allowed shadow-sm enabled:hover:bg-white dark:enabled:hover:bg-slate-700 enabled:hover:shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          :key="day"
          class="text-center text-[10px] font-black text-aura-muted/60 uppercase tracking-tighter"
        >
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="(dayObj, index) in calendarDays"
          :key="index"
          @click="handleDateClick(dayObj)"
          :disabled="!dayObj.day || isDateDisabled(dayObj.date)"
          class="aspect-square flex items-center justify-center rounded-xl relative transition-all text-sm font-bold group"
          :class="[
            dayObj.day
              ? isDateDisabled(dayObj.date)
                ? 'bg-slate-50/30 dark:bg-slate-800/10 text-aura-muted/30 cursor-not-allowed'
                : isSelected(dayObj.date)
                  ? 'bg-aura-accent text-white shadow-glow scale-105 z-10'
                  : dayObj.isToday
                    ? 'bg-aura-accent/10 text-aura-accent border border-aura-accent/20'
                    : 'bg-white dark:bg-slate-800/40 text-aura-text dark:text-aura-text-dark hover:bg-aura-accent/5 dark:hover:bg-aura-accent/10 hover:scale-105 border border-transparent shadow-sm'
              : 'invisible',
          ]"
        >
          <span v-if="dayObj.day">{{ dayObj.day }}</span>

          <!-- Indicator for existing entries -->
          <div
            v-if="dayObj.hasEntry && dayObj.day && !isSelected(dayObj.date)"
            class="absolute bottom-1 w-1 h-1 rounded-full bg-aura-muted/40"
          ></div>

          <!-- Disabled tooltip-like indicator -->
          <div
            v-if="dayObj.day && isDateDisabled(dayObj.date)"
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          >
            <div class="bg-red-500/10 rounded-full p-1">
              <svg
                class="w-3 h-3 text-red-500/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <div class="mt-8 flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 py-3 px-4 bg-slate-50 dark:bg-slate-800 text-aura-text dark:text-aura-text-dark rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm shadow-sm"
        >
          {{ $t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  initialDate?: string
}>()

const emit = defineEmits<{
  (e: 'select', date: string): void
  (e: 'close'): void
}>()

const store = useJournalStore()
const { entries } = storeToRefs(store)

const currentDate = ref(new Date(props.initialDate || new Date()))
const selectedDate = ref(props.initialDate ? new Date(props.initialDate) : null)

const isCurrentMonth = computed(() => {
  const now = new Date()
  return (
    currentDate.value.getMonth() === now.getMonth() &&
    currentDate.value.getFullYear() === now.getFullYear()
  )
})

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
  const startDay = firstDay.getDay()
  const padding = startDay === 0 ? 6 : startDay - 1

  for (let i = 0; i < padding; i++) {
    days.push({ day: null, date: null, hasEntry: false, isFuture: false, isToday: false })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toDateString()
    const hasEntry = entries.value.some((e) => new Date(e.date).toDateString() === dateStr)
    const isFuture = date > today
    const isToday = date.toDateString() === today.toDateString()
    days.push({ day: i, date: new Date(date), hasEntry, isFuture, isToday })
  }

  return days
})

const isDateDisabled = (date: Date | null) => {
  if (!date) return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Future dates are disabled
  if (date > today) return true

  // Dates with entries are disabled, unless it's the current selected date (the date of the entry we are editing)
  if (props.initialDate) {
    const initialDateObj = new Date(props.initialDate)
    initialDateObj.setHours(0, 0, 0, 0)
    if (date.getTime() === initialDateObj.getTime()) return false
  }

  const dateStr = date.toDateString()
  return entries.value.some((e) => new Date(e.date).toDateString() === dateStr)
}

const isSelected = (date: Date | null) => {
  if (!date || !selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const handleDateClick = (dayObj: { date: Date | null }) => {
  if (dayObj.date && !isDateDisabled(dayObj.date)) {
    emit('select', dayObj.date.toISOString())
  }
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}
</script>
