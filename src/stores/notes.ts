import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import type { Note } from '@/db'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  const loadNotes = async () => {
    if (!auth.currentUser) return
    loading.value = true

    const notesRef = collection(db, 'users', auth.currentUser.uid, 'notes')
    const q = query(notesRef, orderBy('date', 'desc'))

    if (unsubscribe) unsubscribe()

    unsubscribe = onSnapshot(q, (snapshot) => {
      notes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[]
      loading.value = false
    }, (error) => {
      console.error('Error listening to notes:', error)
      loading.value = false
    })
  }

  const saveNote = async (title: string, content: string) => {
    if (!auth.currentUser) return

    const id = uuidv4()
    const noteRef = doc(db, 'users', auth.currentUser.uid, 'notes', id)

    const noteData = {
      title,
      content,
      date: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      synced: 1
    }

    try {
      await setDoc(noteRef, noteData)
    } catch (error) {
      console.error('Error saving note to Firestore:', error)
      throw error
    }
  }

  const updateNote = async (id: string, title: string, content: string) => {
    if (!auth.currentUser) return

    const noteRef = doc(db, 'users', auth.currentUser.uid, 'notes', id)

    try {
      await updateDoc(noteRef, {
        title,
        content,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating note in Firestore:', error)
      throw error
    }
  }

  const deleteNote = async (id: string) => {
    if (!auth.currentUser) return

    const noteRef = doc(db, 'users', auth.currentUser.uid, 'notes', id)

    try {
      await deleteDoc(noteRef)
    } catch (error) {
      console.error('Error deleting note from Firestore:', error)
      throw error
    }
  }

  const clearNotes = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    notes.value = []
  }

  return {
    notes,
    loading,
    loadNotes,
    saveNote,
    updateNote,
    deleteNote,
    clearNotes
  }
})
