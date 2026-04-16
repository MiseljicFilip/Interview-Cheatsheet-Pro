export type Tag = {
  id: string
  label: string
}

export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
  updatedAt?: number
}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
}

export type RawNote = {
  id: string
} & RawNoteData

export type SortOption = "recent" | "alphabetical"

export type Note = {
  id: string
} & NoteData

export type QuizSession = {
  id: string
  date: number       // Unix ms timestamp
  total: number
  correct: number
  tagIds: string[]   // tags that were filtered at quiz start (empty = all)
  missedNoteIds: string[]
}

// Auth (re-export from auth module for convenience)
export type { User, LoginCredentials, LoginResponse, MeResponse } from "./auth"
