import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button, CardLink } from "./components"
import { TagsSelect } from "./components/TagsSelect"
import { useAuth } from "./contexts/AuthContext"
import type { SortOption, Tag } from "./types"
import { BarChart2, BookOpen, GraduationCap, LogOut, Plus, Tag as TagIcon } from "lucide-react"

type SimplifiedNote = {
  id: string
  title: string
  tags: Tag[]
  updatedAt?: number
}

type NoteListProps = {
  notes: (SimplifiedNote & { updatedAt?: number })[]
  availableTags: Tag[]
  onUpdateTag: (id: string, label: string) => void
  onDeleteTag: (id: string) => void
}

type EditTagsModalProps = {
  show: boolean
  availableTags: Tag[]
  onClose: () => void
  onDeleteTag: (id: string) => void
  onUpdateTag: (id: string, label: string) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recently updated" },
  { value: "alphabetical", label: "Alphabetical" },
]

export function NoteList({
  availableTags,
  notes,
  onUpdateTag,
  onDeleteTag,
}: NoteListProps) {
  const { logout } = useAuth()
  const [titleSearch, setTitleSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [sort, setSort] = useState<SortOption>("recent")
  const [editTagsModalOpen, setEditTagsModalOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesTitle =
        !titleSearch ||
        note.title.toLowerCase().includes(titleSearch.toLowerCase())
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) =>
          note.tags.some((t) => t.id === tag.id)
        )
      return matchesTitle && matchesTags
    })
  }, [notes, titleSearch, selectedTags])

  const sortedNotes = useMemo(() => {
    const copy = [...filteredNotes]
    if (sort === "recent") {
      copy.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    } else {
      copy.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
    }
    return copy
  }, [filteredNotes, sort])

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          RecallStack
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/new">
            <Button variant="primary" className="inline-flex gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              New note
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" className="inline-flex gap-2">
              <GraduationCap className="h-4 w-4" aria-hidden />
              Courses
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="secondary" className="inline-flex gap-2">
              <BookOpen className="h-4 w-4" aria-hidden />
              Start quiz
            </Button>
          </Link>
          <Link to="/stats">
            <Button variant="secondary" className="inline-flex gap-2">
              <BarChart2 className="h-4 w-4" aria-hidden />
              Stats
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => setEditTagsModalOpen(true)}
            className="inline-flex gap-2"
            aria-label="Edit tags"
          >
            <TagIcon className="h-4 w-4" aria-hidden />
            Edit tags
          </Button>
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="p-2"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      <section aria-label="Search and filter" className="mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label
              htmlFor="search-title"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Search by question
            </label>
            <input
              id="search-title"
              type="search"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="Type to search…"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:placeholder:text-neutral-500"
              aria-label="Search notes by title"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <TagsSelect
              id="filter-tags"
              label="Filter by tags"
              availableTags={availableTags}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="All tags"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800"
            aria-label="Sort notes"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section aria-label="Notes list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedNotes.map((note) => (
          <NoteCard key={note.id} id={note.id} title={note.title} tags={note.tags} />
        ))}
      </section>

      {sortedNotes.length === 0 && (
        <p className="py-12 text-center text-neutral-500 dark:text-neutral-400">
          {filteredNotes.length === 0 && notes.length > 0
            ? "No notes match your filters."
            : "No notes yet. Create your first one."}
        </p>
      )}

      <EditTagsModal
        show={editTagsModalOpen}
        availableTags={availableTags}
        onClose={() => setEditTagsModalOpen(false)}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
      />
    </>
  )
}

function NoteCard({ id, title, tags }: SimplifiedNote) {
  return (
    <CardLink to={`/${id}`} className="flex min-h-[120px] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span className="line-clamp-2 text-base font-medium text-neutral-900 dark:text-white">
          {title}
        </span>
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </CardLink>
  )
}

function EditTagsModal({
  availableTags,
  show,
  onClose,
  onDeleteTag,
  onUpdateTag,
}: EditTagsModalProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-tags-title"
    >
      <div
        className="absolute inset-0 bg-neutral-900/50 dark:bg-neutral-950/60"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="edit-tags-title" className="text-lg font-semibold">
            Edit tags
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <ul className="space-y-2">
          {availableTags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/50 p-2 dark:border-neutral-600 dark:bg-neutral-800/50"
            >
              <input
                type="text"
                value={tag.label}
                onChange={(e) => onUpdateTag(tag.id, e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800"
                aria-label={`Edit tag ${tag.label}`}
              />
              <Button
                variant="danger"
                onClick={() => onDeleteTag(tag.id)}
                aria-label={`Delete tag ${tag.label}`}
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
        {availableTags.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No tags yet. Add tags when creating or editing a note.
          </p>
        )}
      </div>
    </div>
  )
}
