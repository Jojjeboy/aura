<template>
  <div class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark p-6 pb-24 transition-colors duration-300">
    <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-6">{{ $t('nav_history') }}</h1>

    <!-- Lock State -->
    <div v-if="settingsStore.biometricLock && !isAuthenticated" class="flex flex-col items-center justify-center py-32 space-y-6">
      <div class="bg-aura-accent/10 p-8 rounded-full">
        <span class="text-5xl">🔒</span>
      </div>
      <div class="text-center space-y-2">
        <h2 class="text-xl font-bold text-aura-text dark:text-aura-text-dark">{{ $t('history_locked') }}</h2>
        <p class="text-aura-muted max-w-xs mx-auto">{{ $t('history_locked_desc') }}</p>
      </div>
      <button
        @click="unlock"
        class="bg-aura-accent text-white px-10 py-3 rounded-full font-bold shadow-glow transform hover:scale-105 transition-all"
      >
        {{ $t('unlock_history') }}
      </button>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useBiometricLock } from '@/composables/useBiometricLock'

const store = useJournalStore()
const { entries, loading } = storeToRefs(store)
const settingsStore = useSettingsStore()

const isAuthenticated = ref(false)
const { authenticate } = useBiometricLock()

const unlock = async () => {
  const success = await authenticate()
  if (success) {
    isAuthenticated.value = true
  }
}

onMounted(() => {
    store.loadEntries()
})
</script>
