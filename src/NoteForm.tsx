import { FormEvent, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./components"
import { TagsSelect } from "./components/TagsSelect"
import type { NoteData, Tag } from "./types"
import { v4 as uuidV4 } from "uuid"

type NoteFormProps = {
  onSubmit: (data: NoteData) => void
  onAddTag: (tag: Tag) => void
  availableTags: Tag[]
} & Partial<Pick<NoteData, "title" | "markdown" | "tags">>

export function NoteForm({
  onSubmit,
  onAddTag,
  availableTags,
  title = "",
  markdown = "",
  tags = [],
}: NoteFormProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const markdownRef = useRef<HTMLTextAreaElement>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>(tags)
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const titleEl = titleRef.current
    const markdownEl = markdownRef.current
    if (!titleEl || !markdownEl) return
    setIsSubmitting(true)
    onSubmit({
      title: titleEl.value,
      markdown: markdownEl.value,
      tags: selectedTags,
    })
    navigate("..")
  }

  function handleCreateTag(label: string): Tag {
    const newTag = { id: uuidV4(), label }
    onAddTag(newTag)
    return newTag
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.ctrlKey && e.key === "Enter") e.currentTarget.requestSubmit()
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="note-title"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Question (title)
          </label>
          <input
            id="note-title"
            ref={titleRef}
            type="text"
            required
            defaultValue={title}
            placeholder="e.g. What is the virtual DOM?"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:placeholder:text-neutral-500"
            aria-required
          />
        </div>
        <TagsSelect
          id="note-tags"
          label="Tags / technologies"
          availableTags={availableTags}
          value={selectedTags}
          onChange={setSelectedTags}
          onCreateOption={handleCreateTag}
          placeholder="Add tags…"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="note-markdown"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Answer (Markdown)
        </label>
        <textarea
          id="note-markdown"
          ref={markdownRef}
          required
          defaultValue={markdown}
          rows={16}
          placeholder="Write your answer in Markdown…"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:placeholder:text-neutral-500"
          aria-required
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
        <Link to="..">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
