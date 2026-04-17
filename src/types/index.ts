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
  courseId?: string  // present when quiz was started from a course page
}

export type RawCourse = {
  id: string
  title: string
  description?: string
  tagId: string          // e.g. "default-react"
  lessonIds: string[]    // ordered; course owns the sequence
  createdAt: number
  updatedAt: number
}

export type RawLesson = {
  id: string
  title: string
  markdown: string       // lesson reading content
  courseId: string
  noteIds: string[]      // references to existing Note IDs for Q&A
  order: number
  createdAt: number
  updatedAt: number
}

export type Course = RawCourse & { tag?: Tag }
export type Lesson = RawLesson

// Auth (re-export from auth module for convenience)
export type { User, LoginCredentials, LoginResponse, MeResponse } from "./auth"
