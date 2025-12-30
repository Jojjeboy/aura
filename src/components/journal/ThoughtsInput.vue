<template>
  <div class="space-y-3">
    <label for="thoughts-textarea" class="text-lg font-semibold text-aura-text dark:text-aura-text-dark ml-2 transition-colors duration-300">
      {{ $t('thoughts_label') }}
    </label>
    <div class="relative group">
      <textarea
        id="thoughts-textarea"
        v-model="store.currentEntry.thoughts"
        :placeholder="$t('thoughts_placeholder')"
        rows="4"
        class="w-full px-5 py-4 bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark rounded-[1.5rem] border-2 border-transparent focus:border-aura-accent/30 shadow-soft focus:shadow-glow transition-all duration-300 resize-none outline-none placeholder:text-aura-muted/50"
        @input="adjustHeight"
        ref="textarea"
      ></textarea>

      <!-- Subtle Decorative Element -->
      <div class="absolute bottom-4 right-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
        <svg class="w-6 h-6 text-aura-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useJournalStore } from '@/stores/journal'

const store = useJournalStore()
const textarea = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = `${textarea.value.scrollHeight}px`
  }
}

onMounted(() => {
  adjustHeight()
})
</script>

<style scoped>
textarea {
  min-height: 120px;
  max-height: 400px;
  line-height: 1.6;
}
</style>
