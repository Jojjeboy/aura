<template>
  <aside
    class="fixed top-0 left-0 h-full w-64 bg-white dark:bg-aura-bg-dark border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300 z-50"
  >
    <!-- Header / Branding -->
    <div class="p-6 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center p-1 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
        >
          <img
            src="/logo.jpg"
            alt="Aura Logo"
            class="w-full h-full object-contain dark:rounded-full"
          />
        </div>
        <h1 class="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
          {{ $t('app_name') }}
        </h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      <router-link
        to="/journal"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="
          $route.path.startsWith('/journal')
            ? 'bg-aura-accent/10 text-aura-accent'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-aura-text dark:hover:text-aura-text-dark'
        "
      >
        <svg
          class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
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
            d="m4 12 8-8 8 8M6 10.5V19c0 .6.4 1 1 1h3v-3c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v3h3c.6 0 1-.4 1-1v-8.5"
          />
        </svg>
        <span class="font-bold tracking-tight">{{ $t('nav_today') }}</span>
      </router-link>

      <router-link
        to="/history"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="
          $route.path.startsWith('/history')
            ? 'bg-aura-accent/10 text-aura-accent'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-aura-text dark:hover:text-aura-text-dark'
        "
      >
        <svg
          class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
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
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0V12m0 0 4 4"
          />
        </svg>
        <span class="font-bold tracking-tight">{{ $t('nav_history') }}</span>
      </router-link>

      <router-link
        to="/settings"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        :class="
          $route.path.startsWith('/settings')
            ? 'bg-aura-accent/10 text-aura-accent'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-aura-text dark:hover:text-aura-text-dark'
        "
      >
        <svg
          class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
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
            d="M21 13v-2a1 1 0 0 0-1-1h-.7l-.7-1.7.5-.5a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-.5.5L14 6.7V6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.7l-1.7.7-.5-.5a1 1 0 0 0-1.4 0L5 7.7a1 1 0 0 0 0 1.4l.5.5-.7 1.7H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.7l.7 1.7-.5.5a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l.5-.5 1.7.7v.7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.7l 1.7-.7.5.5a1 1 0 0 0 1.4 0l1.4-1.4a1 1 0 0 0 0-1.4l-.5-.5.7-1.7h.7a1 1 0 0 0 1-1ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
          />
        </svg>
        <span class="font-bold tracking-tight">{{ $t('nav_settings') }}</span>
      </router-link>
    </nav>

    <!-- Footer / User / Theme -->
    <div class="p-4 border-t border-slate-100 dark:border-slate-800">
      <button
        @click="settingsStore.toggleDark()"
        class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
      >
        <svg
          v-if="settingsStore.isDark"
          class="w-6 h-6"
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
            d="M12 5V3m0 18v-2M7.1 7.1 5.7 5.7m12.6 12.6-1.4-1.4M5 12H3m18 0h-2M7.1 16.9l-1.4 1.4m12.6-12.6-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M11.675 2.015a.746.746 0 0 0-.356.073A10.513 10.513 0 0 0 2 12.5a10.5 10.5 0 0 0 10.5 10.5c4.71 0 8.74-3.12 10.05-7.4a.75.75 0 0 0-.962-.924 8.994 8.994 0 0 1-8.913-8.912.75.75 0 0 0-.925-.962 10.457 10.457 0 0 0-1.075-.287Z"
          />
        </svg>
        <span class="font-medium">{{
          settingsStore.isDark ? $t('mode_light') : $t('mode_dark')
        }}</span>
      </button>

      <div v-if="authStore.user" class="mt-4 px-4 py-2 flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
            {{ authStore.user.email }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
</script>
