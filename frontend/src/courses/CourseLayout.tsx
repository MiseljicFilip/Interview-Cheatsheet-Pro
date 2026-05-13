import { Navigate, Outlet, useParams } from "react-router-dom"
import type { Course, RawLesson } from "../types"

type Props = {
  courses: Course[]
  lessons: RawLesson[]
}

export function CourseLayout({ courses, lessons }: Props) {
  const { courseId } = useParams<{ courseId: string }>()
  const course = courses.find((c) => c.id === courseId)

  if (!course) return <Navigate to="/courses" replace />

  const courseLessons = lessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => {
      const aIdx = course.lessonIds.indexOf(a.id)
      const bIdx = course.lessonIds.indexOf(b.id)
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
    })

  return <Outlet context={{ course, lessons: courseLessons }} />
}
