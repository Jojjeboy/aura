import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNotifications } from '@/composables/useNotifications'
import { setActivePinia, createPinia } from 'pinia'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string) => key
  })
}))

// Mock globalThis.Notification
const mockNotification = {
  permission: 'default',
  requestPermission: vi.fn(),
}

describe('useNotifications Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    globalThis.Notification = mockNotification as unknown as typeof Notification
    mockNotification.permission = 'default'
    mockNotification.requestPermission.mockReset()
  })

  it('updates permission state on request', async () => {
    mockNotification.requestPermission.mockResolvedValue('granted')
    const { requestPermission, notificationPermission } = useNotifications()

    const result = await requestPermission()
    expect(result).toBe(true)
    expect(notificationPermission.value).toBe('granted')
  })

  it('handles denied permission', async () => {
    mockNotification.requestPermission.mockResolvedValue('denied')
    const { requestPermission, notificationPermission } = useNotifications()

    const result = await requestPermission()
    expect(result).toBe(false)
    expect(notificationPermission.value).toBe('denied')
  })

  it('returns true immediately if already granted', async () => {
    mockNotification.permission = 'granted'
    const { requestPermission, notificationPermission } = useNotifications()

    const result = await requestPermission()
    expect(result).toBe(true)
    expect(notificationPermission.value).toBe('granted')
    expect(mockNotification.requestPermission).not.toHaveBeenCalled()
  })
})
