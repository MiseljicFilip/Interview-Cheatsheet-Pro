import { useEffect, useMemo, useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Container } from "./components"
import { EditNote } from "./EditNote"
import { NewNote } from "./NewNote"
import { Note } from "./Note"
import { NoteLayout } from "./NoteLayout"
import { NoteList } from "./NoteList"
import { DEFAULT_TAGS } from "./data/defaultTags"
import type { NoteData, RawNote, Tag, RawNoteData } from "./types"
import { useLocalStorage } from "./useLocalStorage"
import { ref, onValue, off, push, set, remove } from "firebase/database"
import { db } from "./firebase"

// Re-export types so existing imports from "./App" still work
export type { Note, NoteData, RawNote, Tag } from "./types"

function NoteApp() {
  const [notes, setNotes] = useState<RawNote[]>([])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", DEFAULT_TAGS)

  // Subscribe to notes in Realtime Database
  useEffect(() => {
    const notesRef = ref(db, "notes")
    const handleValue = (snapshot: { val: () => Record<string, RawNoteData> | null }) => {
      const val = snapshot.val()
      if (!val) {
        setNotes([])
        return
      }
      const data: RawNote[] = Object.entries(val).map(([id, docData]) => ({
        id,
        title: docData.title,
        markdown: docData.markdown,
        tagIds: docData.tagIds ?? [],
        updatedAt: docData.updatedAt ?? 0,
      }))
      setNotes(data)
    }
    onValue(notesRef, handleValue, (err) => console.error("[Realtime DB] Read error:", err))
    return () => off(notesRef)
  }, [])

  // One-time migration: if TAGS was already saved as [] before we had defaults, fill it
  useEffect(() => {
    const migrated = localStorage.getItem("TAGS_DEFAULTS_APPLIED")
    if (tags.length === 0 && !migrated) {
      setTags(DEFAULT_TAGS)
      localStorage.setItem("TAGS_DEFAULTS_APPLIED", "true")
    }
  }, [tags.length, setTags])

  const notesWithTags = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      })),
    [notes, tags]
  )

  function onCreateNote({ tags: noteTags, ...data }: NoteData) {
    const notesRef = ref(db, "notes")
    const payload = {
      title: data.title ?? "",
      markdown: data.markdown ?? "",
      tagIds: noteTags.map((t) => t.id),
      updatedAt: Date.now(),
    }
    push(notesRef, payload)
      .then(() => console.log("[Realtime DB] Note created"))
      .catch((err) => console.error("[Realtime DB] Write error:", err))
  }

  function onUpdateNote(id: string, { tags: noteTags, ...data }: NoteData) {
    const noteRef = ref(db, "notes/" + id)
    set(noteRef, {
      ...data,
      tagIds: noteTags.map((t) => t.id),
      updatedAt: Date.now(),
    }).catch((err) => console.error("[Realtime DB] Update error:", err))
  }

  function onDeleteNote(id: string) {
    const noteRef = ref(db, "notes/" + id)
    remove(noteRef).catch((err) => console.error("[Realtime DB] Delete error:", err))
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

export default NoteApp
