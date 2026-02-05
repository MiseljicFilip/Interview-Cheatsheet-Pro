import { useRef, useState } from "react"
import { Tag } from "../types"
import { Button } from "./Button"

type TagsSelectProps = {
  label: string
  availableTags: Tag[]
  value: Tag[]
  onChange: (tags: Tag[]) => void
  /** If provided, user can create new tags by typing and selecting "Create ..." */
  onCreateOption?: (label: string) => Tag
  placeholder?: string
  id?: string
}

/**
 * Multi-select for tags. Shows selected tags as chips; dropdown to add more.
 * Optional creatable: when onCreateOption is passed, user can add new tags.
 */
export function TagsSelect({
  label,
  availableTags,
  value,
  onChange,
  onCreateOption,
  placeholder = "Select tags…",
  id = "tags-select",
}: TagsSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedIds = new Set(value.map((t) => t.id))
  const filtered = availableTags.filter(
    (tag) =>
      !selectedIds.has(tag.id) &&
      tag.label.toLowerCase().includes(search.trim().toLowerCase())
  )
  const searchTrim = search.trim()
  const canCreate =
    onCreateOption &&
    searchTrim &&
    !availableTags.some((t) => t.label.toLowerCase() === searchTrim.toLowerCase()) &&
    !value.some((t) => t.label.toLowerCase() === searchTrim.toLowerCase())

  function addTag(tag: Tag) {
    onChange([...value, tag])
    setSearch("")
    setIsOpen(false)
  }

  function removeTag(tagId: string) {
    onChange(value.filter((t) => t.id !== tagId))
  }

  function handleCreate() {
    if (!onCreateOption || !searchTrim) return
    const newTag = onCreateOption(searchTrim)
    addTag(newTag)
  }

  return (
    <div ref={containerRef} className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      <div className="relative">
        <div className="min-h-[42px] flex flex-wrap items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800">
          {value.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
            >
              {tag.label}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="rounded p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                aria-label={`Remove tag ${tag.label}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={id}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            aria-label={label}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          />
        </div>
        {isOpen && (filtered.length > 0 || canCreate) && (
          <ul
            role="listbox"
            className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-600 dark:bg-neutral-800"
          >
            {filtered.map((tag) => (
              <li
                key={tag.id}
                role="option"
                className="cursor-pointer px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onMouseDown={(e) => {
                  e.preventDefault()
                  addTag(tag)
                }}
              >
                {tag.label}
              </li>
            ))}
            {canCreate && (
              <li
                role="option"
                className="cursor-pointer px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleCreate()
                }}
              >
                Create “{searchTrim}”
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
