<template>
  <transition name="toast">
    <div
      v-if="visible"
      :class="[
        'flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow-lg',
        'bg-white dark:bg-slate-800',
        'text-slate-500 dark:text-slate-400',
        typeClasses
      ]"
      role="alert"
    >
      <div :class="['inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg', iconBgClasses]">
        <!-- Success Icon -->
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>

        <!-- Error Icon -->
        <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>

        <!-- Warning Icon -->
        <svg v-else-if="toast.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>

        <!-- Info Icon -->
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      </div>

      <div class="ml-3 text-sm font-normal flex-1">{{ toast.message }}</div>

      <button
        @click="$emit('close')"
        type="button"
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Close"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Toast } from '@/composables/useToast'

const props = defineProps<{
  toast: Toast
}>()

defineEmits<{
  close: []
}>()

const visible = ref(false)

const typeClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'border-l-4 border-green-500'
    case 'error':
      return 'border-l-4 border-red-500'
    case 'warning':
      return 'border-l-4 border-amber-500'
    default:
      return 'border-l-4 border-blue-500'
  }
})

const iconBgClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200'
    case 'error':
      return 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200'
    case 'warning':
      return 'text-amber-500 bg-amber-100 dark:bg-amber-800 dark:text-amber-200'
    default:
      return 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200'
  }
})

onMounted(() => {
  visible.value = true
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
