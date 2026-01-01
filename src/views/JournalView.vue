<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark pb-24 transition-colors duration-300">
    <section class="px-6 py-4 transition-colors duration-300">
        <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark transition-colors duration-300">
          {{ dynamicGreeting }}, {{ firstName }}
        </h1>
        <p v-if="!hasLoggedToday" class="text-aura-muted text-sm transition-colors duration-300">{{ $t('greeting_sub') }}</p>
    </section>

      <!-- PIN Unlock State -->
      <div v-if="hasLoggedToday && isEnteringPin && !isUnlocked && !store.isEditing && isTargetingToday" class="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
         <PinPad
           mode="unlock"
           :error="pinError"
           @submit="handleUnlock"
           @forgot="handleForgot"
         />
      </div>

      <!-- Already Logged State (Not Entering PIN and Not Unlocked) -->
      <div v-else-if="hasLoggedToday && !isUnlocked && !store.isEditing && isTargetingToday" class="flex flex-col items-center justify-center py-5 animate-in fade-in duration-500">
         <div class="bg-aura-accent/10 p-6 rounded-full mb-6">
             <svg class="w-10 h-10 text-aura-accent" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 12v4M2 12h4m12 0h4M4.2 4.2l2.9 2.9m9.8 9.8 2.9 2.9M4.2 19.8l2.9-2.9m9.8-9.8 2.9-2.9"/>
             </svg>
          </div>
         <h2 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-2 text-center">{{ $t('caught_up') }}</h2>
         <p class="text-aura-muted text-center max-w-sm mb-8 px-6">
            {{ $t('caught_up_sub') }}
         </p>
         <button
           @click="initiateUnlock"
           class="bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark px-8 py-3 rounded-[2rem] font-semibold shadow-soft hover:shadow-glow transition-all flex items-center gap-2"
         >
            <svg class="w-5 h-5 text-aura-accent" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/>
            </svg>
           <span>{{ $t('view_edit_entry') }}</span>
         </button>
      </div>

      <main v-else class="px-6 space-y-8 mt-4 animate-in slide-in-from-bottom-4 duration-500">
        <!-- Editing Info -->
        <div v-if="store.isEditing" class="bg-aura-accent/5 p-4 rounded-2xl flex justify-between items-center border border-aura-accent/10">
          <div class="flex flex-col">
            <span class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-bold">{{ $t('editing_entry') }}</span>
            <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark">
              {{ store.currentEntry.date ? new Date(store.currentEntry.date).toLocaleDateString(undefined, { weekday: 'long' }) : '' }},
              {{ store.currentEntry.date ? new Date(store.currentEntry.date).toLocaleDateString() : '' }}
            </span>
          </div>
          <button @click="store.resetEntry()" class="text-xs font-bold text-red-500 hover:opacity-70 transition-opacity">
            {{ $t('cancel_edit') }}
          </button>
        </div>

        <!-- Gratitude Section -->
        <section>
          <GratitudeInput />
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
  </div>
</template>

<script setup lang="ts">
import GratitudeInput from '@/components/journal/GratitudeInput.vue'
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
            const existing = store.entries.find((e: JournalEntry) => new Date(e.date).toLocaleDateString() === dateStr)

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
        setTimeout(() => pinError.value = '', 2000)
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

const save = async () => {
    await store.saveEntry()
    success(store.isEditing ? t('entry_updated_success') : t('entry_saved_success'))
    router.push('/history')
}
</script>
