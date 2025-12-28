<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FooterNav from '@/components/ui/FooterNav.vue'
import AuraHeader from '@/components/ui/AuraHeader.vue'
import ReloadPrompt from '@/components/ui/ReloadPrompt.vue'
import AppToast from '@/components/ui/AppToast.vue'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useNotifications } from '@/composables/useNotifications'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { t, locale } = useI18n()
const { init } = useNotifications()
const { toasts, remove: removeToast } = useToast()

const updateTitle = () => {
  const appName = t('app_name')
  const pageTitle = route.name ? t(`page_titles.${String(route.name)}`) : ''

  if (pageTitle && pageTitle !== `page_titles.${String(route.name)}`) {
    document.title = `${appName} - ${pageTitle}`
  } else {
    // Fallback to app name and sub title if no specific page title
    document.title = `${appName} - ${t('app_sub_title')}`
  }
}

watch([() => route.name, () => locale.value], updateTitle)
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    settingsStore.loadSettings()
  } else {
    settingsStore.clearSettings()
  }
}, { immediate: true })

onMounted(() => {
  updateTitle()
  if (authStore.user) {
    settingsStore.loadSettings()
    // Initialize notification system
    init()
  }
})
</script>

<template>
  <ReloadPrompt />

  <!-- Toast Container -->
  <div class="fixed top-20 right-4 z-50 flex flex-col items-end space-y-2">
    <AppToast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
      @close="removeToast(toast.id)"
    />
  </div>

  <AuraHeader v-if="route.name && route.name !== 'login'" />
  <RouterView />
  <FooterNav v-if="route.name && route.name !== 'login'" />
</template>
