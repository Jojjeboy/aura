import { ref } from 'vue'

export function useBiometricLock() {
  const isAvailable = ref(false)
  const isAuthenticated = ref(false)

  const checkAvailability = async () => {
    if (globalThis.PublicKeyCredential) {
      isAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
  }

  const register = async (): Promise<boolean> => {
    if (!isAvailable.value) return false

    try {
      const challenge = new Uint8Array(32)
      globalThis.crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Aura Journal",
            id: window.location.hostname
          },
          user: {
            id: Uint8Array.from("USER_ID", c => c.charCodeAt(0)),
            name: "user@aura.app",
            displayName: "Aura User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces built-in sensor (Fingerprint/Face)
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        }
      })

      return !!credential
    } catch (e) {
      console.error('Biometric registration failed', e)
      return false
    }
  }

  const authenticate = async (): Promise<boolean> => {
    if (!isAvailable.value) {
      console.warn('Biometrics not available')
      return true // Bypass if hardware not present
    }

    try {
      const challenge = new Uint8Array(32)
      globalThis.crypto.getRandomValues(challenge)

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          // We let the browser offer available credentials, but generally 'platform' created ones
          // will auto-trigger the sensor.
        }
      })

      if (assertion) {
        isAuthenticated.value = true
        return true
      }
      return false
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
    register,
    authenticate
  }
}
