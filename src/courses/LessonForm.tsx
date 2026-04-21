import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "../components"

type Note = { id: string; title: string; tags: { id: string; label: string }[] }

type LessonFormData = {
  title: string
  markdown: string
  noteIds: string[]
}

type Props = {
  initialValues?: Partial<LessonFormData>
  notes: Note[]
  onSubmit: (data: LessonFormData) => void
  backTo: string
  heading: string
  submitLabel: string
}

export function LessonForm({ initialValues, notes, onSubmit, backTo, heading, submitLabel }: Props) {
  const titleRef = useRef<HTMLInputElement>(null)
  const markdownRef = useRef<HTMLTextAreaElement>(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>(initialValues?.noteIds ?? [])
  const [noteSearch, setNoteSearch] = useState("")

  const selectedNotes = notes.filter((n) => selectedNoteIds.includes(n.id))
  const availableNotes = notes.filter(
    (n) =>
      !selectedNoteIds.includes(n.id) &&
      (!noteSearch || n.title.toLowerCase().includes(noteSearch.toLowerCase()))
  )

  function addNote(id: string) {
    setSelectedNoteIds((prev) => [...prev, id])
    setNoteSearch("")
  }

  function removeNote(id: string) {
    setSelectedNoteIds((prev) => prev.filter((nid) => nid !== id))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    onSubmit({
      title: titleRef.current?.value ?? "",
      markdown: markdownRef.current?.value ?? "",
      noteIds: selectedNoteIds,
    })
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <header className="mb-8 flex items-center gap-4">
        <Link to={backTo}>
          <Button variant="ghost" className="p-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          {heading}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") e.currentTarget.requestSubmit() }}
        className="space-y-5"
      >
        <div className="space-y-1.5">
          <label htmlFor="lesson-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Title
          </label>
          <input
            id="lesson-title"
            ref={titleRef}
            required
            defaultValue={initialValues?.title ?? ""}
            placeholder="e.g. Virtual DOM"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lesson-markdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Lesson content <span className="font-normal text-neutral-400">(Markdown)</span>
          </label>
          <textarea
            id="lesson-markdown"
            ref={markdownRef}
            rows={14}
            defaultValue={initialValues?.markdown ?? ""}
            placeholder="# Lesson Title&#10;&#10;Write your lesson content here using Markdown..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Linked Q&amp;A questions <span className="font-normal text-neutral-400">(optional)</span>
          </label>

          {selectedNotes.length > 0 && (
            <ul className="space-y-1.5">
              {selectedNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <span className="flex-1 text-neutral-800 dark:text-neutral-200">{note.title}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    aria-label={`Remove ${note.title}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="relative">
            <input
              type="search"
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
              placeholder="Search questions to link…"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800"
            />
            {noteSearch && availableNotes.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                {availableNotes.slice(0, 20).map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => addNote(note.id)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      {note.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
          <Link to={backTo}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
