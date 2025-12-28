<template>
  <div class="pb-24 space-y-8 min-h-screen bg-aura-bg dark:bg-aura-bg-dark transition-colors duration-300">
    <div class="px-6 pt-6 space-y-6">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-white dark:hover:bg-aura-card-dark transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-aura-text dark:text-aura-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark">{{ $t('changelog') }}</h1>
      </div>

      <div v-if="loading" class="text-center py-20 text-aura-muted">
        <div class="animate-spin h-8 w-8 border-4 border-aura-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        {{ $t('loading') }}
      </div>

      <div v-else-if="commits.length === 0" class="text-center py-20 bg-white dark:bg-aura-card-dark rounded-card shadow-soft">
        <p class="text-aura-muted">{{ $t('no_commits_found') }}</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="commit in commits"
          :key="commit.hash"
          class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-5 border-l-4 border-aura-accent/30 hover:border-aura-accent transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-aura-muted">
              {{ commit.hash }}
            </span>
            <span class="text-xs text-aura-muted">{{ formatDate(commit.date) }}</span>
          </div>
          <h3 class="text-aura-text dark:text-aura-text-dark font-medium leading-snug">
            {{ commit.message }}
          </h3>
          <p class="text-xs text-aura-muted mt-2 capitalize">
            {{ commit.author }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Commit {
  hash: string
  author: string
  date: string
  message: string
}

const router = useRouter()
const commits = ref<Commit[]>([])
const loading = ref(true)

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}changelog.json`)
    if (response.ok) {
      commits.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load changelog:', error)
  } finally {
    loading.value = false
  }
})
</script>
