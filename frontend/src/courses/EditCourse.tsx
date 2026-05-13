import { useNavigate, useOutletContext } from "react-router-dom"
import { CourseForm } from "./CourseForm"
import type { Course, Tag } from "../types"

type CourseContext = { course: Course }

type Props = {
  availableTags: Tag[]
  onSubmit: (id: string, data: { title: string; description?: string; tagId: string }) => void
}

export function EditCourse({ availableTags, onSubmit }: Props) {
  const { course } = useOutletContext<CourseContext>()
  const navigate = useNavigate()

  function handleSubmit(data: { title: string; description: string; tagId: string }) {
    onSubmit(course.id, data)
    navigate(`/courses/${course.id}`)
  }

  return (
    <CourseForm
      initialValues={{
        title: course.title,
        description: course.description ?? "",
        tagId: course.tagId,
      }}
      availableTags={availableTags}
      onSubmit={handleSubmit}
      backTo={`/courses/${course.id}`}
      heading="Edit Course"
      submitLabel="Save changes"
    />
  )
}
