<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-aura-bg-dark border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <div class="flex justify-around items-center p-2">
      <button
        @click="router.push('/journal')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full"
        :class="route.path === '/journal' ? 'text-aura-accent' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <span class="text-xs font-medium">{{ $t('nav_today') }}</span>
      </button>

      <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

      <button
        @click="router.push('/history')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full"
        :class="route.path === '/history' ? 'text-aura-accent' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <span class="text-xs font-medium">{{ $t('nav_history') }}</span>
      </button>

      <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>

      <button
        @click="router.push('/settings')"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full"
        :class="route.path === '/settings' ? 'text-aura-accent' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'"
      >
        <span class="text-xs font-medium">{{ $t('nav_settings') }}</span>
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
