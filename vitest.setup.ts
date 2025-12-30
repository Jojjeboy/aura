import { vi } from 'vitest'

// Mock Firebase messaging to prevent initialization errors in tests
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('mock-token')),
  onMessage: vi.fn()
}))

// Mock Firebase to prevent initialization
vi.mock('@/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  messaging: {}
}))
