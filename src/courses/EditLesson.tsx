import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { LessonForm } from "./LessonForm"
import type { Course, RawLesson } from "../types"

type CourseContext = { course: Course; lessons: RawLesson[] }
type Note = { id: string; title: string; tags: { id: string; label: string }[] }

type Props = {
  notes: Note[]
  onSubmit: (id: string, data: { title: string; markdown: string; noteIds: string[] }) => void
}

export function EditLesson({ notes, onSubmit }: Props) {
  const { course, lessons } = useOutletContext<CourseContext>()
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const lesson = lessons.find((l) => l.id === lessonId)

  // Prefer notes matching the course topic, fall back to all notes
  const relevantNotes = notes.filter((n) => n.tags.some((t) => t.id === course.tagId))

  function handleSubmit(data: { title: string; markdown: string; noteIds: string[] }) {
    if (!lesson) return
    onSubmit(lesson.id, data)
    navigate(`/courses/${course.id}/lessons/${lesson.id}`)
  }

  if (!lesson) {
    return <div className="py-16 text-center text-neutral-500">Lesson not found.</div>
  }

  return (
    <LessonForm
      initialValues={{
        title: lesson.title,
        markdown: lesson.markdown,
        noteIds: lesson.noteIds,
      }}
      notes={relevantNotes.length > 0 ? relevantNotes : notes}
      onSubmit={handleSubmit}
      backTo={`/courses/${course.id}/lessons/${lesson.id}`}
      heading="Edit Lesson"
      submitLabel="Save changes"
    />
  )
}
