import { ref } from 'vue'

export function useBiometricLock() {
  const isAvailable = ref(false)
  const isAuthenticated = ref(false)

  const checkAvailability = async () => {
    if (globalThis.PublicKeyCredential) {
      isAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
  }

  const authenticate = async () => {
    if (!isAvailable.value) {
      console.warn('Biometrics not available, bypassing')
      isAuthenticated.value = true // Fallback for now or strictly deny
      return true
    }

    try {
      // Create a dummy challenge
      const challenge = new Uint8Array(32);
      globalThis.crypto.getRandomValues(challenge);

      // Request credential
      await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
        }
      })
      isAuthenticated.value = true
      return true
    } catch (e) {
      console.error('Biometric auth failed', e)
      return false
    }
  }

  // Initial check
  checkAvailability()

  return {
    isAvailable,
    isAuthenticated,
    authenticate
  }
}
