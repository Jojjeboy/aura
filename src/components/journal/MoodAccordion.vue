<template>
  <div class="space-y-6">
    <!-- Moods -->
    <div class="space-y-3">
      <h3 class="font-semibold text-aura-text dark:text-aura-text-dark transition-colors">{{ $t('mood_prompt') }}</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="emotion in emotions"
          :key="emotion"
          @click="toggleMood(emotion)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
          :class="getMoodClass(emotion)"
        >
           {{ $t(`emotions.${emotion}`) }}
        </button>
      </div>
    </div>

    <!-- Health Scales -->
    <div class="space-y-4">
      <div v-for="scale in scales" :key="scale.name" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-aura-muted capitalize">{{ $t(`scales.${scale.key}`) }}</span>
          <span class="font-bold text-aura-accent">{{ store.currentEntry.health?.[scale.key] }}/5</span>
        </div>
        <div class="flex justify-between gap-1">
           <button
              v-for="val in 5"
              :key="val"
              @click="setHealth(scale.key, val)"
              class="w-full h-10 rounded-xl transition-all duration-200"
              :class="val > (store.currentEntry.health?.[scale.key] || 0) ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700' : ''"
              :style="getScaleStyle(scale.key, val)"
           ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'

const store = useJournalStore()

const emotions = [
  'Joy', 'Interest', 'Surprise', 'Anger',
  'Disgust', 'Fear', 'Shame', 'Sadness', 'Guilt'
]

const scales = [
  { name: 'Sleep', label: 'Sleep Quality', key: 'sleep' },
  { name: 'Food', label: 'Nutrition', key: 'food' },
  { name: 'Movement', label: 'Activity', key: 'movement' },
] as const

const toggleMood = (mood: string) => {
  if (!store.currentEntry.moods) store.currentEntry.moods = []

  const index = store.currentEntry.moods.indexOf(mood)
  if (index > -1) {
    store.currentEntry.moods.splice(index, 1)
  } else {
    store.currentEntry.moods.push(mood)
  }
}

const getMoodClass = (mood: string) => {
  const moods = store.currentEntry.moods || []
  const index = moods.indexOf(mood)

  if (index === 0) {
     // First selected -> Primary
     return 'bg-aura-accent text-white shadow-glow'
  } else if (index > 0) {
     // Subsequent -> Muted
     return 'bg-aura-accent/60 text-white'
  }

  // Unselected
  return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
}

const setHealth = (key: 'sleep' | 'food' | 'movement', val: number) => {
    if (store.currentEntry.health) {
      store.currentEntry.health[key] = val
    }
}

const getScaleStyle = (key: 'sleep' | 'food' | 'movement', val: number) => {
  const current = store.currentEntry.health?.[key] || 0
  if (val <= current) {
    // Base HSL for aura-accent is 153, 47%, 49%
    // 5 is 20% darker than 1: L range 49% -> 39.2%
    // 5 is 15% more saturated than 1: S range 47% -> 62%
    const lightness = 49 - ((val - 1) * 2.45)
    const saturation = 47 + ((val - 1) * 3.75)
    return {
      backgroundColor: `hsl(153, ${saturation}%, ${lightness}%)`,
      boxShadow: `0 0 10px hsla(153, ${saturation}%, ${lightness}%, 0.3)`
    }
  }
  return {}
}
</script>
