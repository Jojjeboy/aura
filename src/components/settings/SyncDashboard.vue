<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between px-2">
      <h3 class="text-sm font-semibold text-aura-muted uppercase tracking-wider">
        {{ $t('sync_active_devices') }}
      </h3>
      <div class="flex items-center gap-2">
        <div :class="online ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full shadow-glow"></div>
        <span class="text-[10px] uppercase font-bold text-aura-muted">
          {{ online ? $t('sync_status_online') : $t('sync_status_offline') }}
        </span>
      </div>
    </div>

    <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft overflow-hidden">
      <div v-if="syncStore.devices.length === 0" class="p-8 text-center text-aura-muted text-sm italic">
        {{ $t('loading') }}
      </div>
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div
          v-for="device in syncStore.devices"
          :key="device.id"
          class="p-4 flex items-center justify-between group"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
              :class="device.id === syncStore.deviceId ? 'bg-aura-accent/10 text-aura-accent' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'"
            >
              {{ getDeviceIcon(device.name) }}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2">
                {{ device.name }}
                <span v-if="device.id === syncStore.deviceId" class="text-[8px] px-1.5 py-0.5 bg-aura-accent/10 text-aura-accent rounded uppercase font-black tracking-tighter">
                  {{ $t('sync_this_device') }}
                </span>
              </span>
              <span class="text-[10px] text-aura-muted">
                {{ $t('sync_last_synced') }}: {{ formatLastSync(device.lastSync) }}
              </span>
            </div>
          </div>
          <div
            class="px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-colors"
            :class="device.isOnline ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
          >
            {{ device.isOnline ? 'Active' : 'Idle' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSyncStore } from '@/stores/sync'
import { useOnline } from '@vueuse/core'
import { onMounted, onUnmounted } from 'vue'
import type { Timestamp } from 'firebase/firestore'

const syncStore = useSyncStore()
const online = useOnline()

const getDeviceIcon = (name: string) => {
  if (name.includes('iPhone')) return '📱'
  if (name.includes('Android')) return '🤖'
  if (name.includes('iPad')) return '📟'
  if (name.includes('Mac')) return '💻'
  if (name.includes('Windows')) return '🖥️'
  return '🌐'
}

const formatLastSync = (timestamp: Timestamp | null) => {
  if (!timestamp) return '...'
  const date = timestamp.toMillis ? new Date(timestamp.toMillis()) : new Date(Number(timestamp))
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

onMounted(() => {
  syncStore.startTracking()
})

onUnmounted(() => {
  syncStore.stopTracking()
})
</script>
