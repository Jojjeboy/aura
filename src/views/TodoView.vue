<template>
  <div class="pb-24 space-y-6 min-h-screen bg-aura-bg dark:bg-aura-bg-dark transition-colors duration-300">
    <div class="px-6 py-4 flex justify-between items-center bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md">
      <div class="flex items-center gap-3">
         <button @click="router.back()" class="flex items-center gap-2 text-aura-text dark:text-aura-text-dark text-lg font-medium group transition-colors">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
            </svg>
            <span>{{ $t('nav_settings') }}</span>
         </button>
      </div>
      <button
        @click="openCreate"
        class="w-10 h-10 rounded-full bg-aura-accent text-white flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
      >
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
        </svg>
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Create/Edit Form -->
      <div v-if="showCreate" class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
        <div class="flex justify-between items-center mb-2">
           <h3 class="text-sm font-semibold text-aura-muted uppercase">{{ editingId ? $t('edit_todo') : $t('add_todo') }}</h3>
           <button @click="closeForm" class="text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors">
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.9 6M6 6l11.9 12"/>
              </svg>
           </button>
        </div>
        <input
          v-model="todoTitle"
          type="text"
          :placeholder="$t('todo_title')"
          class="w-full bg-transparent text-lg font-bold text-aura-text dark:text-aura-text-dark outline-none placeholder-aura-muted"
        />
        <textarea
          v-model="todoContent"
          :placeholder="$t('todo_placeholder')"
          class="w-full bg-transparent text-aura-text dark:text-aura-text-dark outline-none resize-none h-32 placeholder-aura-muted"
        ></textarea>

        <!-- Priority Selection -->
        <div class="space-y-2">
          <p class="text-[10px] uppercase tracking-wider text-aura-muted font-bold">Priority</p>
          <div class="flex gap-2">
            <button
              v-for="p in ['Low', 'Medium', 'High']"
              :key="p"
              @click="todoPriority = p as 'Low' | 'Medium' | 'High'"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition-all border"
              :class="{
                'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400': todoPriority === p && p === 'Low',
                'bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400': todoPriority === p && p === 'Medium',
                'bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400': todoPriority === p && p === 'High',
                'bg-transparent border-slate-100 dark:border-slate-800 text-aura-muted hover:bg-slate-50 dark:hover:bg-slate-800/50': todoPriority !== p
              }"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
           <button
             @click="saveTodo"
             class="px-6 py-2 bg-aura-accent text-white rounded-full font-medium shadow-glow hover:shadow-lg transition-all"
             :disabled="!todoTitle && !todoContent"
           >{{ editingId ? 'Update' : 'Save' }}</button>
        </div>
      </div>

      <!-- Todos List -->
      <div v-if="store.loading" class="text-center text-aura-muted py-8 max-w-sm mx-auto">Loading tasks...</div>

      <div v-else-if="store.todos.length === 0 && !showCreate" class="text-center text-aura-muted py-12">
        <p>No tasks yet. Tap + to create one.</p>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="todo in store.sortedTodos"
          :key="todo.id"
          class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft hover:shadow-md transition-all group relative border-l-4"
          :class="[
            todo.completed ? 'opacity-60 border-transparent grayscale-[0.5]' : {
              'border-slate-200 dark:border-slate-700': todo.priority === 'Low',
              'border-indigo-400/50 dark:border-indigo-800/50': todo.priority === 'Medium',
              'border-rose-400/50 dark:border-rose-800/50': todo.priority === 'High'
            }
          ]"
        >
          <div class="flex gap-4">
            <!-- Checkbox -->
            <button
              @click="store.toggleTodo(todo.id)"
              class="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
              :class="todo.completed
                ? 'bg-aura-accent border-aura-accent text-white scale-110 shadow-glow'
                : 'border-slate-200 dark:border-slate-700 hover:border-aura-accent'"
            >
              <svg v-if="todo.completed" class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </button>

            <div @click="openEdit(todo)" class="cursor-pointer flex-1 min-w-0">
              <div class="flex justify-between items-start mb-2 pr-8">
                <h3
                  class="font-bold text-aura-text dark:text-aura-text-dark transition-all"
                  :class="{ 'line-through opacity-70': todo.completed }"
                >
                  {{ todo.title || 'Untitled' }}
                </h3>
                <span
                  v-if="!todo.completed"
                  class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border"
                  :class="{
                    'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700': todo.priority === 'Low',
                    'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/50': todo.priority === 'Medium',
                    'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50': todo.priority === 'High'
                  }"
                >
                  {{ todo.priority }}
                </span>
              </div>
              <p
                class="text-sm text-aura-text/80 dark:text-aura-text-dark/80 line-clamp-3 whitespace-pre-wrap transition-all"
                :class="{ 'line-through opacity-50': todo.completed }"
              >
                {{ todo.content }}
              </p>
              <div class="mt-4 text-[10px] text-aura-muted uppercase font-bold tracking-tight">
                {{ new Date(todo.date).toLocaleDateString() }}
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <button
            @click.stop="confirmDelete(todo.id)"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
            :title="$t('delete_todo')"
          >
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AppModal
      :show="showDeleteModal"
      :title="$t('delete_todo')"
      :message="$t('delete_confirm')"
      :confirm-text="$t('delete_todo')"
      :cancel-text="$t('cancel_edit')"
      type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todo'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/ui/AppModal.vue'
import type { Todo } from '@/db'

const router = useRouter()
const store = useTodoStore()
const { success } = useToast()
const showCreate = ref(false)

// Form State
const editingId = ref<string | null>(null)
const todoTitle = ref('')
const todoContent = ref('')
const todoPriority = ref<'Low' | 'Medium' | 'High'>('Low')
const todoCompleted = ref(false)
const showDeleteModal = ref(false)
const todoIdToDelete = ref<string | null>(null)

onMounted(() => {
  store.loadTodos()
})

onUnmounted(() => {
  store.clearTodos()
})

const openCreate = () => {
  editingId.value = null
  todoTitle.value = ''
  todoContent.value = ''
  todoPriority.value = 'Low'
  todoCompleted.value = false
  showCreate.value = true
}

const openEdit = (todo: Todo) => {
  editingId.value = todo.id
  todoTitle.value = todo.title
  todoContent.value = todo.content
  todoPriority.value = todo.priority || 'Low'
  todoCompleted.value = todo.completed || false
  showCreate.value = true
}

const saveTodo = async () => {
  if (!todoTitle.value && !todoContent.value) return

  if (editingId.value) {
    await store.updateTodo(editingId.value, todoTitle.value, todoContent.value, todoPriority.value, todoCompleted.value)
    success('Task updated!')
  } else {
    await store.addTodo(todoTitle.value, todoContent.value, todoPriority.value)
    success('Task saved!')
  }

  closeForm()
}

const confirmDelete = (id: string) => {
  todoIdToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (todoIdToDelete.value) {
    await store.deleteTodo(todoIdToDelete.value)
    success('Task deleted')
    showDeleteModal.value = false
    todoIdToDelete.value = null
  }
}

const closeForm = () => {
  showCreate.value = false
  editingId.value = null
  todoTitle.value = ''
  todoContent.value = ''
  todoPriority.value = 'Low'
  todoCompleted.value = false
}
</script>
