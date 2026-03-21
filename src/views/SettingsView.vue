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

            <!-- App Lock (PIN) -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex justify-between items-start">
                <div class="flex flex-col">
                  <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('app_lock') }}</span>
                  <span class="text-xs text-aura-muted max-w-[200px]">{{ $t('app_lock_desc') }}</span>
                </div>

                <div v-if="settingsStore.pinHash" class="flex items-center gap-2">
                   <button
                     @click="openPinPad('set')"
                     class="text-xs font-bold text-aura-accent hover:underline"
                   >
                     {{ $t('change_pin') }}
                   </button>
                   <div class="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                   <button
                     @click="handleRemovePin"
                     class="text-xs font-bold text-red-500 hover:opacity-70"
                   >
                     {{ $t('turn_off_lock') }}
                   </button>
                </div>

                <button
                  v-else
                  @click="openPinPad('set')"
                  class="bg-slate-200 dark:bg-slate-700 text-aura-text dark:text-aura-text-dark px-3 py-1 rounded-full text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {{ $t('set_pin') }}
                </button>
              </div>
            </div>
         </div>
      </section>

      <!-- Post-Logging Inspiration -->
      <section class="space-y-4">
        <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('quote_modal_title') }}</h2>
        <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-aura-text dark:text-aura-text-dark">{{ $t('settings_show_quotes') }}</h3>
              <p class="text-xs text-aura-muted mt-1">{{ $t('settings_show_quotes_desc') }}</p>
            </div>
            <button
              @click="settingsStore.showQuotesAfterLogging = !settingsStore.showQuotesAfterLogging"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settingsStore.showQuotesAfterLogging ? 'bg-aura-accent' : 'bg-slate-300 dark:bg-slate-700'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settingsStore.showQuotesAfterLogging ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings.features') }}</h2>
         <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-1 space-y-1">
            <button
              @click="router.push('/todo')"
              class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors group"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('settings.todo_list') }}</span>
               <svg class="w-5 h-5 text-aura-muted group-hover:translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
               </svg>
            </button>
            <button
               @click="handleForceUpdate"
               class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('check_updates') }}</span>
               <span class="text-xs text-aura-muted">v{{ appVersion }}</span>
            </button>
            <button
               @click="router.push('/changelog')"
               class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors group"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('changelog') }}</span>
               <svg class="w-5 h-5 text-aura-muted group-hover:translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
               </svg>
            </button>
         </div>
      </section>

      <!-- Custom Moods -->
      <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings_custom_moods') }}</h2>
         <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-1">
            <button
               @click="router.push('/settings/custom-moods')"
               class="w-full flex items-center justify-between p-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-card"
            >
               <div class="flex items-center gap-3">
                  <span class="text-xl">✨</span>
                  <div class="flex flex-col items-start text-left">
                     <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('settings_custom_moods') }}</span>
                     <span class="text-xs text-aura-muted">{{ settingsStore.customMoods.length }} {{ $t('mood_labels_total') || 'items' }}</span>
                  </div>
               </div>
               <svg class="w-5 h-5 text-aura-muted group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
               </svg>
            </button>
         </div>
      </section>

      <!-- Data Management -->
      <section class="space-y-4">
         <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('settings_data_mgmt') }}</h2>
         <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-1">
            <button
               @click="exportData"
               class="w-full flex items-center justify-between p-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-card"
            >
               <div class="flex items-center gap-3">
                  <span class="text-xl">💾</span>
                  <div class="flex flex-col items-start text-left">
                     <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('settings_export_data') }}</span>
                     <span class="text-xs text-aura-muted">{{ $t('settings_export_desc') }}</span>
                  </div>
               </div>
               <svg class="w-5 h-5 text-aura-muted group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
            </button>
         </div>
      </section>

      <!-- Sync Dashboard -->
      <section v-if="authStore.user">
        <SyncDashboard />
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

    <!-- PIN Modal Overlay -->
    <div v-if="showPinPad" class="fixed inset-0 z-50 bg-white/95 dark:bg-aura-bg-dark/95 backdrop-blur-sm flex items-center justify-center">
         <button @click="showPinPad = false" class="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <svg class="w-6 h-6 text-aura-text dark:text-aura-text-dark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.9 6M6 6l11.9 12"/>
            </svg>
         </button>
        <PinPad
          :mode="pinMode"
          :error="pinError"
          @submit="handlePinSubmit"
        />
    </div>

    <!-- Modals -->
    <AppModal
      :show="showRemovePinModal"
      :title="$t('turn_off_lock')"
      :message="$t('remove_lock_confirm_msg')"
      :confirm-text="$t('remove_lock_button')"
      :cancel-text="$t('cancel')"
      type="danger"
      @confirm="confirmRemovePin"
      @cancel="showRemovePinModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/ui/AppModal.vue'
import { useI18n } from 'vue-i18n'

import PinPad from '@/components/ui/PinPad.vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useJournalStore } from '@/stores/journal'
import { useAuthStore } from '@/stores/auth'
import SyncDashboard from '@/components/settings/SyncDashboard.vue'

const { updateServiceWorker } = useRegisterSW()
const appVersion = import.meta.env.APP_VERSION

const handleForceUpdate = async () => {
    await updateServiceWorker(true)
}

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { success } = useToast()
const { t } = useI18n()

const user = ref(auth.currentUser)
const availableLocales = ['en', 'sv']

const showPinPad = ref(false)
const pinMode = ref<'set' | 'confirm' | 'unlock'>('set')
const pinError = ref('')
const tempPin = ref('') // Used to store first entry during setup
const showRemovePinModal = ref(false)

// Custom Mood Management
// Moved to CustomMoodsSettingsView.vue

const openPinPad = (mode: 'set' | 'confirm') => {
    pinMode.value = mode
    tempPin.value = ''
    pinError.value = ''
    showPinPad.value = true
}

const handlePinSubmit = async (pin: string) => {
    pinError.value = ''

    if (pinMode.value === 'set') {
        // First step of setting PIN
        tempPin.value = pin
        pinMode.value = 'confirm'
    } else if (pinMode.value === 'confirm') {
        // Verification step
        if (pin === tempPin.value) {
            await settingsStore.setPin(pin)
            showPinPad.value = false
            success(t('pin_setup_success'))
        } else {
            pinError.value = t('pin_mismatch')
            // Reset to set mode?
            setTimeout(() => {
                pinMode.value = 'set'
                tempPin.value = ''
                pinError.value = ''
            }, 1000)
        }
    }
}

const handleRemovePin = () => {
    showRemovePinModal.value = true
}

const confirmRemovePin = async () => {
    showRemovePinModal.value = false
    await settingsStore.removePin()
    success(t('app_lock_removed'))
}

const journalStore = useJournalStore()
const exportData = () => {
  const data = JSON.stringify(journalStore.entries, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `aura-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  success(t('settings_export_success'))
}

const logout = async () => {
  try {
    await signOut(auth)
    router.replace('/login')
  } catch (error) {
    console.error('Logout failed', error)
  }
}
</script>
