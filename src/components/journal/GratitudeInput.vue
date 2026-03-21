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

    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 ml-2">
      <label class="text-lg font-semibold text-aura-text dark:text-aura-text-dark transition-colors duration-300">
        {{ $t('greeting_sub') }}
      </label>
      <button
        @click="openInspirationModal"
        class="px-4 py-2 text-xs font-bold bg-aura-accent/10 text-aura-accent rounded-full hover:bg-aura-accent/20 transition-colors flex items-center gap-2"
        data-test="inspiration-btn"
      >
        ✨ {{ $t('gratitude_inspiration_title') }}
      </button>
    </div>

    <div class="space-y-6">
      <div
        v-for="(item, index) in store.currentEntry.gratitude"
        :key="index"
        class="transition-all duration-500 opacity-100 blur-0"
      >
        <div class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-soft p-4 flex flex-col gap-3 transition-all duration-300 focus-within:shadow-glow focus-within:ring-1 focus-within:ring-aura-accent/30 relative">
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-medium shrink-0">
              {{ index + 1 }}
            </div>
            <input
              type="text"
              :value="getItemText(item)"
              @input="updateItemText(index, ($event.target as HTMLInputElement).value)"
              :placeholder="$t('grateful_placeholder')"
              class="w-full bg-transparent border-none outline-none text-aura-text dark:text-aura-text-dark placeholder-aura-muted"
            />
          </div>

          <!-- Categories -->
          <div class="flex flex-wrap gap-2 ml-12">
            <button
              v-for="cat in availableCategories"
              :key="cat"
              @click="updateItemCategory(index, cat)"
              class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200"
              :class="getItemCategory(item) === cat
                ? 'bg-aura-accent text-white shadow-glow'
                : 'bg-slate-50 dark:bg-slate-800 text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-700'"
            >
              {{ $t('gratitude_cat_' + cat) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspiration Modal Overlay -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" @click.self="showModal = false">
      <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
        <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark mb-4">
          {{ $t('gratitude_inspiration_title') }}
        </h3>
        
        <div class="space-y-4 mb-6">
          <p class="text-[0.65rem] uppercase font-black text-aura-muted tracking-widest">{{ $t('gratitude_inspiration_select') }}</p>
          <div class="space-y-2">
            <button
              v-for="(example, i) in visibleExamples"
              :key="i"
              @click="toggleExample(example)"
              class="w-full text-left p-3 rounded-xl border transition-all text-sm leading-relaxed"
              :class="selectedExamples.includes(example) ? 'bg-aura-accent/10 border-aura-accent text-aura-text dark:text-aura-text-dark font-medium' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-800'"
            >
              {{ example }}
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            @click="refreshExamples" 
            class="w-full sm:w-auto px-4 py-2 border border-aura-accent/30 text-aura-accent rounded-[2rem] text-xs font-bold hover:bg-aura-accent/5 transition-all flex items-center justify-center gap-2"
          >
            🔄 {{ $t('slumpa_knapp') }}
          </button>
          <div class="flex gap-2 w-full sm:w-auto">
            <button @click="showModal = false" class="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-aura-muted hover:text-aura-text transition-colors">
              {{ $t('cancel') || 'Cancel' }}
            </button>
            <button @click="addSelected" :disabled="selectedExamples.length === 0" class="flex-1 sm:flex-none px-6 py-2 bg-aura-accent text-white rounded-[2rem] text-sm font-bold disabled:opacity-50 transition-colors">
              {{ $t('journal_add_item') || 'Add' }} <span v-if="selectedExamples.length > 0">({{ selectedExamples.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useJournalStore } from '@/stores/journal'
import gratitudeData from '@/assets/gratitude_list.json'

const store = useJournalStore()

const availableCategories = ['self', 'work', 'family', 'health', 'nature', 'other']

const getItemText = (item: string | undefined): string => {
  if (!item) return ''
  if (item.includes('|')) {
    return item.split('|')[1] || ''
  }
  return item
}

const getItemCategory = (item: string | undefined): string => {
  if (!item) return ''
  if (item.includes('|')) {
    return item.split('|')[0] || ''
  }
  return ''
}

const updateItemText = (index: number, text: string) => {
  if (!store.currentEntry.gratitude) return
  const currentCat = getItemCategory(store.currentEntry.gratitude[index])
  store.currentEntry.gratitude[index] = currentCat ? `${currentCat}|${text}` : text
}

const updateItemCategory = (index: number, category: string) => {
  if (!store.currentEntry.gratitude) return
  const currentText = getItemText(store.currentEntry.gratitude[index])
  if (getItemCategory(store.currentEntry.gratitude[index]) === category) {
    // Toggle off
    store.currentEntry.gratitude[index] = currentText
  } else {
    store.currentEntry.gratitude[index] = `${category}|${currentText}`
  }
}

watch(() => store.currentEntry.gratitude, (newVal) => {
  if (newVal && newVal.length > 0) {
    const lastItem = newVal[newVal.length - 1]
    const text = getItemText(lastItem)
    if (text && text.trim().length > 0) {
      store.currentEntry.gratitude!.push('')
    }
  } else if (!newVal || newVal.length === 0) {
    store.currentEntry.gratitude = ['']
  }
}, { deep: true })

const progressHeight = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => {
    const text = getItemText(g)
    return text && text.trim().length > 0
  }).length || 0
  return filled >= 1 ? '100%' : '10%'
})

const isComplete = computed(() => {
  const filled = store.currentEntry.gratitude?.filter(g => {
    const text = getItemText(g)
    return text && text.trim().length > 0
  }).length || 0
  return filled >= 1
})

const showModal = ref(false)
const visibleExamples = ref<string[]>([])
const selectedExamples = ref<string[]>([])

const flattenedExamples = computed(() => {
  let all: string[] = []
  if (gratitudeData && gratitudeData.gratitude_list) {
    gratitudeData.gratitude_list.forEach((category: any) => {
      if (category.items) {
        all = all.concat(category.items)
      }
    })
  }
  return all
})

const refreshExamples = () => {
  if (flattenedExamples.value.length === 0) return
  const shuffled = [...flattenedExamples.value].sort(() => 0.5 - Math.random())
  visibleExamples.value = shuffled.slice(0, 5)
}

const openInspirationModal = () => {
  selectedExamples.value = []
  refreshExamples()
  showModal.value = true
}

const toggleExample = (example: string) => {
  const idx = selectedExamples.value.indexOf(example)
  if (idx > -1) {
    selectedExamples.value.splice(idx, 1)
  } else {
    selectedExamples.value.push(example)
  }
}

const addSelected = () => {
  if (!store.currentEntry.gratitude) {
    store.currentEntry.gratitude = ['']
  }
  
  // Find first empty, or just push
  selectedExamples.value.forEach(ex => {
    const emptyIndex = store.currentEntry.gratitude!.findIndex(g => !g || g.trim().length === 0)
    if (emptyIndex > -1) {
      store.currentEntry.gratitude![emptyIndex] = ex
    } else {
      store.currentEntry.gratitude!.push(ex)
    }
  })
  
  showModal.value = false
  selectedExamples.value = []
}
</script>
