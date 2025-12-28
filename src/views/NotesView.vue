<template>
  <div class="pb-24 space-y-6 min-h-screen bg-aura-bg dark:bg-aura-bg-dark transition-colors duration-300">
    <div class="px-6 py-4 flex justify-between items-center bg-aura-bg/80 dark:bg-aura-bg-dark/80 backdrop-blur-md">
      <div class="flex items-center gap-3">
         <button @click="router.back()" class="text-aura-text dark:text-aura-text-dark text-lg font-medium">← Back</button>
      </div>
      <button
        @click="openCreate"
        class="w-10 h-10 rounded-full bg-aura-accent text-white flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
      >
        <span class="text-xl font-bold">+</span>
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Create/Edit Form -->
      <div v-if="showCreate" class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
        <div class="flex justify-between items-center mb-2">
           <h3 class="text-sm font-semibold text-aura-muted uppercase">{{ editingId ? 'Edit Note' : 'New Note' }}</h3>
           <button @click="closeForm" class="text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark">✕</button>
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
      <div v-if="loading" class="text-center text-aura-muted py-8 max-w-sm mx-auto">Loading notes...</div>

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

          <!-- Delete Button (visible on hover/focus) -->
          <button
            @click.stop="deleteNote(note.id)"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
            title="Delete Note"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '@/stores/journal'

const router = useRouter()
const store = useJournalStore()
const showCreate = ref(false)
const loading = ref(true)

// Form State
const editingId = ref<string | null>(null)
const noteTitle = ref('')
const noteContent = ref('')

onMounted(async () => {
  await store.loadNotes()
  loading.value = false
})

const openCreate = () => {
  editingId.value = null
  noteTitle.value = ''
  noteContent.value = ''
  showCreate.value = true
}

const openEdit = (note: import('@/db').Note) => {
  editingId.value = note.id
  noteTitle.value = note.title
  noteContent.value = note.content
  showCreate.value = true
}

const saveNote = async () => {
  if (!noteTitle.value && !noteContent.value) return

  if (editingId.value) {
    await store.updateNote(editingId.value, noteTitle.value, noteContent.value)
  } else {
    await store.saveNote(noteTitle.value, noteContent.value)
  }

  closeForm()
}

const deleteNote = async (id: string) => {
  if (confirm('Are you sure you want to delete this note?')) {
    await store.deleteNote(id)
  }
}

const closeForm = () => {
  showCreate.value = false
  editingId.value = null
  noteTitle.value = ''
  noteContent.value = ''
}
</script>
