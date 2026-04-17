import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Plus } from "lucide-react"
import { Button, CardLink } from "../components"
import type { Course, Tag } from "../types"

type Props = {
  courses: Course[]
  availableTags: Tag[]
}

export function CourseList({ courses, availableTags }: Props) {
  // Group courses by tagId
  const grouped = availableTags
    .map((tag) => ({
      tag,
      courses: courses.filter((c) => c.tagId === tag.id),
    }))
    .filter((g) => g.courses.length > 0)

  const untagged = courses.filter(
    (c) => !availableTags.some((t) => t.id === c.tagId)
  )

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" className="p-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Courses
          </h1>
        </div>
        <Link to="/courses/new">
          <Button variant="primary" className="inline-flex gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            New course
          </Button>
        </Link>
      </header>

      {courses.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No courses yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ tag, courses: tagCourses }) => (
            <section key={tag.id}>
              <h2 className="mb-4 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                {tag.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tagCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ))}

          {untagged.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                Other
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {untagged.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}

function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.lessonIds.length

  return (
    <CardLink to={`/courses/${course.id}`} className="flex min-h-[120px] flex-col">
      <div className="flex flex-1 flex-col gap-2 p-1">
        <span className="line-clamp-2 text-base font-medium text-neutral-900 dark:text-white">
          {course.title}
        </span>
        {course.description && (
          <span className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
            {course.description}
          </span>
        )}
        <span className="mt-auto text-xs text-neutral-400 dark:text-neutral-500">
          {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
        </span>
      </div>
    </CardLink>
  )
}
