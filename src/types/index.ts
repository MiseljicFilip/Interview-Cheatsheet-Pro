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
