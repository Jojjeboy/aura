<template>
  <div class="pb-24 space-y-6 min-h-screen bg-aura-bg dark:bg-aura-bg-dark transition-colors duration-300">
    <div class="px-6 py-4 flex justify-between items-center bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md">
      <div class="flex items-center gap-3">
         <button @click="router.back()" class="flex items-center gap-2 text-aura-text dark:text-aura-text-dark text-lg font-medium group transition-colors">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
            </svg>
            <span>Back</span>
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
           <h3 class="text-sm font-semibold text-aura-muted uppercase">{{ editingId ? 'Edit Note' : 'New Note' }}</h3>
           <button @click="closeForm" class="text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors">
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.9 6M6 6l11.9 12"/>
              </svg>
           </button>
        </div>
        <input
          v-model="noteTitle"
          type="text"
          placeholder="Title"
          class="w-full bg-transparent text-lg font-bold text-aura-text dark:text-aura-text-dark outline-none placeholder-aura-muted"
        />
        <textarea
          v-model="noteContent"
          placeholder="Write your thoughts..."
          class="w-full bg-transparent text-aura-text dark:text-aura-text-dark outline-none resize-none h-32 placeholder-aura-muted"
        ></textarea>
        <div class="flex justify-end gap-2 pt-2">
           <button
             @click="saveNote"
             class="px-6 py-2 bg-aura-accent text-white rounded-full font-medium shadow-glow hover:shadow-lg transition-all"
             :disabled="!noteTitle && !noteContent"
           >{{ editingId ? 'Update' : 'Save' }}</button>
        </div>
      </div>

      <!-- Notes List -->
      <div v-if="store.loading" class="text-center text-aura-muted py-8 max-w-sm mx-auto">Loading notes...</div>

      <div v-else-if="store.notes.length === 0 && !showCreate" class="text-center text-aura-muted py-12">
        <p>No notes yet. Tap + to create one.</p>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="note in store.notes"
          :key="note.id"
          class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft hover:shadow-md transition-shadow group relative"
        >
          <div @click="openEdit(note)" class="cursor-pointer">
            <h3 class="font-bold text-aura-text dark:text-aura-text-dark mb-2 pr-8">{{ note.title || 'Untitled' }}</h3>
            <p class="text-sm text-aura-text/80 dark:text-aura-text-dark/80 line-clamp-3 whitespace-pre-wrap">{{ note.content }}</p>
            <div class="mt-4 text-xs text-aura-muted">{{ new Date(note.date).toLocaleDateString() }}</div>
          </div>

          <!-- Delete Button -->
          <button
            @click.stop="confirmDelete(note.id)"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
            title="Delete Note"
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
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useToast } from '@/composables/useToast'
import AppModal from '@/components/ui/AppModal.vue'

const router = useRouter()
const store = useNotesStore()
const { success } = useToast()
const showCreate = ref(false)

// Form State
const editingId = ref<string | null>(null)
const noteTitle = ref('')
const noteContent = ref('')
const showDeleteModal = ref(false)
const noteIdToDelete = ref<string | null>(null)

onMounted(() => {
  store.loadNotes()
})

onUnmounted(() => {
  store.clearNotes()
})

const openCreate = () => {
  editingId.value = null
  noteTitle.value = ''
  noteContent.value = ''
  showCreate.value = true
}

import type { Note } from '@/db'

const openEdit = (note: Note) => {
  editingId.value = note.id
  noteTitle.value = note.title
  noteContent.value = note.content
  showCreate.value = true
}

const saveNote = async () => {
  if (!noteTitle.value && !noteContent.value) return

  if (editingId.value) {
    await store.updateNote(editingId.value, noteTitle.value, noteContent.value)
    success('Note updated!')
  } else {
    await store.saveNote(noteTitle.value, noteContent.value)
    success('Note saved!')
  }

  closeForm()
}

const confirmDelete = (id: string) => {
  noteIdToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (noteIdToDelete.value) {
    await store.deleteNote(noteIdToDelete.value)
    success('Note deleted')
    showDeleteModal.value = false
    noteIdToDelete.value = null
  }
}

const closeForm = () => {
  showCreate.value = false
  editingId.value = null
  noteTitle.value = ''
  noteContent.value = ''
}
</script>
