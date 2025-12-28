<template>
  <header class="sticky top-0 z-50 bg-white dark:bg-aura-bg-dark border-b border-slate-200 dark:border-slate-800 shadow-lg transition-colors duration-300">
    <div class="px-6 py-4 flex justify-between items-center max-w-lg mx-auto">
      <div
        @click="router.push('/journal')"
        class="flex items-center gap-3 cursor-pointer group"
      >
        <div class="w-12 h-12 rounded-full flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-colors group-hover:border-aura-accent/50">
          <img
            src="/logo.jpg"
            alt="Aura Logo"
            class="w-full h-full object-contain dark:rounded-full"
          />
        </div>
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-800 dark:text-white tracking-tighter group-hover:text-aura-accent transition-colors">
            {{ $t('app_name') }}
          </h1>
        </div>
      </div>

      <button
        @click="settingsStore.toggleDark()"
        class="w-10 h-10 rounded-full flex items-center justify-center text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors"
        :title="settingsStore.isDark ? $t('mode_light') : $t('mode_dark')"
      >
        <!-- Sun Icon -->
        <svg v-if="settingsStore.isDark" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5V3m0 18v-2M7.1 7.1 5.7 5.7m12.6 12.6-1.4-1.4M5 12H3m18 0h-2M7.1 16.9l-1.4 1.4m12.6-12.6-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
        </svg>
        <!-- Moon Icon (Solid) -->
        <svg v-else class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.675 2.015a.746.746 0 0 0-.356.073A10.513 10.513 0 0 0 2 12.5a10.5 10.5 0 0 0 10.5 10.5c4.71 0 8.74-3.12 10.05-7.4a.75.75 0 0 0-.962-.924 8.994 8.994 0 0 1-8.913-8.912.75.75 0 0 0-.925-.962 10.457 10.457 0 0 0-1.075-.287Z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'

const settingsStore = useSettingsStore()
const router = useRouter()
</script>
