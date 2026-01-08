<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark pb-24 transition-colors duration-300">
    <section class="px-6 py-4 transition-colors duration-300">
      <h1
        class="text-2xl font-bold text-aura-text dark:text-aura-text-dark transition-colors duration-300"
      >
        {{ dynamicGreeting }}, {{ firstName }}
      </h1>
      <p
        v-if="!hasLoggedToday || isUnlocked || store.isEditing"
        class="text-aura-muted text-sm transition-colors duration-300"
      >
        {{ $t('greeting_sub_with_day', { day: currentEntryWeekday }) }}
      </p>
    </section>

    <!-- PIN Unlock State -->
    <div
      v-if="hasLoggedToday && isEnteringPin && !isUnlocked && !store.isEditing && isTargetingToday"
      class="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500"
    >
      <PinPad mode="unlock" :error="pinError" @submit="handleUnlock" @forgot="handleForgot" />
    </div>

    <!-- Already Logged State (Not Entering PIN and Not Unlocked) -->
    <div
      v-else-if="hasLoggedToday && !isUnlocked && !store.isEditing && isTargetingToday"
      class="flex flex-col items-center justify-center py-5 animate-in fade-in duration-500"
    >
      <div class="bg-aura-accent/10 p-6 rounded-full mb-6">
        <svg
          class="w-10 h-10 text-aura-accent"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 2v4m0 12v4M2 12h4m12 0h4M4.2 4.2l2.9 2.9m9.8 9.8 2.9 2.9M4.2 19.8l2.9-2.9m9.8-9.8 2.9-2.9"
          />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-2 text-center">
        {{ $t('caught_up') }}
      </h2>
      <p class="text-aura-muted text-center max-w-sm mb-8 px-6">
        {{ $t('caught_up_sub') }}
      </p>
      <button
        @click="initiateUnlock"
        class="bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark px-8 py-3 rounded-[2rem] font-semibold shadow-soft hover:shadow-glow transition-all flex items-center gap-2"
      >
        <svg
          class="w-5 h-5 text-aura-accent"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
          />
        </svg>
        <span>{{ $t('view_edit_entry') }}</span>
      </button>
    </div>

    <main v-else class="px-6 space-y-8 mt-4 animate-in slide-in-from-bottom-4 duration-500">
      <!-- Editing Info -->
      <div
        v-if="store.isEditing"
        class="bg-aura-accent/5 p-4 rounded-2xl flex justify-between items-center border border-aura-accent/10"
      >
        <div class="flex flex-col">
          <span class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-bold">{{
            $t('editing_entry')
          }}</span>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark">
              {{
                store.currentEntry.date
                  ? new Date(store.currentEntry.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                    })
                  : ''
              }},
              {{
                store.currentEntry.date
                  ? new Date(store.currentEntry.date).toLocaleDateString()
                  : ''
              }}
            </span>
            <button
              @click="showDatePicker = true"
              class="px-2 py-0.5 bg-aura-accent/10 text-aura-accent rounded text-[10px] font-black uppercase tracking-wider hover:bg-aura-accent/20 transition-colors"
            >
              {{ $t('change') || 'Change' }}
            </button>
          </div>
        </div>
        <button
          @click="store.resetEntry()"
          class="text-xs font-bold text-red-500 hover:opacity-70 transition-opacity"
        >
          {{ $t('cancel_edit') }}
        </button>
      </div>

      <!-- Gratitude Section -->
      <section>
        <JournalSectionInput
          :label="$t('greeting_sub')"
          :placeholder="$t('grateful_placeholder')"
          v-model="store.currentEntry.gratitude!"
        />
      </section>

      <!-- Well Done Section -->
      <section>
        <JournalSectionInput
          :label="$t('journal_well_done_label')"
          :placeholder="$t('grateful_placeholder')"
          :model-value="store.currentEntry.wellDone || []"
          @update:model-value="store.currentEntry.wellDone = $event"
        />
      </section>

      <!-- Improvement Section -->
      <section>
        <JournalSectionInput
          :label="$t('journal_improvement_label')"
          :placeholder="$t('grateful_placeholder')"
          :model-value="store.currentEntry.improvement || []"
          @update:model-value="store.currentEntry.improvement = $event"
        />
      </section>

      <!-- Mood & Health Section -->
      <section>
        <MoodAccordion />
      </section>

      <!-- Thoughts Section -->
      <section>
        <ThoughtsInput />
      </section>

      <!-- Action -->
      <div class="flex justify-end pt-4 pb-24">
        <button
          @click="save"
          class="bg-aura-accent text-white px-8 py-3 rounded-[2rem] font-semibold shadow-glow hover:shadow-[0_0_25px_rgba(66,184,131,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {{ store.isEditing ? $t('update_entry') : $t('save_entry') }}
        </button>
      </div>
    </main>

    <AppModal
      :show="showResetModal"
      :title="$t('change_pin')"
      :message="$t('reset_pin_confirm_msg') || 'Authenticate with Google to reset your PIN?'"
      :confirm-text="$t('authenticate') || 'Authenticate'"
      :cancel-text="$t('cancel')"
      @confirm="handleForgotConfirm"
      @cancel="showResetModal = false"
    />

    <AppDatePicker
      v-if="showDatePicker"
      :initial-date="store.currentEntry.date"
      @select="handleDateSelect"
      @close="showDatePicker = false"
    />

    <!-- Quote Modal -->
    <div
      v-if="showQuoteModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        class="bg-white dark:bg-aura-card-dark rounded-[2.5rem] shadow-glow p-8 max-w-sm w-full relative overflow-hidden animate-in zoom-in-95 duration-300"
      >
        <!-- Background Decoration -->
        <div
          class="absolute -top-12 -right-12 w-32 h-32 bg-aura-accent/5 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute -bottom-12 -left-12 w-32 h-32 bg-aura-accent/5 rounded-full blur-3xl"
        ></div>

        <div class="relative z-10 flex flex-col items-center text-center">
          <div class="bg-aura-accent/10 p-4 rounded-full mb-6">
            <svg
              class="w-8 h-8 text-aura-accent"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M11.69 10.633c0 .859-.446 1.355-1.336 1.486l-.371.057c0 1.144.372 1.326.685 1.738.312.411.758.914.758 1.486 0 .801-.65 1.458-1.45 1.458a1.43 1.43 0 0 1-1.449-1.458c0-.984.668-1.921 1.134-2.585.503-.71.503-1.053.503-1.555a1.2 1.2 0 0 0-1.205-1.2c-.663 0-1.202.544-1.202 1.213 0 .172.031.343.093.515-.156.12-.34.186-.53.186-.482 0-.873-.394-.873-.88 0-.964.815-1.748 1.815-1.748 1.057 0 1.933.86 1.933 1.887Zm6.046 0c0 .859-.447 1.355-1.336 1.486l-.372.057c0 1.144.372 1.326.685 1.738.312.411.758.914.758 1.486 0 .801-.65 1.458-1.45 1.458a1.43 1.43 0 0 1-1.448-1.458c0-.984.667-1.921 1.133-2.585.503-.71.503-1.053.503-1.555a1.2 1.2 0 0 0-1.204-1.2c-.664 0-1.203.544-1.203 1.213 0 .172.03.343.092.515-.156.12-.34.186-.53.186-.481 0-.872-.394-.872-.88 0-.964.814-1.748 1.814-1.748 1.058 0 1.934.86 1.934 1.887Z"
              />
            </svg>
          </div>

          <h4 class="text-aura-muted text-[0.6rem] uppercase tracking-[0.2em] font-black mb-4">
            {{ $t('quote_modal_title') }}
          </h4>

          <div class="mb-8">
            <p
              class="text-xl font-bold text-aura-text dark:text-aura-text-dark leading-relaxed mb-4 italic"
            >
              "{{ currentQuote?.quote }}"
            </p>
            <p class="text-aura-accent font-bold text-sm">— {{ currentQuote?.author }}</p>
          </div>

          <div class="flex flex-col w-full gap-3">
            <button
              @click="handleDismissQuote"
              class="w-full bg-aura-accent text-white py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              {{ $t('quote_dismiss') }}
            </button>
            <button
              @click="handleNewQuote"
              class="w-full bg-slate-100 dark:bg-slate-800 text-aura-muted py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {{ $t('quote_new_quote') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import JournalSectionInput from '@/components/journal/JournalSectionInput.vue'
