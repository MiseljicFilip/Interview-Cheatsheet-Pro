import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, ChevronLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "../components"
import { MarkdownRenderer } from "../components/MarkdownRenderer"
import type { Course, RawLesson } from "../types"

type CourseContext = { course: Course; lessons: RawLesson[] }
type Note = { id: string; title: string; markdown: string; tags: { id: string; label: string }[] }

type Props = {
  notes: Note[]
  onDeleteLesson: (courseId: string, lessonId: string) => Promise<void>
}

export function LessonDetail({ notes, onDeleteLesson }: Props) {
  const { course, lessons } = useOutletContext<CourseContext>()
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const lesson = lessons.find((l) => l.id === lessonId)
  const lessonIdx = lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = lessonIdx > 0 ? lessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < lessons.length - 1 ? lessons[lessonIdx + 1] : null

  if (!lesson) {
    return (
      <div className="py-16 text-center text-neutral-500 dark:text-neutral-400">
        Lesson not found.{" "}
        <Link to={`/courses/${course.id}`} className="underline">
          Back to course
        </Link>
      </div>
    )
  }

  const lessonNotes = notes.filter((n) => lesson.noteIds.includes(n.id))

  async function handleDelete() {
    if (!confirm(`Delete lesson "${lesson!.title}"?`)) return
    await onDeleteLesson(course.id, lesson!.id)
    navigate(`/courses/${course.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to={`/courses/${course.id}`}>
            <Button variant="ghost" className="mt-0.5 p-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <div>
            <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
              {course.title} · Lesson {lessonIdx + 1} of {lessons.length}
            </p>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {lesson.title}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link to={`/courses/${course.id}/lessons/${lesson.id}/edit`}>
            <Button variant="secondary" className="p-2">
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Button variant="danger" className="p-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      {/* Lesson content */}
      <div className="mb-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <MarkdownRenderer>{lesson.markdown}</MarkdownRenderer>
      </div>

      {/* Q&A section */}
      {lessonNotes.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Q&amp;A Questions
          </h2>
          <div className="space-y-3">
            {lessonNotes.map((note) => (
              <QACard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* Lesson navigation */}
      <div className="flex justify-between gap-4">
        <div>
          {prevLesson && (
            <Link to={`/courses/${course.id}/lessons/${prevLesson.id}`}>
              <Button variant="secondary" className="inline-flex gap-2">
                <ChevronLeft className="h-4 w-4" aria-hidden />
                {prevLesson.title}
              </Button>
            </Link>
          )}
        </div>
        <div>
          {nextLesson ? (
            <Link to={`/courses/${course.id}/lessons/${nextLesson.id}`}>
              <Button variant="primary" className="inline-flex gap-2">
                {nextLesson.title}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          ) : (
            <Link to={`/courses/${course.id}/quiz`}>
              <Button variant="primary" className="inline-flex gap-2">
                Take quiz
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function QACard({ note }: { note: Note }) {
  return (
    <Link to={`/${note.id}`} className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
      <p className="font-medium text-neutral-900 dark:text-white">{note.title}</p>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
