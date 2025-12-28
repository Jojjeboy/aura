import { ref } from 'vue'
import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  // Initialize auth listener
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        loading.value = false
        resolve()
      })
    })
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const reauthenticate = async (): Promise<boolean> => {
    if (!user.value) return false
    try {
      // For simplicity in this flow, general sign-in works as verification
      // since we aren't doing strict sensitive re-auth (updatePassword etc)
      // but just logic-gating.
      // Ideally use reauthenticateWithPopup if strictly following Firebase re-auth rules,
      // but signInWithPopup for same provider generally works or throws if mismatch.
      const provider = new GoogleAuthProvider()
      // Force account selection to ensure they don't just auto-click through if multiple accounts
      provider.setCustomParameters({ prompt: 'select_account' })

      const result = await signInWithPopup(auth, provider)
      // Verify it's the same user
      return result.user.uid === user.value.uid
    } catch (e) {
      console.error('Re-auth failed', e)
      return false
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { user, loading, initAuth, loginWithGoogle, logout, reauthenticate }
})
