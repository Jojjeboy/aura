<template>
  <div class="flex items-center gap-2 bg-white/50 backdrop-blur-xs rounded-full p-1 shadow-sm border border-white/60">
    <button
      v-for="locale in availableLocales"
      :key="locale"
      @click="setLocale(locale)"
      class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
      :class="currentLocale === locale
        ? 'bg-aura-accent text-white shadow-sm'
        : 'text-aura-muted hover:text-aura-text'"
    >
      {{ locale.toUpperCase() }}
    </button>
    <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
    <button @click="toggleDark()" class="text-sm">
      {{ isDark ? '🌙' : '☀️' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

const { locale } = useI18n()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const availableLocales = ['en', 'sv']

const currentLocale = computed(() => locale.value)

const setLocale = (l: string) => {
  locale.value = l
}
</script>
