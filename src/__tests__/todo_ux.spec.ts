import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TodoView from '@/views/TodoView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useTodoStore } from '@/stores/todo'

// Mock generic components
const AppModalStub = {
  template: '<div><slot /></div>',
  props: ['show', 'title', 'message', 'confirmText', 'cancelText', 'type']
}

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn()
  }))
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      nav_settings: 'Settings',
      delete_todo: 'Delete',
      edit_todo: 'Edit',
      add_todo: 'Add Task',
      todo_title: 'Title',
      todo_content: 'Content',
      todo_placeholder: 'Task name',
      delete_confirm: 'Sure?',
      cancel_edit: 'Cancel'
    }
  }
})

describe('TodoView Collapsible UX', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useTodoStore()
    store.loadTodos = vi.fn()
    store.todos = [
      {
        id: '1',
        title: 'Task 1',
        content: 'Content 1',
        priority: 'High',
        completed: false,
        date: new Date().toISOString(),
        synced: 1,
        updatedAt: Date.now()
      },
      {
        id: '2',
        title: 'Task 2',
        content: 'Content 2',
        priority: 'Low',
        completed: true,
        date: new Date().toISOString(),
        synced: 1,
        updatedAt: Date.now()
      }
    ]
  })

  it('renders collapsed state initially', async () => {
    const wrapper = mount(TodoView, {
      global: {
        plugins: [i18n],
        stubs: { AppModal: AppModalStub }
      }
    })
    await flushPromises()

    // Should see titles
    expect(wrapper.text()).toContain('Task 1')

    // Should NOT see content initially (collapsed)
    // Note: Our implementation technically renders content but hides it or styles it differently.
    // However, if using v-if="expandedTodoId === todo.id", it should be missing from DOM.
    expect(wrapper.text()).not.toContain('Content 1')
  })

  it('expands item on click', async () => {
    const wrapper = mount(TodoView, {
      global: {
        plugins: [i18n],
        stubs: { AppModal: AppModalStub }
      }
    })
    await flushPromises()

    const firstTodo = wrapper.find('.cursor-pointer')
    await firstTodo.trigger('click')

    // Now content should necessarily be visible
    expect(wrapper.text()).toContain('Content 1')

    // Check for "Focus Mode" class (shadow-glow) on the parent card
    // The .cursor-pointer is on the header, but the class is on the parent (which might not have .cursor-pointer anymore)
    // We need to find the card that contains the text "Task 1"
    const card = wrapper.findAll('.group').find(el => el.text().includes('Task 1'))
    expect(card?.classes()).toContain('shadow-glow')
  })

  it('collapses item when clicking again', async () => {
    const wrapper = mount(TodoView, {
      global: {
        plugins: [i18n],
        stubs: { AppModal: AppModalStub }
      }
    })
    await flushPromises()

    const firstTodo = wrapper.find('.cursor-pointer')

    // Expand
    await firstTodo.trigger('click')
    expect(wrapper.text()).toContain('Content 1')

    // Collapse
    await firstTodo.trigger('click')
    expect(wrapper.text()).not.toContain('Content 1')
    expect(firstTodo.classes()).not.toContain('shadow-glow')
  })
})
