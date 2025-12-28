<template>
  <div class="relative py-4 pl-6">
    <!-- Glow Line -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full transition-all duration-500 overflow-hidden"
    >
      <div
      class="absolute left-1 top-2 w-[2px] transition-all duration-700 ease-out rounded-full"
      :class="isComplete ? 'bg-aura-accent shadow-[0_0_10px_#42b883] h-full' : 'bg-slate-200 dark:bg-slate-700 h-0.5'"
      :style="{ height: progressHeight }"
    ></div>
    </div>

    <div class="space-y-6">
      <div
        v-for="(item, index) in 3"
        :key="index"
        class="transition-all duration-500"
        :class="{
          'opacity-50 blur-sm pointer-events-none select-none': isLocked(index),
          'opacity-100 blur-0': !isLocked(index)
        }"
      >
        <div class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-soft p-4 flex items-center gap-4 transition-all duration-300 focus-within:shadow-glow focus-within:ring-1 focus-within:ring-aura-accent/30">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 text-sm font-medium shrink-0">
            {{ index + 1 }}
          </div>
          <input
            type="text"
            v-model="store.currentEntry.gratitude![index]"
            :placeholder="$t('grateful_placeholder')"
            class="w-full bg-transparent border-none outline-none text-aura-text dark:text-aura-text-dark placeholder-aura-muted"
            :disabled="isLocked(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJournalStore } from '@/stores/journal'

const store = useJournalStore()

const isLocked = (index: number) => {
  if (index === 0) return false
  const previousVal = store.currentEntry.gratitude?.[index - 1]
  return !previousVal || previousVal.length < 3 // basic length check
}

const progressHeight = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => g && g.length > 2).length || 0
  return `${(filled / 3) * 100}%`
})

const isComplete = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => g && g.length > 2).length || 0
  return filled === 3
})
</script>
