import Dexie, { type EntityTable } from 'dexie'

export interface JournalEntry {
  id?: string // UUID-like
  date: string // ISO date string
  gratitude: string[]
  wellDone?: string[]
  improvement?: string[]
  moods: string[] // 'Joy', 'Anger', etc.
  thoughts?: string
  health: {
    sleep: number
    food: number
    movement: number
  }
  synced: number // 0 or 1 for indexing efficiency
  updatedAt: number // timestamp
}

export interface Todo {
  id: string
  title: string
  content: string
  date: string
  priority: 'Low' | 'Medium' | 'High'
  completed: boolean
  synced: number
  updatedAt: number
}

const db = new Dexie('AuraDB') as Dexie & {
  journal_entries: EntityTable<JournalEntry, 'id'>,
  todos: EntityTable<Todo, 'id'>
}

// Schema definition
db.version(6).stores({
  journal_entries: 'id, date, synced, updatedAt',
  todos: 'id, date, priority, completed, synced, updatedAt'
}).upgrade(tx => {
  return tx.table('journal_entries').toCollection().modify(entry => {
    if (!entry.wellDone) entry.wellDone = ['', '', '']
    if (!entry.improvement) entry.improvement = ['', '', '']
  })
})

export { db }
