<template>
  <header class="sticky top-0 z-50 bg-white dark:bg-aura-bg-dark border-b border-slate-200 dark:border-slate-800 shadow-lg transition-colors duration-300">
    <div class="px-6 py-4 flex justify-between items-center max-w-lg mx-auto">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-colors">
          <img
            src="/logo.jpg"
            alt="Aura Logo"
            class="w-full h-full object-contain dark:rounded-full"
          />
        </div>
        <div class="flex flex-col -space-y-1">
          <h1 class="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
            {{ $t('app_name') }}
          </h1>
          <span class="text-[0.65rem] uppercase tracking-[0.2em] text-aura-muted font-bold ml-0.5">
            {{ $t('app_sub_title') }}
          </span>
        </div>
      </div>

      <button
        @click="settingsStore.toggleDark()"
        class="w-10 h-10 rounded-full flex items-center justify-center text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors"
        :title="settingsStore.isDark ? $t('mode_light') : $t('mode_dark')"
      >
        <!-- Sun Icon -->
        <svg v-if="settingsStore.isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <!-- Moon Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
