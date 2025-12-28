<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-aura-bg dark:bg-aura-bg-dark p-6 transition-colors duration-300">
    <div class="max-w-md w-full bg-white dark:bg-aura-card-dark rounded-card p-12 shadow-soft border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
      <div class="mb-10 w-28 h-28 mx-auto rounded-3xl dark:rounded-[50%] bg-white flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 overflow-hidden">
        <img src="/logo.jpg" alt="Aura Logo" class="w-20 h-20 object-contain dark:rounded-full" />
      </div>

      <h1 class="text-5xl font-black mb-1 text-slate-800 dark:text-white tracking-tighter">{{ $t('app_name') }}</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium mb-12 tracking-wide uppercase text-xs">{{ $t('login_tagline') }}</p>

      <div class="space-y-6">
        <button
          @click="handleLogin"
          class="w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-800 hover:bg-slate-900 dark:bg-aura-accent dark:hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-glow active:scale-95"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {{ $t('login_google') }}
        </button>
      </div>

      <footer class="mt-16 pt-8 border-t border-slate-50 dark:border-slate-800/50">
        <p class="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold">{{ $t('login_secure') }}</p>
      </footer>
    </div>
  </main>
</template>
