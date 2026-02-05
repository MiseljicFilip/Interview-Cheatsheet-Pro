import { useEffect, useMemo } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Container } from "./components"
import { EditNote } from "./EditNote"
import { NewNote } from "./NewNote"
import { Note } from "./Note"
import { NoteLayout } from "./NoteLayout"
import { NoteList } from "./NoteList"
import { DEFAULT_TAGS } from "./data/defaultTags"
import type { NoteData, RawNote, Tag } from "./types"
import { useLocalStorage } from "./useLocalStorage"
import { v4 as uuidV4 } from "uuid"

// Re-export types so existing imports from "./App" still work
export type { Note, NoteData, RawNote, Tag } from "./types"

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", [])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", DEFAULT_TAGS)

  // One-time migration: if TAGS was already saved as [] before we had defaults, fill it
  useEffect(() => {
    const migrated = localStorage.getItem("TAGS_DEFAULTS_APPLIED")
    if (tags.length === 0 && !migrated) {
      setTags(DEFAULT_TAGS)
      localStorage.setItem("TAGS_DEFAULTS_APPLIED", "true")
    }
  }, [tags.length, setTags])

  const notesWithTags = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
    }))
  }, [notes, tags])

  function onCreateNote({ tags: noteTags, ...data }: NoteData) {
    setNotes((prevNotes) => [
      ...prevNotes,
      {
        ...data,
        id: uuidV4(),
        tagIds: noteTags.map((t) => t.id),
        updatedAt: Date.now(),
      },
    ])
  }

  function onUpdateNote(id: string, { tags: noteTags, ...data }: NoteData) {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...data,
              tagIds: noteTags.map((t) => t.id),
              updatedAt: Date.now(),
            }
          : note
      )
    )
  }

  function onDeleteNote(id: string) {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
  }

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag])
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, label } : tag))
    )
  }

  function deleteTag(id: string) {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id))
  }

  return (
    <Container>
      <Routes>
        <Route
          path="/"
          element={
            <NoteList
              notes={notesWithTags}
              availableTags={tags}
              onUpdateTag={updateTag}
              onDeleteTag={deleteTag}
            />
          }
        />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={addTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDelete={onDeleteNote} />} />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Container>
  )
}

export default App
