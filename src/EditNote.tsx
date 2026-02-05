import type { NoteData, Tag } from "./types"
import { NoteForm } from "./NoteForm"
import { useNote } from "./NoteLayout"

type EditNoteProps = {
  onSubmit: (id: string, data: NoteData) => void
  onAddTag: (tag: Tag) => void
  availableTags: Tag[]
}

export function EditNote({ onSubmit, onAddTag, availableTags }: EditNoteProps) {
  const note = useNote()
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
        Edit note
      </h1>
      <NoteForm
        title={note.title}
        markdown={note.markdown}
        tags={note.tags}
        onSubmit={(data) => onSubmit(note.id, data)}
        onAddTag={onAddTag}
        availableTags={availableTags}
      />
    </>
  )
}
