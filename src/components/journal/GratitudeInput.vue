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
        <div class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-soft p-4 flex items-center gap-4 transition-all duration-300 focus-within:shadow-glow focus-within:ring-1 focus-within:ring-aura-accent/30 relative">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-medium shrink-0">
            {{ index + 1 }}
          </div>
          <input
            type="text"
            v-model="store.currentEntry.gratitude![index]"
            :placeholder="$t('grateful_placeholder')"
            class="w-full bg-transparent border-none outline-none text-aura-text dark:text-aura-text-dark placeholder-aura-muted"
            :disabled="isLocked(index)"
          />

          <!-- Inspiration Trigger -->
          <button
            v-if="!isLocked(index)"
            @click="toggleInspiration(index)"
            class="p-2 text-aura-muted hover:text-aura-accent transition-colors shrink-0 opacity-40 hover:opacity-100"
            :title="$t('gratitude_inspiration_title')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l-.707.707M12 18s-4-4-4-7a4 4 0 118 0c0 3-4 7-4 7z" />
            </svg>
          </button>
        </div>

        <!-- Inspiration List -->
        <div
          v-if="activeInspirationIndex === index"
          class="mt-3 ml-12 p-4 bg-white dark:bg-aura-card-dark rounded-2xl shadow-soft border border-aura-accent/10 animate-in fade-in slide-in-from-top-2 duration-300 z-10 space-y-3"
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="example in visibleExamples"
              :key="example"
              @click="selectExample(index, example)"
              class="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 text-aura-muted hover:bg-aura-accent/10 hover:text-aura-accent rounded-full border border-transparent hover:border-aura-accent/20 transition-all text-left"
            >
              {{ example }}
            </button>
          </div>
          <div class="flex justify-between items-center pt-1">
            <button
              @click="refreshExamples"
              class="text-[0.65rem] font-bold text-aura-accent hover:underline uppercase tracking-wider"
            >
              🔄 {{ $t('reveal_more') }}
            </button>
            <button
              @click="activeInspirationIndex = null"
              class="text-[0.65rem] font-bold text-aura-muted hover:text-aura-text uppercase tracking-wider"
            >
               {{ $t('close') || 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useI18n } from 'vue-i18n'

const store = useJournalStore()
const { tm } = useI18n()

const activeInspirationIndex = ref<number | null>(null)
const visibleExamples = ref<string[]>([])

const isLocked = (index: number) => {
  if (index === 0) return false
  const previousVal = store.currentEntry.gratitude?.[index - 1]
  return !previousVal || previousVal.length < 3 // basic length check
}

const toggleInspiration = (index: number) => {
  if (activeInspirationIndex.value === index) {
    activeInspirationIndex.value = null
  } else {
    activeInspirationIndex.value = index
    refreshExamples()
  }
}

const refreshExamples = () => {
  const allExamples = tm('gratitude_examples') as string[]
  if (!allExamples || allExamples.length === 0) return

  const shuffled = [...allExamples].sort(() => 0.5 - Math.random())
  visibleExamples.value = shuffled.slice(0, 10)
}

const selectExample = (index: number, example: string) => {
  if (store.currentEntry.gratitude) {
    store.currentEntry.gratitude[index] = example
    activeInspirationIndex.value = null
  }
}

// Close inspiration if clicking outside or moving between inputs could be handled,
// but focus-within logic and explicit close should suffice.

const progressHeight = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => g && g.length > 2).length || 0
  return `${(filled / 3) * 100}%`
})

const isComplete = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => g && g.length > 2).length || 0
  return filled === 3
})
</script>
