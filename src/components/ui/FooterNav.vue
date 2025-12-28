<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-aura-bg-dark border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <div class="flex justify-around items-center py-2 px-2 max-w-lg mx-auto">
      <button
        @click="router.push('/journal')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1"
        :class="route.path === '/journal' ? 'text-aura-accent' : 'text-slate-400 hover:text-aura-text dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19c0 .6.4 1 1 1h3v-3c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v3h3c.6 0 1-.4 1-1v-8.5"/>
        </svg>
        <span class="text-[0.6rem] font-bold uppercase tracking-tighter">{{ $t('nav_today') }}</span>
      </button>

      <button
        @click="router.push('/history')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1"
        :class="route.path === '/history' ? 'text-aura-accent' : 'text-slate-400 hover:text-aura-text dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0V12m0 0 4 4"/>
        </svg>
        <span class="text-[0.6rem] font-bold uppercase tracking-tighter">{{ $t('nav_history') }}</span>
      </button>

      <button
        @click="router.push('/notes')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1"
        :class="route.path === '/notes' ? 'text-aura-accent' : 'text-slate-400 hover:text-aura-text dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8 1-1h4a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h1l1 1Z"/>
        </svg>
        <span class="text-[0.6rem] font-bold uppercase tracking-tighter text-center line-clamp-1">{{ $t('settings.my_notes') }}</span>
      </button>

      <button
        @click="router.push('/settings')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1"
        :class="route.path === '/settings' ? 'text-aura-accent' : 'text-slate-400 hover:text-aura-text dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.7l-.7-1.7.5-.5a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-.5.5L14 6.7V6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.7l-1.7.7-.5-.5a1 1 0 0 0-1.4 0L5 7.7a1 1 0 0 0 0 1.4l.5.5-.7 1.7H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.7l.7 1.7-.5.5a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l.5-.5 1.7.7v.7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.7l 1.7-.7.5.5a1 1 0 0 0 1.4 0l1.4-1.4a1 1 0 0 0 0-1.4l-.5-.5.7-1.7h.7a1 1 0 0 0 1-1ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
        </svg>
        <span class="text-[0.6rem] font-bold uppercase tracking-tighter">{{ $t('nav_settings') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>
