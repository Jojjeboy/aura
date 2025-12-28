<template>
  <div class="pb-24 space-y-8">

    <div class="px-6 space-y-6 pt-6">
      <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark">{{ $t('nav_settings') }}</h1>

      <!-- Theme & Language -->
      <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings.preferences') }}</h2>
         <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 space-y-6">
            <!-- Language -->
             <div class="flex justify-between items-center">
              <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('language') }}</span>
              <div class="flex gap-2">
                 <button
                  v-for="locale in availableLocales"
                  :key="locale"
                  @click="settingsStore.setLocale(locale)"
                  class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                  :class="settingsStore.locale === locale
                    ? 'bg-aura-accent text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
                >
                  {{ locale.toUpperCase() }}
                </button>
              </div>
            </div>

            <!-- Biometric Lock -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('biometric_lock') }}</span>
                  <span class="text-xs text-aura-muted max-w-[200px]">{{ $t('biometric_lock_desc') }}</span>
                </div>
                <button
                  @click="settingsStore.setBiometricLock(!settingsStore.biometricLock)"
                  class="w-12 h-6 rounded-full transition-colors relative shrink-0"
                  :class="settingsStore.biometricLock ? 'bg-aura-accent' : 'bg-slate-200 dark:bg-slate-700'"
                >
                  <div
                    class="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                    :class="settingsStore.biometricLock ? 'left-7' : 'left-1'"
                  ></div>
                </button>
              </div>
            </div>
         </div>
      </section>

      <!-- Features -->
      <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings.features') }}</h2>
         <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-1 space-y-1">
            <button
              @click="router.push('/notes')"
              class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('settings.my_notes') }}</span>
               <span class="text-aura-muted">→</span>
            </button>
         </div>
      </section>

      <!-- Account -->
       <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings.account') }}</h2>

         <div v-if="user" class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 flex items-center gap-4">
            <img
              v-if="user.photoURL"
              :src="user.photoURL"
              alt="Profile"
              class="w-12 h-12 rounded-full border-2 border-aura-accent/20"
            >
            <div class="flex-1 min-w-0">
               <h3 class="font-bold text-aura-text dark:text-aura-text-dark truncate">{{ user.displayName }}</h3>
               <p class="text-sm text-aura-muted truncate">{{ user.email }}</p>
            </div>
         </div>

         <button
            @click="logout"
            class="w-full bg-slate-200 dark:bg-slate-800 text-aura-text dark:text-aura-text-dark py-3 rounded-card font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
         >
            {{ $t('settings.logout') }}
         </button>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'

const router = useRouter()
const settingsStore = useSettingsStore()

const user = ref(auth.currentUser)
const availableLocales = ['en', 'sv']

const logout = async () => {
  try {
    await signOut(auth)
    router.replace('/login')
  } catch (error) {
    console.error('Logout failed', error)
  }
}
</script>
