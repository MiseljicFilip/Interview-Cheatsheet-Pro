import { useNavigate } from "react-router-dom"
import { CourseForm } from "./CourseForm"
import type { Tag } from "../types"

type Props = {
  availableTags: Tag[]
  onSubmit: (data: { title: string; description?: string; tagId: string }) => Promise<string | null>
}

export function NewCourse({ availableTags, onSubmit }: Props) {
  const navigate = useNavigate()

  async function handleSubmit(data: { title: string; description: string; tagId: string }) {
    const id = await onSubmit(data)
    if (id) navigate(`/courses/${id}`)
    else navigate("/courses")
  }

  return (
    <CourseForm
      availableTags={availableTags}
      onSubmit={handleSubmit}
      backTo="/courses"
      heading="New Course"
      submitLabel="Create course"
    />
  )
}
