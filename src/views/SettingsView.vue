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
            <div v-else-if="pushToken" class="flex flex-col gap-1">
              <p class="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                Background notifications active
              </p>
              <button
                @click="copyToken"
                class="text-[9px] text-aura-muted hover:text-aura-accent transition-colors text-left"
              >
                Copy Debug Token
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
      message="Are you sure you want to remove the App Lock? This will disable PIN protection for your history."
      confirm-text="Remove Lock"
      cancel-text="Cancel"
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
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/ui/AppModal.vue'

import PinPad from '@/components/ui/PinPad.vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { updateServiceWorker } = useRegisterSW()
const appVersion = import.meta.env.APP_VERSION

const handleForceUpdate = async () => {
    await updateServiceWorker(true)
}

const router = useRouter()
const settingsStore = useSettingsStore()
const { notificationPermission, requestPermission, subscribeToPush, scheduleReminder, saveNotificationPreferences } = useNotifications()
const { success, error, info } = useToast()

const pushToken = ref<string | null>(null)

const copyToken = () => {
    if (pushToken.value) {
        navigator.clipboard.writeText(pushToken.value)
        success('Token copied to clipboard!')
    }
}

const user = ref(auth.currentUser)
const availableLocales = ['en', 'sv']

const showPinPad = ref(false)
const pinMode = ref<'set' | 'confirm' | 'unlock'>('set')
const pinError = ref('')
const tempPin = ref('') // Used to store first entry during setup
const showRemovePinModal = ref(false)

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

const handleRemovePin = () => {
    showRemovePinModal.value = true
}

const confirmRemovePin = async () => {
    showRemovePinModal.value = false
    await settingsStore.removePin()
    success('App Lock removed!')
}
const toggleReminder = async () => {
    // Check if browser supports notifications
    if (globalThis.Notification === undefined) {
        error('Notifications are not supported in this browser.')
        return
    }

    if (settingsStore.reminderEnabled) {
        // Disabling the reminder
        settingsStore.reminderEnabled = false
        pushToken.value = null
        await settingsStore.saveSettings()
        info('Daily reminder disabled')
    } else {
        // If trying to enable, request permission first
        // Check current permission state
        if (globalThis.Notification && globalThis.Notification.permission === 'denied') {
            error('Notifications blocked. Please enable them in your browser settings.')
            return
        }

        // Request permission and subscribe to Push
        const token = await subscribeToPush()
        if (token) {
            pushToken.value = token
            settingsStore.reminderEnabled = true
            await settingsStore.saveSettings()
            scheduleReminder()
            success('Daily reminder enabled with background support!')
        } else {
            // Fallback: If push subscription failed but permission might still be granted
            const granted = await requestPermission()
            if (granted) {
               settingsStore.reminderEnabled = true
               await settingsStore.saveSettings()
               // Re-schedule local notification
               scheduleReminder()

               // Update remote preferences if logged in and enabled
               saveNotificationPreferences()

               success('Daily reminder enabled (foreground only)')
            } else {
               error('Notification permission denied')
            }
        }
    }
}

const handleTimeChange = async () => {
    await settingsStore.saveSettings()
    if (settingsStore.reminderEnabled) {
        scheduleReminder()
        // Save new time to Firestore
        saveNotificationPreferences()
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
