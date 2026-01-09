<template>
  <Transition name="fade">
    <div v-if="needRefresh" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div class="flex flex-col items-center text-center space-y-2">
           <div class="bg-aura-accent/10 p-3 rounded-full mb-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-aura-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </div>
           <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
             {{ $t('pwa_update_available') }}
           </h3>
           <p class="text-sm text-aura-muted">
             {{ $t('pwa_update_desc') }}
           </p>

           <!-- Changelog Message -->
           <div v-if="newMessages.length > 0" class="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-slate-100 dark:border-slate-800/50 w-full">
             <span class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-bold block mb-2">
               {{ $t('pwa_whats_new') }}
             </span>
             <ul class="space-y-2">
               <li v-for="(msg, i) in newMessages.slice(0, 5)" :key="i" class="text-xs font-bold text-aura-text dark:text-aura-text-dark leading-relaxed flex gap-2">
                 <span class="text-aura-accent">•</span>
                 <span>{{ msg }}</span>
               </li>
               <li v-if="newMessages.length > 5" class="text-[10px] text-aura-muted italic pl-4">
                 + {{ newMessages.length - 5 }} more updates...
               </li>
             </ul>
             <a
               href="https://github.com/Jojjeboy/aura/commits/develop"
               target="_blank"
               class="mt-3 block text-[10px] text-aura-accent hover:underline font-bold text-center"
             >
               View all changes on GitHub →
             </a>
           </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="close"
            class="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {{ $t('pwa_close') }}
          </button>
          <button
            @click="handleUpdate"
            class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-aura-accent text-white shadow-glow hover:opacity-90 transition-opacity"
          >
            {{ $t('pwa_update_button') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

interface Commit {
  hash: string
  message: string
}

const { needRefresh, updateServiceWorker } = useRegisterSW()
const newMessages = ref<string[]>([])
const STORAGE_KEY = 'aura-last-seen-hash'

onMounted(async () => {
  try {
    const response = await fetch('/changelog.json')
    if (response.ok) {
      const data = (await response.json()) as Commit[]
      if (Array.isArray(data) && data.length > 0) {
        const lastSeenHash = localStorage.getItem(STORAGE_KEY)

        if (!lastSeenHash) {
          // If no hash stored, initialize with current latest and show only the very latest check
          if (data[0]) {
            localStorage.setItem(STORAGE_KEY, data[0].hash)
            newMessages.value = [data[0].message]
          }
        } else {
          // Find where the user was
          const lastIndex = data.findIndex((c) => c.hash === lastSeenHash)

          if (lastIndex === -1) {
            // Hash not found (maybe pushed too many commits), show only latest
            if (data[0]) newMessages.value = [data[0].message]
          } else if (lastIndex === 0) {
            // Already on latest (shouldn't happen if needRefresh is true, but for safety)
            newMessages.value = []
          } else {
            // Show everything since last seen
            newMessages.value = data.slice(0, lastIndex).map((c) => c.message)
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load changelog:', err)
  }
})

const handleUpdate = async () => {
  // Update the hash before reloading so the new version knows where it is
  try {
    const response = await fetch('/changelog.json')
    if (response.ok) {
      const data = (await response.json()) as Commit[]
      if (data.length > 0 && data[0]) {
        localStorage.setItem(STORAGE_KEY, data[0].hash)
      }
    }
  } catch {
    /* ignore */
  }

  updateServiceWorker()
}

const close = () => {
  needRefresh.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
