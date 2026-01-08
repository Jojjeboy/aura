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
          v-show="index === 0 || (modelValue[index - 1] && modelValue[index - 1]!.length > 0)"
          class="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div
            class="bg-white dark:bg-aura-card-dark rounded-[2rem] shadow-soft p-4 flex items-center gap-4 transition-all duration-300 focus-within:shadow-glow focus-within:ring-1 focus-within:ring-aura-accent/30 relative"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm font-medium shrink-0"
            >
              {{ index + 1 }}
            </div>
            <input
              :id="'section-' + label + '-' + index"
              type="text"
              :value="item"
              @input="updateItem(index, ($event.target as HTMLInputElement).value)"
              :placeholder="placeholder"
              class="w-full bg-transparent border-none outline-none text-aura-text dark:text-aura-text-dark placeholder-aura-muted"
            />
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
}>()

const emit = defineEmits(['update:modelValue'])

const progressHeight = computed(() => {
  const filled = props.modelValue.filter((item) => item && item.trim().length > 0).length
  return `${(filled / 3) * 100}%`
})

const canAddMore = computed(() => {
  const filledCount = props.modelValue.filter((item) => item && item.trim().length > 0).length
  const visibleCount = props.modelValue.filter(
    (item, i) => i === 0 || (props.modelValue[i - 1] && props.modelValue[i - 1]!.length > 0),
  ).length
  return filledCount < 3 && filledCount === visibleCount && props.modelValue.length === 3
})

const updateItem = (index: number, value: string) => {
  const newValue = [...props.modelValue]
  newValue[index] = value
  emit('update:modelValue', newValue)
}

const addMore = () => {
  // Reveal logic is handled by v-show and updateItem.
  // We can add a simple space to the next hidden item to trigger v-show
  // but it's better to let the user type.
}
</script>
