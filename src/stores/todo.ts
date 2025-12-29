import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/firebase'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  type QuerySnapshot,
  type DocumentData,
  type FirestoreError
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import type { Todo } from '@/db'
import { useAuthStore } from '@/stores/auth'

export const useTodoStore = defineStore('todo', () => {
  const authStore = useAuthStore()
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  let unsubscribe: (() => void) | null = null

  const migrateFirestoreNotes = async () => {
    if (!authStore.user) return
    const uid = authStore.user.uid

    const oldNotesRef = collection(db, 'users', uid, 'notes')
    const snapshot = await getDocs(oldNotesRef)

    if (snapshot.empty) return

    console.log(`Found ${snapshot.docs.length} legacy notes to migrate...`)
    const batch = writeBatch(db)

    snapshot.docs.forEach(noteDoc => {
      const data = noteDoc.data()
      const newTodoRef = doc(db, 'users', uid, 'todos', noteDoc.id)

      batch.set(newTodoRef, {
        ...data,
        completed: data.completed ?? false,
        updatedAt: serverTimestamp()
      })

      batch.delete(noteDoc.ref)
    })

    await batch.commit()
    console.log('Firestore migration from notes to todos completed.')
  }

  const loadTodos = async () => {
    if (!authStore.user) return
    loading.value = true

    // Check for migrations first
    try {
      await migrateFirestoreNotes()
    } catch (e) {
      console.error('Migration failed:', e)
    }

    const todosRef = collection(db, 'users', authStore.user.uid, 'todos')
    const q = query(todosRef, orderBy('date', 'desc'))

    if (unsubscribe) unsubscribe()

    unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      todos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[]
      loading.value = false
    }, (error: FirestoreError | Error) => {
      console.error('Error listening to todos:', error)
      loading.value = false
    })
  }

  const addTodo = async (title: string, content: string, priority: 'Low' | 'Medium' | 'High' = 'Low') => {
    if (!authStore.user) return

    const id = uuidv4()
    const todoRef = doc(db, 'users', authStore.user.uid, 'todos', id)

    const todoData = {
      title,
      content,
      priority,
      completed: false,
      date: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      synced: 1
    }

    try {
      await setDoc(todoRef, todoData)
    } catch (error) {
      console.error('Error saving todo to Firestore:', error)
      throw error
    }
  }

  const updateTodo = async (id: string, title: string, content: string, priority: 'Low' | 'Medium' | 'High', completed: boolean) => {
    if (!authStore.user) return

    const todoRef = doc(db, 'users', authStore.user.uid, 'todos', id)

    try {
      await updateDoc(todoRef, {
        title,
        content,
        priority,
        completed,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating todo in Firestore:', error)
      throw error
    }
  }

  const toggleTodo = async (id: string) => {
    if (!authStore.user) return
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    const todoRef = doc(db, 'users', authStore.user.uid, 'todos', id)
    try {
      await updateDoc(todoRef, {
        completed: !todo.completed,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error toggling todo:', error)
      throw error
    }
  }

  const deleteTodo = async (id: string) => {
    if (!authStore.user) return

    const todoRef = doc(db, 'users', authStore.user.uid, 'todos', id)

    try {
      await deleteDoc(todoRef)
    } catch (error) {
      console.error('Error deleting todo from Firestore:', error)
      throw error
    }
  }

  const sortedTodos = computed(() => {
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 }
    return [...todos.value].sort((a, b) => {
      // Completed todos at the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      const weightA = priorityWeight[a.priority] || 1
      const weightB = priorityWeight[b.priority] || 1

      if (weightA !== weightB) {
        return weightB - weightA
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  })

  const clearTodos = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    todos.value = []
  }

  return {
    todos,
    sortedTodos,
    loading,
    loadTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearTodos
  }
})
