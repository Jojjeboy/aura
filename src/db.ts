import Dexie, { type EntityTable } from 'dexie'

export interface JournalEntry {
  id?: string // UUID-like
  date: string // ISO date string
  gratitude: string[]
  moods: string[] // 'Joy', 'Anger', etc.
  health: {
    sleep: number
    food: number
    movement: number
  }
  synced: number // 0 or 1 for indexing efficiency
  updatedAt: number // timestamp
}

export interface Note {
  id: string
  title: string
  content: string
  date: string
  synced: number
  updatedAt: number
}

const db = new Dexie('AuraDB') as Dexie & {
  journal_entries: EntityTable<JournalEntry, 'id'>,
  notes: EntityTable<Note, 'id'>
}

// Schema definition
db.version(3).stores({
  journal_entries: 'id, date, synced, updatedAt',
  notes: 'id, date, synced, updatedAt'
}).upgrade(() => {
  // migration
})

export { db }
