<template>
  <div class="space-y-6">
    <!-- Moods -->
    <div class="space-y-3">
      <h3 class="font-semibold text-aura-text dark:text-aura-text-dark transition-colors">{{ $t('mood_prompt') }}</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="affect in affects"
          :key="affect.id"
          @click="openModal(affect.id)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2"
          :class="getAffectClass(affect)"
        >
           {{ formatAffectName(affect.id) }}
           <span v-if="getActiveCount(affect) > 0" class="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
             {{ getActiveCount(affect) }}
           </span>
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

    <MoodDetailModal
      :show="showModal"
      :affect-id="selectedAffectId"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'
import { AFFECTS, type Affect } from '@/constants/affects'
import MoodDetailModal from './MoodDetailModal.vue'
import { useI18n } from 'vue-i18n'

const store = useJournalStore()
const { t } = useI18n()
const affects = AFFECTS

const formatAffectName = (id: string) => {
  const name = t(`affects.${id}.name`)
  return ((name || '').split('–')[0] || '').trim()
}

const showModal = ref(false)
const selectedAffectId = ref('')

const scales = [
  { name: 'Sleep', label: 'Sleep Quality', key: 'sleep' },
  { name: 'Food', label: 'Nutrition', key: 'food' },
  { name: 'Movement', label: 'Activity', key: 'movement' },
] as const

const openModal = (affectId: string) => {
    selectedAffectId.value = affectId
    showModal.value = true
}

const getActiveCount = (affect: Affect) => {
    const currentMoods = store.currentEntry.moods || []
    const settingsStore = useSettingsStore()
    let count = 0
    if (currentMoods.includes(affect.id)) count++
    affect.related.forEach(related => {
        if (currentMoods.includes(related)) count++
    })

    // Custom moods associated with this affect
    const customForThisAffect = settingsStore.customMoods
        .filter(cm => cm.affectId === affect.id)
        .map(cm => cm.mood)

    currentMoods.forEach(m => {
        if (customForThisAffect.includes(m)) count++
    })

    return count
}

const getAffectClass = (affect: Affect) => {
  const count = getActiveCount(affect)

  if (count > 0) {
     return 'bg-aura-accent border-aura-accent text-white shadow-glow'
  }

  // Unselected
  return 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
}

const setHealth = (key: 'sleep' | 'food' | 'movement', val: number) => {
    if (store.currentEntry.health) {
      store.currentEntry.health[key] = val
    }
}

const getScaleStyle = (key: 'sleep' | 'food' | 'movement', val: number) => {
  const current = store.currentEntry.health?.[key] || 0
  if (val <= current) {
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
