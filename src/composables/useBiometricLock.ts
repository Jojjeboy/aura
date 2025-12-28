import { ref } from 'vue'

export function useBiometricLock() {
  const isAvailable = ref(false)
  const isAuthenticated = ref(false)

  const checkAvailability = async () => {
    if (globalThis.PublicKeyCredential) {
      isAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
  }

  const register = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAvailable.value) return { success: false, error: 'Hardware not available' }

    // WebAuthn requires HTTPS or localhost
    if (!globalThis.isSecureContext) {
      return { success: false, error: 'Biometrics require HTTPS (Secure Context).' }
    }

    try {
      const challenge = new Uint8Array(32)
      globalThis.crypto.getRandomValues(challenge)

      const userId = new Uint8Array(16)
      globalThis.crypto.getRandomValues(userId)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Aura Journal",
            // Use current hostname but handle potential port issues or subdomains by keeping it simple
            id: globalThis.location.hostname
          },
          user: {
            id: userId,
            name: "user@aura.app",
            displayName: "Aura User"
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" } // RS256 (Common on Android)
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: "none"
        }
      })

      return { success: !!credential }
    } catch (e: unknown) {
      console.error('Biometric registration failed', e)
      const errorMessage = e instanceof Error ? e.message : 'Unknown registration error'
      return { success: false, error: errorMessage }
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
