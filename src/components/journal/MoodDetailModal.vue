<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
    <!-- Backdrop -->
    <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        @click="$emit('close')"
    ></div>

    <!-- Modal Content -->
    <div
        class="relative w-full sm:w-full max-w-lg bg-white dark:bg-aura-card-dark rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-xl pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-bottom-10"
    >
        <!-- Header -->
        <div class="flex flex-col items-center mb-6 text-center">
             <div class="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 sm:hidden"></div>

             <h2 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-2">
                {{ $t(`affects.${affectId}.name`) }}
             </h2>
             <p class="text-sm text-aura-muted max-w-xs">
                {{ $t(`affects.${affectId}.description`) }}
             </p>
        </div>

        <!-- Related Emotions Grid -->
        <div class="flex flex-wrap gap-2 justify-center mb-8">
             <!-- Primary Affect Button -->
             <button
                @click="toggleMood(affectId)"
                class="px-5 py-2.5 rounded-full font-semibold border-2 transition-all duration-200"
                :class="isSelected(affectId)
                    ? 'bg-aura-accent border-aura-accent text-white shadow-glow'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-aura-text dark:text-aura-text-dark hover:border-aura-accent/50'"
             >
                {{ shortAffectName }}
             </button>

             <!-- Divider -->
             <div class="w-full h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

             <!-- Related Emotions -->
             <button
                v-for="emotion in relatedEmotions"
                :key="emotion"
                @click="toggleMood(emotion)"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                :class="isSelected(emotion)
                    ? 'bg-aura-accent/10 text-aura-accent border border-aura-accent/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-800'"
             >
                {{ $t(`affects.${affectId}.related.${emotion}`) }}
             </button>
        </div>

        <!-- Close Button -->
        <button
            @click="$emit('close')"
            class="w-full py-4 bg-slate-100 dark:bg-slate-800 text-aura-text dark:text-aura-text-dark font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            {{ $t('done') }}
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AFFECTS } from '@/constants/affects'
import { useJournalStore } from '@/stores/journal'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    show: boolean
    affectId: string
}>()

defineEmits(['close'])
const store = useJournalStore()
const { t } = useI18n()

const shortAffectName = computed(() => {
  const name = t(`affects.${props.affectId}.name`)
  return (name || '').split('–')[0].trim()
})

const relatedEmotions = computed(() => {
    const affect = AFFECTS.find(a => a.id === props.affectId)
    return affect ? affect.related : []
})

const isSelected = (mood: string) => {
    return (store.currentEntry.moods || []).includes(mood)
}

const toggleMood = (mood: string) => {
  if (!store.currentEntry.moods) store.currentEntry.moods = []

  const index = store.currentEntry.moods.indexOf(mood)
  if (index > -1) {
    store.currentEntry.moods.splice(index, 1)
  } else {
    store.currentEntry.moods.push(mood)
  }
}
</script>

