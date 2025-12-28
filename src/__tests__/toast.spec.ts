import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast Composable', () => {
  beforeEach(() => {
    // Reset toasts before each test
    // Since useToast uses a global ref, we might need to manually clear it if it's exported
    // For now we'll assume a fresh state if possible or just test the behavior
  })

  it('adds a success toast', () => {
    const { success, toasts } = useToast()
    success('Operation successful')

    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].message).toBe('Operation successful')
    expect(toasts.value[0].type).toBe('success')
  })

  it('adds an error toast', () => {
    const { error, toasts } = useToast()
    // Clear previous toasts if any
    toasts.value = []

    error('Something went wrong')

    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].message).toBe('Something went wrong')
    expect(toasts.value[0].type).toBe('error')
  })

  it('removes a toast after timeout', async () => {
    vi.useFakeTimers()
    const { success, toasts } = useToast()
    toasts.value = []

    success('Quick message')
    expect(toasts.value.length).toBe(1)

    // Advance timers
    vi.advanceTimersByTime(3100)

    expect(toasts.value.length).toBe(0)
    vi.useRealTimers()
  })

  it('allows manual removal of toast', () => {
    const { success, remove, toasts } = useToast()
    toasts.value = []

    success('Message to remove')
    const id = toasts.value[0].id

    remove(id)
    expect(toasts.value.length).toBe(0)
  })
})