import MoodAccordion from '@/components/journal/MoodAccordion.vue'
import ThoughtsInput from '@/components/journal/ThoughtsInput.vue'
import { useJournalStore } from '@/stores/journal'
import type { JournalEntry } from '@/db'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, toRaw } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import PinPad from '@/components/ui/PinPad.vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import AppModal from '@/components/ui/AppModal.vue'
import AppDatePicker from '@/components/ui/AppDatePicker.vue'
import quotesData from '@/assets/qoutes.json'

const settingsStore = useSettingsStore()
const store = useJournalStore()
const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()
const { error: toastError, success } = useToast()

const isUnlocked = ref(false)
const isEnteringPin = ref(false)
const pinError = ref('')
const showResetModal = ref(false)
const showDatePicker = ref(false)

const showQuoteModal = ref(false)
const currentQuote = ref<{ id: number; quote: string; author: string } | null>(null)

onMounted(async () => {
  // Reload entries to be sure we have the latest
  await store.loadEntries()

  // Check for date in query parameter (for past date logging from calendar)
  const queryDate = router.currentRoute.value.query.date as string
  if (queryDate && !store.isEditing) {
    const targetDate = new Date(queryDate)
    if (!Number.isNaN(targetDate.getTime())) {
      // Check if entry already exists for this date
      const dateStr = targetDate.toLocaleDateString()
      const existing = store.entries.find(
        (e: JournalEntry) => new Date(e.date).toLocaleDateString() === dateStr,
      )

      if (existing) {
        store.editEntry(existing)
      } else {
        store.resetEntry()
        store.currentEntry.date = targetDate.toISOString()
      }
    }
  }
})

