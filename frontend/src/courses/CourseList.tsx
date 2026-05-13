import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Plus } from "lucide-react"
import { Button, CardLink } from "../components"
import type { Course, RawLesson, Tag } from "../types"

type Props = {
  courses: Course[]
  availableTags: Tag[]
  lessons: RawLesson[]
}

export function CourseList({ courses, availableTags, lessons }: Props) {
  const [titleSearch, setTitleSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(titleSearch), 300)
    return () => clearTimeout(id)
  }, [titleSearch])

  const filteredCourses = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase()
    if (!normalizedSearch) return courses
    return courses.filter((course) =>
      course.title.toLowerCase().includes(normalizedSearch)
    )
  }, [courses, debouncedSearch])

  // Group courses by tagId
  const grouped = availableTags
    .map((tag) => ({
      tag,
      courses: filteredCourses.filter((c) => c.tagId === tag.id),
    }))
    .filter((g) => g.courses.length > 0)

  const untagged = filteredCourses.filter(
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

      <section aria-label="Course search" className="mb-6">
        <div className="max-w-md space-y-1.5">
          <label
            htmlFor="search-course-title"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Search by course name
          </label>
          <input
            id="search-course-title"
            type="search"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            placeholder="Type to search courses..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:placeholder:text-neutral-500"
            aria-label="Search courses by title"
          />
        </div>
      </section>

      {courses.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No courses yet. Create your first one.
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No courses match your search.
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
                  <CourseCard key={course.id} course={course} lessons={lessons} />
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
                  <CourseCard key={course.id} course={course} lessons={lessons} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}

function CourseCard({ course, lessons }: { course: Course; lessons: RawLesson[] }) {
  const lessonCount = course.lessonIds.length
  const qaCount = lessons
    .filter((l) => l.courseId === course.id)
    .reduce((sum, l) => sum + l.noteIds.length, 0)

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
        <span className="mt-auto flex gap-3 text-xs text-neutral-400 dark:text-neutral-500">
          <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
          <span>{qaCount} Q&amp;A</span>
        </span>
      </div>
    </CardLink>
  )
}
