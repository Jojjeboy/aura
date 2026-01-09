<template>
  <div class="space-y-4">
    <label
      :for="'section-' + label"
      class="text-lg font-semibold text-aura-text dark:text-aura-text-dark ml-2 transition-colors duration-300"
    >
      {{ label }}
    </label>

    <div class="relative py-2 pl-6">
      <!-- Glow Line -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-800 rounded-full transition-all duration-500 overflow-hidden"
      >
        <div
          class="absolute left-0 top-0 w-full bg-aura-accent shadow-[0_0_10px_#42b883] transition-all duration-700 ease-out rounded-full"
          :style="{ height: progressHeight }"
        ></div>
      </div>

      <div class="space-y-4">
        <div
          v-for="(item, index) in modelValue"
          :key="index"
          v-show="index === 0 || (modelValue[index - 1] && getItemText(modelValue[index - 1]!) && getItemText(modelValue[index - 1]!).length > 0)"
          class="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div
            class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-soft p-4 flex flex-col gap-3 transition-all duration-300 focus-within:shadow-glow focus-within:ring-1 focus-within:ring-aura-accent/30 relative"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-medium shrink-0"
              >
                {{ index + 1 }}
              </div>
              <input
                :id="'section-' + label + '-' + index"
                type="text"
                :value="getItemText(item)"
                @input="updateItemText(index, ($event.target as HTMLInputElement).value)"
                :placeholder="placeholder"
                class="w-full bg-transparent border-none outline-none text-aura-text dark:text-aura-text-dark placeholder-aura-muted"
              />
            </div>

            <!-- Categories -->
            <div v-if="hasCategories" class="flex flex-wrap gap-2 ml-12">
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

        <!-- Add Button -->
        <button
          v-if="canAddMore"
          @click="addMore"
          type="button"
          class="ml-6 flex items-center gap-2 text-sm font-medium text-aura-accent hover:opacity-80 transition-opacity p-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>{{ $t('journal_add_item') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  placeholder: string
  modelValue: string[]
  hasCategories?: boolean
}>()

const availableCategories = ['self', 'work', 'family', 'health', 'nature', 'other']

const emit = defineEmits(['update:modelValue'])

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

const progressHeight = computed(() => {
  const filled = props.modelValue.filter((item) => {
    const text = getItemText(item)
    return text && text.trim().length > 0
  }).length
  return `${(filled / 3) * 100}%`
})

const canAddMore = computed(() => {
  const filledCount = props.modelValue.filter((item) => {
    const text = getItemText(item)
    return text && text.trim().length > 0
  }).length

  const visibleCount = props.modelValue.filter((_item, i) => {
    if (i === 0) return true
    const prevText = getItemText(props.modelValue[i - 1])
    return prevText && prevText.length > 0
  }).length

  return filledCount < 3 && filledCount === visibleCount && props.modelValue.length === 3
})

const updateItemText = (index: number, text: string) => {
  const newValue = [...props.modelValue]
  const currentCat = getItemCategory(newValue[index])
  newValue[index] = currentCat ? `${currentCat}|${text}` : text
  emit('update:modelValue', newValue)
}

const updateItemCategory = (index: number, category: string) => {
  const newValue = [...props.modelValue]
  const currentText = getItemText(newValue[index])
  if (getItemCategory(newValue[index]) === category) {
    // Toggle off
    newValue[index] = currentText
  } else {
    newValue[index] = `${category}|${currentText}`
  }
  emit('update:modelValue', newValue)
}

const addMore = () => {
  // Logic handled by v-show
}
</script>
