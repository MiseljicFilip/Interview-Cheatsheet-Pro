import { useEffect, useMemo, useState } from "react"
import { Routes, Route, Navigate, useParams } from "react-router-dom"
import { Container } from "./components"
import { EditNote } from "./EditNote"
import { NewNote } from "./NewNote"
import { Note } from "./Note"
import { NoteLayout } from "./NoteLayout"
import { NoteList } from "./NoteList"
import { Quiz } from "./Quiz"
import { Stats } from "./Stats"
import { DEFAULT_TAGS } from "./data/defaultTags"
import type { NoteData, RawNote, Tag, RawNoteData, RawCourse, RawLesson, Course } from "./types"
import { useLocalStorage } from "./useLocalStorage"
import { ref, onValue, off, push, set, remove, get } from "firebase/database"
import { db } from "./firebase"
import { CourseList } from "./courses/CourseList"
import { CourseLayout } from "./courses/CourseLayout"
import { CourseDetail } from "./courses/CourseDetail"
import { NewCourse } from "./courses/NewCourse"
import { EditCourse } from "./courses/EditCourse"
import { NewLesson } from "./courses/NewLesson"
import { EditLesson } from "./courses/EditLesson"
import { LessonDetail } from "./courses/LessonDetail"

// Re-export types so existing imports from "./App" still work
export type { Note, NoteData, RawNote, Tag } from "./types"

type RawCourseData = Omit<RawCourse, "id">
type RawLessonData = Omit<RawLesson, "id">

