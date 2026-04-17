import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { ArrowLeft, BookOpen, Play, Plus, Pencil, Trash2 } from "lucide-react"
import { Button, CardLink } from "../components"
import type { Course, RawLesson } from "../types"

type CourseContext = {
  course: Course
  lessons: RawLesson[]
}

type Note = { id: string; title: string; markdown: string; tags: { id: string; label: string }[] }

type Props = {
  lessons: RawLesson[]
  notes: Note[]
  onDeleteCourse: (id: string) => Promise<void>
}

export function CourseDetail({ notes, onDeleteCourse }: Props) {
  const { course, lessons } = useOutletContext<CourseContext>()
  const navigate = useNavigate()

  async function handleDelete() {
    if (!confirm(`Delete course "${course.title}"? This will also delete all its lessons.`)) return
    await onDeleteCourse(course.id)
    navigate("/courses")
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link to="/courses">
            <Button variant="ghost" className="mt-0.5 p-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <div>
            {course.tag && (
              <span className="mb-1 inline-block rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                {course.tag.label}
              </span>
            )}
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {course.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Link to={`/courses/${course.id}/quiz`}>
            <Button variant="primary" className="inline-flex gap-2">
              <Play className="h-4 w-4" aria-hidden />
              Take quiz
            </Button>
          </Link>
          <Link to={`/courses/${course.id}/lessons/new`}>
            <Button variant="secondary" className="inline-flex gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Add lesson
            </Button>
          </Link>
          <Link to={`/courses/${course.id}/edit`}>
            <Button variant="secondary" className="p-2">
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Button variant="danger" className="p-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      {lessons.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="mb-4 text-neutral-500 dark:text-neutral-400">
            No lessons yet. Add the first one.
          </p>
          <Link to={`/courses/${course.id}/lessons/new`}>
            <Button variant="primary" className="inline-flex gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Add lesson
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const lessonNotes = notes.filter((n) => lesson.noteIds.includes(n.id))
            return (
              <CardLink
                key={lesson.id}
                to={`/courses/${course.id}/lessons/${lesson.id}`}
                className="flex items-center gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                  {idx + 1}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {lesson.title}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {lessonNotes.length} Q&amp;A question{lessonNotes.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardLink>
            )
          })}
        </div>
      )}
    </>
  )
}
