import { Link, useNavigate } from "react-router-dom"
import { Button, MarkdownRenderer } from "./components"
import { useNote } from "./NoteLayout"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

type NoteProps = {
  onDelete: (id: string) => void
}

export function Note({ onDelete }: NoteProps) {
  const note = useNote()
  const navigate = useNavigate()

  function handleDelete() {
    onDelete(note.id)
    navigate("/")
  }

  return (
    <article>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {note.title}
          </h1>
          {note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/${note.id}/edit`}>
            <Button variant="primary" className="inline-flex gap-2">
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="inline-flex gap-2"
            aria-label={`Delete note ${note.title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
          <Link to="/">
            <Button variant="secondary" className="inline-flex gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
          </Link>
        </div>
      </header>
      <MarkdownRenderer>{note.markdown}</MarkdownRenderer>
    </article>
  )
}
