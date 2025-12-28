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
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="close"
            class="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {{ $t('pwa_close') }}
          </button>
          <button
            @click="updateServiceWorker()"
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
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW()

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
