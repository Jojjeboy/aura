import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { auth, db } from '@/firebase'
import { doc, setDoc, onSnapshot, collection, serverTimestamp, query, orderBy, type Timestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { useOnline } from '@vueuse/core'

export interface DeviceInfo {
  id: string
  name: string
  lastSync: Timestamp | null
  isOnline: boolean
}

export const useSyncStore = defineStore('sync', () => {
  const deviceId = ref(localStorage.getItem('aura-device-id') || '')
  if (!deviceId.value) {
    deviceId.value = uuidv4()
    localStorage.setItem('aura-device-id', deviceId.value)
  }

  const devices = ref<DeviceInfo[]>([])
  const online = useOnline()
  let unsubscribe: (() => void) | null = null

  const getDeviceName = () => {
    const ua = navigator.userAgent
    if (ua.includes('iPhone')) return 'iPhone'
    if (ua.includes('Android')) return 'Android Device'
    if (ua.includes('iPad')) return 'iPad'
    if (ua.includes('Macintosh')) return 'Mac'
    if (ua.includes('Windows')) return 'Windows PC'
    return 'Web Device'
  }

  const updateDeviceStatus = async () => {
    if (!auth.currentUser) return

    const deviceRef = doc(db, 'users', auth.currentUser.uid, 'devices', deviceId.value)
    await setDoc(deviceRef, {
      id: deviceId.value,
      name: getDeviceName(),
      lastSync: serverTimestamp(),
      isOnline: online.value
    }, { merge: true })
  }

  const startTracking = () => {
    if (!auth.currentUser) return
    if (unsubscribe) unsubscribe()

    const devicesRef = collection(db, 'users', auth.currentUser.uid, 'devices')
    const q = query(devicesRef, orderBy('lastSync', 'desc'))

    unsubscribe = onSnapshot(q, (snapshot) => {
      devices.value = snapshot.docs.map(docSnap => docSnap.data() as DeviceInfo)
    })

    updateDeviceStatus()
  }

  const stopTracking = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  watch(online, () => {
    if (online.value) updateDeviceStatus()
  })

  return {
    deviceId,
    devices,
    startTracking,
    stopTracking,
    updateDeviceStatus
  }
})
