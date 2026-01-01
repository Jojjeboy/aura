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

             <!-- Persistent Custom Moods -->
             <button
                v-for="mood in persistentCustomMoods"
                :key="mood"
                @click="toggleMood(mood)"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
                :class="isSelected(mood)
                    ? 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-aura-muted border-yellow-200 hover:border-yellow-300'"
             >
                {{ mood }}
             </button>
        </div>

        <!-- Custom Mood Section -->
        <div class="mb-8">
            <h3 class="text-xs font-bold uppercase tracking-wider text-aura-muted mb-3 flex items-center gap-2">
                <span>✨</span>
                {{ $t('mood_custom_label') }}
            </h3>

            <!-- Custom Moods List (Yellow Pills) -->
            <div v-if="customMoods.length > 0" class="flex flex-wrap gap-2 mb-4">
                <button
                    v-for="mood in customMoods"
                    :key="mood"
                    @click="toggleMood(mood)"
                    class="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/60 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-all flex items-center gap-1.5"
                >
                    {{ mood }}
                    <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Custom Mood Input -->
            <div class="flex gap-2">
                <input
                    v-model="customMoodInput"
                    type="text"
                    :placeholder="$t('mood_custom_placeholder')"
                    @keydown.enter="addCustomMood"
                    class="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-aura-accent/20 focus:border-aura-accent outline-none transition-all"
                />
                <button
                    @click="addCustomMood"
                    :disabled="!customMoodInput.trim()"
                    class="px-4 py-2 bg-aura-accent/10 text-aura-accent font-bold text-sm rounded-xl hover:bg-aura-accent hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                    {{ $t('mood_custom_add') }}
                </button>
            </div>
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
import { computed, ref } from 'vue'
import { AFFECTS } from '@/constants/affects'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    show: boolean
    affectId: string
}>()

defineEmits(['close'])
const store = useJournalStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const shortAffectName = computed(() => {
  const name = t(`affects.${props.affectId}.name`)
  return (String(name || '').split('–')[0] || '').trim()
})

const relatedEmotions = computed(() => {
    const affect = AFFECTS.find(a => a.id === props.affectId)
    return affect ? affect.related : []
})

const isSelected = (mood: string) => {
    return (store.currentEntry.moods || []).includes(mood)
}

const isStandardMood = (moodId: string) => {
  return AFFECTS.some(affect => affect.id === moodId || affect.related.includes(moodId))
}

const customMoods = computed(() => {
  const allSelected = store.currentEntry.moods || []
  // Only show "unmapped" custom moods in the bottom section if they are currently selected but not in settings for this affect
  const persistentForThisAffect = settingsStore.customMoods
    .filter(m => m.affectId === props.affectId)
    .map(m => m.mood)

  return allSelected.filter(m => !isStandardMood(m) && !persistentForThisAffect.includes(m))
})

const persistentCustomMoods = computed(() => {
    return settingsStore.customMoods
        .filter(m => m.affectId === props.affectId)
        .map(m => m.mood)
})

const customMoodInput = ref('')

const addCustomMood = async () => {
    const mood = customMoodInput.value.trim()
    if (!mood) return

    // Add to persistent settings with association
    await settingsStore.addCustomMood(mood, props.affectId)

    if (!store.currentEntry.moods) store.currentEntry.moods = []

    // Also select it for the current entry if not present
    if (!store.currentEntry.moods.includes(mood)) {
        store.currentEntry.moods.push(mood)
    }

    customMoodInput.value = ''
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