function NoteApp() {
  const [notes, setNotes] = useState<RawNote[]>([])
  const [courses, setCourses] = useState<RawCourse[]>([])
  const [lessons, setLessons] = useState<RawLesson[]>([])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", DEFAULT_TAGS)

  // Subscribe to notes in Realtime Database
  useEffect(() => {
    const notesRef = ref(db, "notes")
    const handleValue = (snapshot: { val: () => Record<string, RawNoteData> | null }) => {
      const val = snapshot.val()
      if (!val) {
        setNotes([])
        return
      }
      const data: RawNote[] = Object.entries(val).map(([id, docData]) => ({
        id,
        title: docData.title,
        markdown: docData.markdown,
        tagIds: docData.tagIds ?? [],
        updatedAt: docData.updatedAt ?? 0,
      }))
      setNotes(data)
    }
    onValue(notesRef, handleValue, (err) => console.error("[Realtime DB] Read error:", err))
    return () => off(notesRef)
  }, [])

  // Subscribe to courses in Realtime Database
  useEffect(() => {
    const coursesRef = ref(db, "courses")
    const handleValue = (snapshot: { val: () => Record<string, RawCourseData> | null }) => {
      const val = snapshot.val()
      if (!val) {
        setCourses([])
        return
      }
      const data: RawCourse[] = Object.entries(val).map(([id, d]) => ({
        id,
        title: d.title,
        description: d.description,
        tagId: d.tagId,
        lessonIds: d.lessonIds
          ? Array.isArray(d.lessonIds)
            ? d.lessonIds
            : Object.values(d.lessonIds as Record<string, string>)
          : [],
        createdAt: d.createdAt ?? 0,
        updatedAt: d.updatedAt ?? 0,
      }))
      setCourses(data)
    }
    onValue(coursesRef, handleValue, (err) => console.error("[Realtime DB] Courses read error:", err))
    return () => off(coursesRef)
  }, [])

  // Subscribe to lessons in Realtime Database
  useEffect(() => {
    const lessonsRef = ref(db, "lessons")
    const handleValue = (snapshot: { val: () => Record<string, RawLessonData> | null }) => {
      const val = snapshot.val()
      if (!val) {
        setLessons([])
        return
      }
      const data: RawLesson[] = Object.entries(val).map(([id, d]) => ({
        id,
        title: d.title,
        markdown: d.markdown,
        courseId: d.courseId,
        noteIds: d.noteIds
          ? Array.isArray(d.noteIds)
            ? d.noteIds
            : Object.values(d.noteIds as Record<string, string>)
          : [],
        order: d.order ?? 0,
        createdAt: d.createdAt ?? 0,
        updatedAt: d.updatedAt ?? 0,
      }))
      setLessons(data)
    }
    onValue(lessonsRef, handleValue, (err) => console.error("[Realtime DB] Lessons read error:", err))
    return () => off(lessonsRef)
  }, [])

  // One-time migration: if TAGS was already saved as [] before we had defaults, fill it
  useEffect(() => {
    const migrated = localStorage.getItem("TAGS_DEFAULTS_APPLIED")
    if (tags.length === 0 && !migrated) {
      setTags(DEFAULT_TAGS)
      localStorage.setItem("TAGS_DEFAULTS_APPLIED", "true")
    }
  }, [tags.length, setTags])

  const notesWithTags = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      })),
    [notes, tags]
  )

  const coursesWithTags = useMemo<Course[]>(
    () =>
      courses.map((course) => ({
        ...course,
        tag: tags.find((t) => t.id === course.tagId),
      })),
    [courses, tags]
  )

  // --- Note CRUD ---

  function onCreateNote({ tags: noteTags, ...data }: NoteData) {
    const notesRef = ref(db, "notes")
    const payload = {
      title: data.title ?? "",
      markdown: data.markdown ?? "",
      tagIds: noteTags.map((t) => t.id),
      updatedAt: Date.now(),
    }
    push(notesRef, payload)
      .then(() => console.log("[Realtime DB] Note created"))
      .catch((err) => console.error("[Realtime DB] Write error:", err))
  }

  function onUpdateNote(id: string, { tags: noteTags, ...data }: NoteData) {
    const noteRef = ref(db, "notes/" + id)
    set(noteRef, {
      ...data,
      tagIds: noteTags.map((t) => t.id),
      updatedAt: Date.now(),
    }).catch((err) => console.error("[Realtime DB] Update error:", err))
  }

  function onDeleteNote(id: string) {
    const noteRef = ref(db, "notes/" + id)
    remove(noteRef).catch((err) => console.error("[Realtime DB] Delete error:", err))
  }

  // --- Course CRUD ---

  async function onCreateCourse(data: { title: string; description?: string; tagId: string }) {
    const coursesRef = ref(db, "courses")
    const payload: Omit<RawCourse, "id"> = {
      ...data,
      lessonIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return push(coursesRef, payload)
      .then((ref) => ref.key)
      .catch((err) => { console.error("[Realtime DB] Course create error:", err); return null })
  }

  function onUpdateCourse(id: string, data: { title: string; description?: string; tagId: string }) {
    const courseRef = ref(db, "courses/" + id)
    const existing = courses.find((c) => c.id === id)
    set(courseRef, {
      title: data.title,
      description: data.description ?? "",
      tagId: data.tagId,
      lessonIds: existing?.lessonIds ?? [],
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }).catch((err) => console.error("[Realtime DB] Course update error:", err))
  }

  async function onDeleteCourse(id: string) {
    const course = courses.find((c) => c.id === id)
    // Delete all associated lessons first
    if (course?.lessonIds?.length) {
      await Promise.all(
        course.lessonIds.map((lid) => remove(ref(db, "lessons/" + lid)))
      )
    }
    remove(ref(db, "courses/" + id)).catch((err) => console.error("[Realtime DB] Course delete error:", err))
  }

  // --- Lesson CRUD ---

  async function onCreateLesson(data: { title: string; markdown: string; courseId: string; noteIds: string[]; order: number }) {
    const lessonsRef = ref(db, "lessons")
    const payload: Omit<RawLesson, "id"> = {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const lessonRef = await push(lessonsRef, payload)
    const lessonId = lessonRef.key
    if (!lessonId) return null

    // Add lessonId to parent course's lessonIds
    const courseRef = ref(db, "courses/" + data.courseId)
    const snap = await get(courseRef)
    const courseData = snap.val() as RawCourseData | null
    if (courseData) {
      const existing: string[] = courseData.lessonIds
        ? Array.isArray(courseData.lessonIds)
          ? courseData.lessonIds
          : Object.values(courseData.lessonIds as Record<string, string>)
        : []
      await set(courseRef, {
        ...courseData,
        lessonIds: [...existing, lessonId],
        updatedAt: Date.now(),
      })
    }
    return lessonId
  }

  function onUpdateLesson(id: string, data: { title: string; markdown: string; noteIds: string[] }) {
    const lessonRef = ref(db, "lessons/" + id)
    const existing = lessons.find((l) => l.id === id)
    set(lessonRef, {
      title: data.title,
      markdown: data.markdown,
      noteIds: data.noteIds,
      courseId: existing?.courseId ?? "",
      order: existing?.order ?? 0,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }).catch((err) => console.error("[Realtime DB] Lesson update error:", err))
  }

  async function onDeleteLesson(courseId: string, lessonId: string) {
    await remove(ref(db, "lessons/" + lessonId))
    // Remove from parent course's lessonIds
    const courseRef = ref(db, "courses/" + courseId)
    const snap = await get(courseRef)
    const courseData = snap.val() as RawCourseData | null
    if (courseData) {
      const existing: string[] = courseData.lessonIds
        ? Array.isArray(courseData.lessonIds)
          ? courseData.lessonIds
          : Object.values(courseData.lessonIds as Record<string, string>)
        : []
      await set(courseRef, {
        ...courseData,
        lessonIds: existing.filter((id) => id !== lessonId),
        updatedAt: Date.now(),
      })
    }
  }

  // --- Tag management ---

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag])
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) =>
      prevTags.map((tag) => (tag.id === id ? { ...tag, label } : tag))
    )
  }

  function deleteTag(id: string) {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id))
  }

  return (
    <Container>
      <Routes>
        <Route
          path="/"
          element={
            <NoteList
              notes={notesWithTags}
              availableTags={tags}
              onUpdateTag={updateTag}
              onDeleteTag={deleteTag}
            />
          }
        />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={addTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDelete={onDeleteNote} />} />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
        </Route>
        <Route
          path="/quiz"
          element={<Quiz notes={notesWithTags} availableTags={tags} />}
        />
        <Route
          path="/stats"
          element={<Stats notes={notesWithTags} availableTags={tags} />}
        />

        {/* Courses */}
        <Route
          path="/courses"
          element={
            <CourseList
              courses={coursesWithTags}
              availableTags={tags}
            />
          }
        />
        <Route
          path="/courses/new"
          element={
            <NewCourse
              availableTags={tags}
              onSubmit={onCreateCourse}
            />
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <CourseLayout
              courses={coursesWithTags}
              lessons={lessons}
            />
          }
        >
          <Route
            index
            element={
              <CourseDetail
                lessons={lessons}
                notes={notesWithTags}
                onDeleteCourse={onDeleteCourse}
              />
            }
          />
          <Route
            path="edit"
            element={
              <EditCourse
                availableTags={tags}
                onSubmit={onUpdateCourse}
              />
            }
          />
          <Route
            path="lessons/new"
            element={
              <NewLesson
                notes={notesWithTags}
                onSubmit={onCreateLesson}
              />
            }
          />
          <Route
            path="lessons/:lessonId"
            element={
              <LessonDetail
                notes={notesWithTags}
                onDeleteLesson={onDeleteLesson}
              />
            }
          />
          <Route
            path="lessons/:lessonId/edit"
            element={
              <EditLesson
                notes={notesWithTags}
                onSubmit={onUpdateLesson}
              />
            }
          />
          <Route
            path="quiz"
            element={
              <CourseQuizWrapper
                notes={notesWithTags}
                lessons={lessons}
                courses={coursesWithTags}
                availableTags={tags}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Container>
  )
}

// Wrapper that derives course-filtered notes and renders Quiz in course mode
type CourseQuizWrapperProps = {
  notes: Array<{ id: string; title: string; markdown: string; tags: Tag[] }>
  lessons: RawLesson[]
  courses: Course[]
  availableTags: Tag[]
}

function CourseQuizWrapper({ notes, lessons, courses, availableTags }: CourseQuizWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const course = courses.find((c) => c.id === courseId)
  const courseLessons = lessons.filter((l) => l.courseId === courseId)
  const courseNoteIds = new Set(courseLessons.flatMap((l) => l.noteIds))
  const courseNotes = notes.filter((n) => courseNoteIds.has(n.id))

  if (!course) return <Navigate to="/courses" replace />

  return (
    <Quiz
      notes={notes}
      availableTags={availableTags}
      courseId={course.id}
      courseTitle={course.title}
      preFilteredNotes={courseNotes}
    />
  )
}

export default NoteApp
