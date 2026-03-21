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
        {{ $t('greeting_sub') || 'What are you grateful for today?' }}
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
      <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
            {{ isManaging ? 'Hantera förslag' : $t('gratitude_inspiration_title') }}
          </h3>
          <button 
            @click="toggleManaging" 
            class="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-aura-muted hover:text-aura-accent rounded transition-colors"
          >
            {{ isManaging ? 'Visa förslag' : 'Redigera lista' }}
          </button>
        </div>
        
        <!-- Search Bar -->
        <div class="mb-4 relative">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Sök bland förslag..."
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-aura-accent/30 outline-none pr-10"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
            🔍
          </div>
        </div>

        <div v-if="isManaging" class="flex flex-col flex-1 min-h-0">
          <div class="flex gap-2 mb-4 shrink-0">
            <input 
              type="text" 
              v-model="newSuggestion" 
              @keyup.enter="addNewSuggestion"
              placeholder="Lägg till eget förslag..."
              class="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-aura-accent/30 rounded-xl text-sm outline-none transition-colors"
            />
            <button @click="addNewSuggestion" class="px-4 py-2 bg-aura-accent text-white rounded-xl text-sm font-bold hover:shadow-glow transition-all">
              Lägg till
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <div 
              v-for="s in filteredAllSuggestions" 
              :key="s" 
              class="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-aura-accent/20 transition-all"
            >
              <div v-if="editingSuggestion === s" class="flex-1 flex gap-2">
                <input 
                  type="text" 
                  v-model="editingValue"
                  @keyup.enter="saveEdit"
                  class="flex-1 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-aura-accent text-sm outline-none"
                  v-focus
                />
                <button @click="saveEdit" class="text-aura-accent text-xs font-bold">OK</button>
              </div>
              <span v-else class="flex-1 text-sm text-aura-text dark:text-aura-text-dark pr-4">{{ s }}</span>
              
              <div class="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button @click="startEdit(s)" class="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-aura-muted hover:text-aura-accent transition-colors" title="Redigera">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button @click="settingsStore.removeGratitudeSuggestion(s)" class="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-aura-muted hover:text-red-500 transition-colors" title="Radera">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div v-if="filteredAllSuggestions.length === 0" class="py-10 text-center text-aura-muted text-sm italic">
              Inga förslag hittades
            </div>
          </div>
        </div>

        <div v-else class="space-y-4 mb-6 flex-1 overflow-y-auto">
          <p class="text-[0.65rem] uppercase font-black text-aura-muted tracking-widest">{{ $t('gratitude_inspiration_select') }}</p>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="(example, i) in visibleExamples"
              :key="i"
              @click="toggleExample(example)"
              class="w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed group relative flex items-center justify-between"
              :class="selectedExamples.includes(example) ? 'bg-aura-accent/10 border-aura-accent text-aura-text dark:text-aura-text-dark font-medium' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-aura-muted hover:bg-slate-100 dark:hover:bg-slate-800'"
            >
              <span>{{ example }}</span>
              <div v-if="selectedExamples.includes(example)" class="shrink-0 text-aura-accent">
                ✔️
              </div>
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 mt-2">
          <button 
            v-if="!isManaging"
            @click="refreshExamples" 
            class="w-full sm:w-auto px-4 py-2 border border-aura-accent/30 text-aura-accent rounded-[2rem] text-xs font-bold hover:bg-aura-accent/5 transition-all flex items-center justify-center gap-2"
          >
            🔄 {{ $t('slumpa_knapp') }}
          </button>
          <div v-else></div>

          <div class="flex gap-2 w-full sm:w-auto justify-end">
            <button @click="showModal = false" class="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-aura-muted hover:text-aura-text transition-colors">
              {{ $t('cancel') || 'Stäng' }}
            </button>
            <button 
              v-if="!isManaging"
              @click="addSelected" 
              :disabled="selectedExamples.length === 0" 
              class="flex-1 sm:flex-none px-8 py-2 bg-aura-accent text-white rounded-[2rem] text-sm font-bold disabled:opacity-50 transition-all hover:shadow-glow transform active:scale-95"
            >
              Lägg till <span v-if="selectedExamples.length > 0">({{ selectedExamples.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useSettingsStore } from '@/stores/settings'

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

const store = useJournalStore()
const settingsStore = useSettingsStore()

const availableCategories = ['self', 'work', 'family', 'health', 'nature', 'other']

onMounted(() => {
  if (settingsStore.gratitudeSuggestions.length === 0) {
    // Initial data load if needed - though settingsStore handles its own seed
  }
})

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
const isManaging = ref(false)
const searchQuery = ref('')
const newSuggestion = ref('')
const editingSuggestion = ref<string | null>(null)
const editingValue = ref('')

const visibleExamples = ref<string[]>([])
const selectedExamples = ref<string[]>([])

const filteredAllSuggestions = computed(() => {
  const suggestions = settingsStore.gratitudeSuggestions || []
  if (!searchQuery.value) return suggestions
  const q = searchQuery.value.toLowerCase()
  return suggestions.filter(s => s.toLowerCase().includes(q))
})

const refreshExamples = () => {
  const suggestions = filteredAllSuggestions.value
  if (suggestions.length === 0) {
    visibleExamples.value = []
    return
  }
  // If we have a search query, show the best matches, otherwise shuffle
  if (searchQuery.value) {
    visibleExamples.value = suggestions.slice(0, 5)
  } else {
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random())
    visibleExamples.value = shuffled.slice(0, 5)
  }
}

const toggleManaging = () => {
  isManaging.value = !isManaging.value
  editingSuggestion.value = null
  if (!isManaging.value) refreshExamples()
}

const openInspirationModal = () => {
  selectedExamples.value = []
  searchQuery.value = ''
  isManaging.value = false
  refreshExamples()
  showModal.value = true
}

const addNewSuggestion = () => {
  if (!newSuggestion.value || !newSuggestion.value.trim()) return
  settingsStore.addGratitudeSuggestion(newSuggestion.value.trim())
  newSuggestion.value = ''
}

const startEdit = (s: string) => {
  editingSuggestion.value = s
  editingValue.value = s
}

const saveEdit = () => {
  if (editingSuggestion.value && editingValue.value && editingValue.value.trim() && editingValue.value !== editingSuggestion.value) {
    settingsStore.updateGratitudeSuggestion(editingSuggestion.value, editingValue.value.trim())
  }
  editingSuggestion.value = null
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
  
  selectedExamples.value.forEach(ex => {
    const emptyIndex = store.currentEntry.gratitude!.findIndex(g => {
      const text = getItemText(g)
      return !text || text.trim().length === 0
    })
    
    if (emptyIndex > -1) {
      const currentCat = getItemCategory(store.currentEntry.gratitude![emptyIndex])
      store.currentEntry.gratitude![emptyIndex] = currentCat ? `${currentCat}|${ex}` : ex
    } else {
      store.currentEntry.gratitude!.push(ex)
    }
  })
  
  showModal.value = false
  selectedExamples.value = []
}

// Watch search query to refresh examples when searching (only if not managing)
watch(searchQuery, () => {
  if (!isManaging.value) {
    refreshExamples()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(66, 184, 131, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(66, 184, 131, 0.4);
}
</style>

