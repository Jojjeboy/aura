<template>
  <div
    v-if="store.showModal"
    class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md animate-in fade-in duration-300"
    @click.self="store.closeQuotes"
  >
    <div
      class="bg-white dark:bg-aura-card-dark rounded-[2.5rem] shadow-glow p-8 max-w-sm w-full relative overflow-hidden animate-in zoom-in-95 duration-300"
    >
      <!-- Background Decoration -->
      <div
        class="absolute -top-12 -right-12 w-32 h-32 bg-aura-accent/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-12 -left-12 w-32 h-32 bg-aura-accent/5 rounded-full blur-3xl"
      ></div>

      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="bg-aura-accent/10 p-4 rounded-full mb-6">
          <svg
            class="w-8 h-8 text-aura-accent"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M11.69 10.633c0 .859-.446 1.355-1.336 1.486l-.371.057c0 1.144.372 1.326.685 1.738.312.411.758.914.758 1.486 0 .801-.65 1.458-1.45 1.458a1.43 1.43 0 0 1-1.449-1.458c0-.984.668-1.921 1.134-2.585.503-.71.503-1.053.503-1.555a1.2 1.2 0 0 0-1.205-1.2c-.663 0-1.202.544-1.202 1.213 0 .172.031.343.093.515-.156.12-.34.186-.53.186-.482 0-.873-.394-.873-.88 0-.964.815-1.748 1.815-1.748 1.057 0 1.933.86 1.933 1.887Zm6.046 0c0 .859-.447 1.355-1.336 1.486l-.372.057c0 1.144.372 1.326.685 1.738.312.411.758.914.758 1.486 0 .801-.65 1.458-1.45 1.458a1.43 1.43 0 0 1-1.448-1.458c0-.984.667-1.921 1.133-2.585.503-.71.503-1.053.503-1.555a1.2 1.2 0 0 0-1.204-1.2c-.664 0-1.203.544-1.203 1.213 0 .172.03.343.092.515-.156.12-.34.186-.53.186-.481 0-.872-.394-.872-.88 0-.964.814-1.748 1.814-1.748 1.058 0 1.934.86 1.934 1.887Z"
            />
          </svg>
        </div>

        <h4 class="text-aura-muted text-[0.6rem] uppercase tracking-[0.2em] font-black mb-4">
          {{ $t('quote_modal_title') }}
        </h4>

        <div class="mb-8">
          <p
            class="text-xl font-bold text-aura-text dark:text-aura-text-dark leading-relaxed mb-4 italic"
          >
            "{{ store.currentQuote?.quote }}"
          </p>
          <p class="text-aura-accent font-bold text-sm">— {{ store.currentQuote?.author }}</p>
        </div>

        <div class="flex flex-col w-full gap-3">
          <button
            @click="store.closeQuotes"
            class="w-full bg-aura-accent text-white py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            {{ $t('quote_dismiss') }}
          </button>
          <button
            @click="store.nextQuote"
            class="w-full bg-slate-100 dark:bg-slate-800 text-aura-muted py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {{ $t('quote_new_quote') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuotesStore } from '@/stores/quotes'

const store = useQuotesStore()
</script>
