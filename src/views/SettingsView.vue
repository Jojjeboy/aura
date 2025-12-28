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

      <!-- Daily Reminder -->
      <section class="space-y-4">
        <h2 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">{{ $t('daily_reminder') }}</h2>
        <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-aura-text dark:text-aura-text-dark">{{ $t('enable_reminder') }}</h3>
              <p class="text-xs text-aura-muted mt-1">{{ $t('reminder_desc') }}</p>
            </div>
            <button
              @click="toggleReminder"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settingsStore.reminderEnabled ? 'bg-aura-accent' : 'bg-slate-300 dark:bg-slate-700'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settingsStore.reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div v-if="settingsStore.reminderEnabled" class="space-y-2">
            <label for="reminder-time" class="text-sm font-medium text-aura-text dark:text-aura-text-dark">{{ $t('reminder_time') }}</label>
            <input
              id="reminder-time"
              v-model="settingsStore.reminderTime"
              @change="handleTimeChange"
              type="time"
              class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-aura-text dark:text-aura-text-dark focus:outline-none focus:ring-2 focus:ring-aura-accent"
            />
            <p v-if="notificationPermission !== 'granted'" class="text-xs text-amber-600 dark:text-amber-400">
              {{ $t('notification_permission_needed') }}
            </p>
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
            <button
               @click="handleForceUpdate"
               class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('check_updates') }}</span>
               <span class="text-xs text-aura-muted">v{{ appVersion }}</span>
            </button>
            <button
               @click="router.push('/changelog')"
               class="w-full flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-colors"
            >
               <span class="text-aura-text dark:text-aura-text-dark font-medium">{{ $t('changelog') }}</span>
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

    <!-- PIN Modal Overlay -->
    <div v-if="showPinPad" class="fixed inset-0 z-50 bg-white/95 dark:bg-aura-bg-dark/95 backdrop-blur-sm flex items-center justify-center">
        <button @click="showPinPad = false" class="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-aura-text dark:text-aura-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <PinPad
          :mode="pinMode"
          :error="pinError"
          @submit="handlePinSubmit"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from '@/composables/useToast'

import PinPad from '@/components/ui/PinPad.vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { updateServiceWorker } = useRegisterSW()
const appVersion = import.meta.env.APP_VERSION

const handleForceUpdate = async () => {
    await updateServiceWorker(true)
}

const router = useRouter()
const settingsStore = useSettingsStore()
const { notificationPermission, requestPermission, scheduleReminder } = useNotifications()
const { success, error, info } = useToast()

const user = ref(auth.currentUser)
const availableLocales = ['en', 'sv']

const showPinPad = ref(false)
const pinMode = ref<'set' | 'confirm' | 'unlock'>('set')
const pinError = ref('')
const tempPin = ref('') // Used to store first entry during setup

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
            success('PIN set successfully!')
        } else {
            pinError.value = 'PINs do not match. Try again.'
            // Reset to set mode?
            setTimeout(() => {
                pinMode.value = 'set'
                tempPin.value = ''
                pinError.value = ''
            }, 1000)
        }
    }
}

const handleRemovePin = async () => {
    if (confirm('Are you sure you want to remove the App Lock?')) {
        await settingsStore.removePin()
        success('App Lock removed!')
    }
}

const toggleReminder = async () => {
    settingsStore.reminderEnabled = !settingsStore.reminderEnabled
    await settingsStore.saveSettings()

    if (settingsStore.reminderEnabled) {
        const granted = await requestPermission()
        if (granted) {
            scheduleReminder()
            success('Daily reminder enabled!')
        } else {
            settingsStore.reminderEnabled = false
            await settingsStore.saveSettings()
            error('Notification permission denied')
        }
    } else {
        info('Daily reminder disabled')
    }
}

const handleTimeChange = async () => {
    await settingsStore.saveSettings()
    if (settingsStore.reminderEnabled) {
        scheduleReminder()
    }
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
