<template>
  <div
    class="pb-24 space-y-6 min-h-screen bg-aura-bg dark:bg-aura-bg-dark transition-colors duration-300"
  >
    <div
      class="px-6 py-4 flex justify-between items-center bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md"
    >
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-aura-text dark:text-aura-text-dark text-lg font-medium group transition-colors"
        >
          <svg
            class="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M5 12l4-4m-4 4 4 4"
            />
          </svg>
          <span>{{ $t('nav_settings') }}</span>
        </button>
      </div>
      <button
        @click="openCreate"
        class="w-10 h-10 rounded-full bg-aura-accent text-white flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
      >
        <svg
          class="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14m-7 7V5"
          />
        </svg>
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Todos List -->
      <div v-if="store.loading" class="text-center text-aura-muted py-8 max-w-sm mx-auto">
        {{ $t('loading_tasks') }}
      </div>

      <div
        v-else-if="store.todos.length === 0 && !showForm"
        class="text-center text-aura-muted py-12"
      >
        <p>{{ $t('no_tasks') }}</p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="todo in store.sortedTodos"
          :key="todo.id"
          class="bg-white dark:bg-aura-card-dark rounded-card p-5 shadow-soft transition-all duration-300 group relative border-l-4 overflow-hidden"
          :class="[
            todo.completed
              ? 'opacity-60 border-transparent grayscale-[0.5]'
              : {
                  'border-slate-200 dark:border-slate-600': todo.priority === 'Low',
                  'border-indigo-400/50 dark:border-indigo-800/50': todo.priority === 'Medium',
                  'border-rose-400/50 dark:border-rose-800/50': todo.priority === 'High',
                },
            expandedTodoId === todo.id
              ? 'shadow-glow ring-1 ring-aura-accent/30 scale-[1.02] z-10'
              : 'hover:shadow-md hover:scale-[1.01]',
          ]"
        >
          <div class="flex gap-4 items-start">
            <!-- Checkbox -->
            <button
              @click.stop="store.toggleTodo(todo.id)"
              class="mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
              :class="
                todo.completed
                  ? 'bg-aura-accent border-aura-accent text-white scale-110 shadow-glow'
                  : 'border-slate-200 dark:border-slate-700 hover:border-aura-accent'
              "
            >
              <svg
                v-if="todo.completed"
                class="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            <div class="flex-1 min-w-0">
              <!-- Header: Title & Priority -->
              <div
                @click="toggleExpand(todo.id)"
                class="flex justify-between items-center mb-1 cursor-pointer select-none"
              >
                <h3
                  class="font-bold text-aura-text dark:text-aura-text-dark transition-all text-base"
                  :class="{ 'line-through opacity-70': todo.completed }"
                >
                  {{ todo.title || $t('todo_untitled') }}
                </h3>

                <span
                  v-if="!todo.completed"
                  class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ml-2 shrink-0"
                  :class="{
                    'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600':
                      todo.priority === 'Low',
                    'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800/50':
                      todo.priority === 'Medium',
                    'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800/50':
                      todo.priority === 'High',
                  }"
                >
                  {{ $t(`priorities.${todo.priority}`) }}
                </span>
              </div>

              <!-- Expanded Content -->
              <div
                v-if="expandedTodoId === todo.id"
                class="animate-in slide-in-from-top-2 fade-in duration-300"
              >
                <p
                  class="mt-3 text-sm text-aura-text/80 dark:text-aura-text-dark/80 whitespace-pre-wrap leading-relaxed"
                  :class="{ 'line-through opacity-50': todo.completed }"
                >
                  {{ todo.content }}
                </p>

                <div
                  class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-end"
                >
                  <div class="text-[10px] text-aura-muted uppercase font-bold tracking-tight">
                    {{ new Date(todo.date).toLocaleDateString() }}
                  </div>

                  <div class="flex gap-2">
                    <!-- Edit Button -->
                    <button
                      @click.stop="openEdit(todo)"
                      class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-aura-accent hover:bg-aura-accent/10 transition-all shadow-sm"
                      :title="$t('edit_todo')"
                    >
                      <svg
                        class="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m14.3 4.8 2.9 2.9M7 7H4a1 1 0 0 0-1 1v10c0 .6.4 1 1 1h11c.6 0 1-.4 1-1v-4.5m2.4-10a2 2 0 0 1 0 3l-6.8 6.8L8 14l.7-3.6 6.9-6.8a2 2 0 0 1 2.8 0Z"
                        />
                      </svg>
                    </button>

                    <!-- Delete Button -->
                    <button
                      @click.stop="confirmDelete(todo.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                      :title="$t('delete_todo')"
                    >
                      <svg
                        class="w-4 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        @click="closeForm"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div
        class="relative bg-white dark:bg-aura-card-dark rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div class="p-6 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
              {{ editingId ? $t('edit_todo') : $t('add_todo') }}
            </h3>
            <button
              @click="closeForm"
              class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-aura-muted transition-colors"
            >
              <svg
                class="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18 17.9 6M6 6l11.9 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-wider text-aura-muted font-bold ml-1">{{
                $t('todo_title')
              }}</label>
              <input
                v-model="todoTitle"
                type="text"
                :placeholder="$t('todo_placeholder')"
                class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl text-lg font-bold text-aura-text dark:text-aura-text-dark outline-none focus:ring-2 focus:ring-aura-accent/50 transition-all placeholder-aura-muted"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-wider text-aura-muted font-bold ml-1">{{
                $t('todo_content')
              }}</label>
              <textarea
                v-model="todoContent"
                placeholder="..."
                class="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl text-aura-text dark:text-aura-text-dark outline-none resize-none h-40 focus:ring-2 focus:ring-aura-accent/50 transition-all placeholder-aura-muted"
              ></textarea>
            </div>

            <!-- Priority Selection -->
            <div class="space-y-2">
              <label class="text-[10px] uppercase tracking-wider text-aura-muted font-bold ml-1">{{
                $t('todo_priority')
              }}</label>
              <div class="flex gap-2">
                <button
                  v-for="p in ['Low', 'Medium', 'High']"
                  :key="p"
                  @click="todoPriority = p as 'Low' | 'Medium' | 'High'"
                  class="flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2"
                  :class="{
                    'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300':
                      todoPriority === p && p === 'Low',
                    'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-800 dark:text-indigo-300':
                      todoPriority === p && p === 'Medium',
                    'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/50 dark:border-rose-800 dark:text-rose-300':
                      todoPriority === p && p === 'High',
                    'bg-transparent border-slate-100 dark:border-slate-800 text-aura-muted hover:border-slate-200 dark:hover:border-slate-700':
                      todoPriority !== p,
                  }"
                >
                  {{ $t(`priorities.${p}`) }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="closeForm"
              class="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-aura-text dark:text-aura-text-dark rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {{ $t('cancel') }}
            </button>
            <button
              @click="saveTodo"
              class="flex-[2] py-4 bg-aura-accent text-white rounded-2xl font-bold shadow-glow hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
              :disabled="!todoTitle || !todoContent"
            >
              {{ editingId ? $t('update_task') : $t('create_task') }}
            </button>
          </div>
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
import { useI18n } from 'vue-i18n'
import type { Todo } from '@/db'

const router = useRouter()
const store = useTodoStore()
const { success } = useToast()
const { t } = useI18n()
const showForm = ref(false)

// Form State
const editingId = ref<string | null>(null)
const todoTitle = ref('')
const todoContent = ref('')
const todoPriority = ref<'Low' | 'Medium' | 'High'>('Low')
const todoCompleted = ref(false)
const showDeleteModal = ref(false)
const todoIdToDelete = ref<string | null>(null)
const expandedTodoId = ref<string | null>(null)

const toggleExpand = (id: string) => {
  if (expandedTodoId.value === id) {
    expandedTodoId.value = null
  } else {
    expandedTodoId.value = id
  }
}

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
  showForm.value = true
}

const openEdit = (todo: Todo) => {
  editingId.value = todo.id
  todoTitle.value = todo.title
  todoContent.value = todo.content
  todoPriority.value = todo.priority || 'Low'
  todoCompleted.value = todo.completed || false
  showForm.value = true
}

const saveTodo = async () => {
  if (!todoTitle.value || !todoContent.value) return

  if (editingId.value) {
    await store.updateTodo(
      editingId.value,
      todoTitle.value,
      todoContent.value,
      todoPriority.value,
      todoCompleted.value,
    )
    success(t('task_updated_success'))
  } else {
    await store.addTodo(todoTitle.value, todoContent.value, todoPriority.value)
    success(t('task_saved_success'))
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
    success(t('task_deleted_success'))
    showDeleteModal.value = false
    todoIdToDelete.value = null
  }
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  todoTitle.value = ''
  todoContent.value = ''
  todoPriority.value = 'Low'
  todoCompleted.value = false
}
</script>