const hasLoggedToday = computed(() => !!store.todayEntry)

const isTargetingToday = computed(() => {
  if (!store.currentEntry.date) return true
  const today = new Date().toLocaleDateString()
  return new Date(store.currentEntry.date).toLocaleDateString() === today
})

const currentEntryWeekday = computed(() => {
  if (!store.currentEntry.date) return ''
  return new Date(store.currentEntry.date).toLocaleDateString(undefined, {
    weekday: 'long',
  })
})

const firstName = computed(() => {
  return authStore.user?.displayName?.split(' ')[0] || ''
})

const dynamicGreeting = computed(() => {
  const hour = new Date().getHours()

  if (hour >= 4 && hour < 12) return t('greeting_morning') || 'Good morning'
  if (hour >= 12 && hour < 13) return t('greeting_day') || 'Good day'
  if (hour >= 13 && hour < 18) return t('greeting_afternoon') || 'Good afternoon'
  if (hour >= 18 && hour < 23) return t('greeting_evening') || 'Good evening'
  return t('greeting_night') || 'Good night'
})

// If user navigates away and back, reset lock state for security
onMounted(() => {
  isUnlocked.value = false
  isEnteringPin.value = false
})

const initiateUnlock = () => {
  if (settingsStore.pinHash) {
    isEnteringPin.value = true
  } else {
    isUnlocked.value = true
    // Load existing today entry
    if (store.todayEntry) {
      store.currentEntry = structuredClone(toRaw(store.todayEntry))
    }
  }
}

const handleUnlock = async (pin: string) => {
  const isValid = await settingsStore.verifyPin(pin)
  if (isValid) {
    isUnlocked.value = true
    pinError.value = ''
    // Load the existing entry into the editing state
    if (store.todayEntry) {
      store.currentEntry = structuredClone(toRaw(store.todayEntry))
    }
  } else {
    pinError.value = t('wrong_pin')
    setTimeout(() => (pinError.value = ''), 2000)
  }
}

const handleForgot = () => {
  showResetModal.value = true
}

const handleForgotConfirm = async () => {
  showResetModal.value = false
  const isSuccess = await authStore.reauthenticate()
  if (isSuccess) {
    await settingsStore.removePin()
    success('App Lock removed!')
    isUnlocked.value = true
  } else {
    toastError('Authentication failed.')
  }
}

const handleDateSelect = (newDate: string) => {
  store.currentEntry.date = newDate
  showDatePicker.value = false
  success(t('date_updated') || 'Date updated')
}

const handleNewQuote = () => {
  const quotes = quotesData.quotes
  const randomIndex = Math.floor(Math.random() * quotes.length)
  currentQuote.value = quotes[randomIndex] || null
}

const handleDismissQuote = () => {
  showQuoteModal.value = false
  router.push('/history')
}

const save = async () => {
  await store.saveEntry()
  success(store.isEditing ? t('entry_updated_success') : t('entry_saved_success'))

  if (settingsStore.showQuotesAfterLogging) {
    handleNewQuote()
    showQuoteModal.value = true
  } else {
    router.push('/history')
  }
}
</script>
