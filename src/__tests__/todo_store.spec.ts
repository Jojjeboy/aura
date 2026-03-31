import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from '@/stores/todo'
import type { Todo } from '@/db'

// We only test the computed logic without Firestore calls
const makeTodo = (overrides: Partial<Todo>): Todo => ({
  id: Math.random().toString(),
  title: 'Test task',
  content: '',
  priority: 'Low',
  completed: false,
  date: new Date().toISOString(),
  synced: 1,
  updatedAt: Date.now(),
  ...overrides
})

describe('Todo Store – sortedTodos computed', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('puts incomplete todos before completed ones', () => {
    const store = useTodoStore()
    store.todos = [
      makeTodo({ id: '1', title: 'Done', completed: true, priority: 'High' }),
      makeTodo({ id: '2', title: 'Pending', completed: false, priority: 'Low' })
    ]

    const sorted = store.sortedTodos
    expect(sorted[0]!.title).toBe('Pending')
    expect(sorted[1]!.title).toBe('Done')
  })

  it('sorts by priority (High > Medium > Low) within same completion group', () => {
    const store = useTodoStore()
    store.todos = [
      makeTodo({ id: '1', title: 'Low task', priority: 'Low', completed: false }),
      makeTodo({ id: '2', title: 'High task', priority: 'High', completed: false }),
      makeTodo({ id: '3', title: 'Medium task', priority: 'Medium', completed: false })
    ]

    const sorted = store.sortedTodos
    expect(sorted[0]!.title).toBe('High task')
    expect(sorted[1]!.title).toBe('Medium task')
    expect(sorted[2]!.title).toBe('Low task')
  })

  it('among same priority, sorts newer dates first', () => {
    const store = useTodoStore()
    const earlier = new Date(Date.now() - 10_000).toISOString()
    const later = new Date().toISOString()

    store.todos = [
      makeTodo({ id: '1', title: 'Older', priority: 'Medium', date: earlier, completed: false }),
      makeTodo({ id: '2', title: 'Newer', priority: 'Medium', date: later, completed: false })
    ]

    const sorted = store.sortedTodos
    expect(sorted[0]!.title).toBe('Newer')
    expect(sorted[1]!.title).toBe('Older')
  })

  it('completed tasks maintain their own priority order among themselves', () => {
    const store = useTodoStore()
    store.todos = [
      makeTodo({ id: '1', title: 'Done Low', completed: true, priority: 'Low' }),
      makeTodo({ id: '2', title: 'Pending', completed: false, priority: 'Low' }),
      makeTodo({ id: '3', title: 'Done High', completed: true, priority: 'High' })
    ]

    const sorted = store.sortedTodos
    expect(sorted[0]!.completed).toBe(false)
    expect(sorted[1]!.title).toBe('Done High')
    expect(sorted[2]!.title).toBe('Done Low')
  })
})
