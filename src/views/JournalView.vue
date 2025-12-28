<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark pb-24 transition-colors duration-300">
    <!-- Greeting Section -->
    <section class="px-6 py-4 transition-colors duration-300">
        <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark transition-colors duration-300">{{ $t('greeting') }}</h1>
        <p class="text-aura-muted text-sm transition-colors duration-300">{{ $t('greeting_sub') }}</p>
    </section>

      <!-- Already Logged State (Only show if NOT currently editing something) -->
      <div v-if="hasLoggedToday && !isUnlocked && !store.isEditing" class="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
         <div class="bg-aura-accent/10 p-6 rounded-full mb-6">
            <span class="text-4xl">✨</span>
         </div>
         <h2 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-2 text-center">{{ $t('caught_up') }}</h2>
         <p class="text-aura-muted text-center max-w-sm mb-8 px-6">
            {{ $t('caught_up_sub') }}
         </p>
         <button
           @click="unlockEntry"
           class="bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark px-8 py-3 rounded-[2rem] font-semibold shadow-soft hover:shadow-glow transition-all flex items-center gap-2"
         >
           <span>🔒</span>
           <span>{{ $t('view_edit_entry') }}</span>
         </button>
      </div>

      <main v-else class="px-6 space-y-8 mt-4 animate-in slide-in-from-bottom-4 duration-500">
        <!-- Editing Info -->
        <div v-if="store.isEditing" class="bg-aura-accent/5 p-4 rounded-2xl flex justify-between items-center border border-aura-accent/10">
          <div class="flex flex-col">
            <span class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-bold">{{ $t('editing_entry') }}</span>
            <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark">{{ store.currentEntry.date ? new Date(store.currentEntry.date).toLocaleDateString() : '' }}</span>
          </div>
          <button @click="store.resetEntry()" class="text-xs font-bold text-red-500 hover:opacity-70 transition-opacity">
            {{ $t('cancel_edit') }}
          </button>
        </div>

        <!-- Gratitude Section -->
        <section>
          <h2 class="text-lg font-semibold text-aura-text dark:text-aura-text-dark mb-4 ml-2 transition-colors duration-300">{{ $t('grateful_prompt') }}</h2>
          <GratitudeInput />
        </section>

        <!-- Mood & Health Section -->
        <section>
          <MoodAccordion />
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
  </div>
</template>

<script setup lang="ts">
import GratitudeInput from '@/components/journal/GratitudeInput.vue'
import MoodAccordion from '@/components/journal/MoodAccordion.vue'
import { useJournalStore } from '@/stores/journal'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useBiometricLock } from '@/composables/useBiometricLock'
import { useI18n } from 'vue-i18n'

const store = useJournalStore()
const router = useRouter()
const { t } = useI18n()
const { authenticate } = useBiometricLock()

const isUnlocked = ref(false)

onMounted(async () => {
  await store.loadEntries()
})

const hasLoggedToday = computed(() => !!store.todayEntry)

// If user navigates away and back, reset lock state for security
onMounted(() => {
    isUnlocked.value = false
})

const unlockEntry = async () => {
    const success = await authenticate()
    if (success) {
        isUnlocked.value = true
        // Load the existing entry into the editing state
        if (store.todayEntry) {
            store.currentEntry = JSON.parse(JSON.stringify(store.todayEntry))
        }
    } else {
        alert(t('auth_failed'))
    }
}

const save = async () => {
    await store.saveEntry()
    router.push('/history')
}
</script>
