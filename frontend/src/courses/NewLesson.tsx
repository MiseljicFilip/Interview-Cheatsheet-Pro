import { useNavigate, useOutletContext } from "react-router-dom"
import { LessonForm } from "./LessonForm"
import type { Course, RawLesson } from "../types"

type CourseContext = { course: Course; lessons: RawLesson[] }
type Note = { id: string; title: string; tags: { id: string; label: string }[] }

type Props = {
  notes: Note[]
  onSubmit: (data: {
    title: string
    markdown: string
    courseId: string
    noteIds: string[]
    order: number
  }) => Promise<string | null>
}

export function NewLesson({ notes, onSubmit }: Props) {
  const { course, lessons } = useOutletContext<CourseContext>()
  const navigate = useNavigate()

  // Filter notes to those matching the course's topic tag
  const relevantNotes = notes.filter((n) =>
    n.tags.some((t) => t.id === course.tagId)
  )

  async function handleSubmit(data: { title: string; markdown: string; noteIds: string[] }) {
    const id = await onSubmit({
      ...data,
      courseId: course.id,
      order: lessons.length,
    })
    if (id) navigate(`/courses/${course.id}/lessons/${id}`)
    else navigate(`/courses/${course.id}`)
  }

  return (
    <LessonForm
      notes={relevantNotes.length > 0 ? relevantNotes : notes}
      onSubmit={handleSubmit}
      backTo={`/courses/${course.id}`}
      heading="New Lesson"
      submitLabel="Create lesson"
    />
  )
}
