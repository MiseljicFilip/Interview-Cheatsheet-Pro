import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components"
import type { Tag } from "../types"

type CourseFormData = {
  title: string
  description: string
  tagId: string
}

type Props = {
  initialValues?: Partial<CourseFormData>
  availableTags: Tag[]
  onSubmit: (data: CourseFormData) => void
  backTo: string
  heading: string
  submitLabel: string
}

export function CourseForm({ initialValues, availableTags, onSubmit, backTo, heading, submitLabel }: Props) {
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const tagRef = useRef<HTMLSelectElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    onSubmit({
      title: titleRef.current?.value ?? "",
      description: descriptionRef.current?.value ?? "",
      tagId: tagRef.current?.value ?? "",
    })
  }

  return (
    <div className="mx-auto max-w-lg py-8">
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
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div className="space-y-1.5">
          <label htmlFor="course-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Title
          </label>
          <input
            id="course-title"
            ref={titleRef}
            required
            defaultValue={initialValues?.title ?? ""}
            placeholder="e.g. React Under the Hood"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-700"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="course-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="course-description"
            ref={descriptionRef}
            rows={2}
            defaultValue={initialValues?.description ?? ""}
            placeholder="Brief description of what this course covers"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-700"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="course-tag" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Topic
          </label>
          <select
            id="course-tag"
            ref={tagRef}
            required
            defaultValue={initialValues?.tagId ?? ""}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-700"
          >
            <option value="" disabled>Select a topic…</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.label}</option>
            ))}
          </select>
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
