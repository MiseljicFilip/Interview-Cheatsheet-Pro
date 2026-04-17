/**
 * Seed script — populates Firebase with courses and lessons.
 *
 * Usage:
 *   node scripts/seed-courses.mjs
 *
 * Reads Firebase config from .env (VITE_FIREBASE_* variables).
 * SAFE TO RE-RUN — checks for existing courses by title first.
 * Pass --force to skip the duplicate check.
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, get, set } from "firebase/database"
import { SEED_COURSES, SEED_LESSONS } from "./seed-course-data.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const force = process.argv.includes("--force")

// ── Read .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, "../.env")
  const lines = readFileSync(envPath, "utf8").split("\n")
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    env[key] = val
  }
  return env
}

const env = loadEnv()

const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_DATABASE_URL",
]

for (const v of requiredVars) {
  if (!env[v]) {
    console.error(`Missing required env var: ${v}`)
    process.exit(1)
  }
}

// ── Firebase init ─────────────────────────────────────────────────────────────
const app = initializeApp({
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
  databaseURL:       env.VITE_FIREBASE_DATABASE_URL,
})

const db = getDatabase(app)

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  const now = Date.now()

  // 1. Load existing notes so we can resolve noteTitleRefs → noteIds
  console.log("Loading existing notes…")
  const notesSnap = await get(ref(db, "notes"))
  const notesVal = notesSnap.val() ?? {}
  const notesByTitle = new Map(
    Object.entries(notesVal).map(([id, n]) => [n.title, id])
  )
  console.log(`Found ${notesByTitle.size} notes in DB.`)

  // 2. Load existing courses to check for duplicates
  const coursesSnap = await get(ref(db, "courses"))
  const existingCourses = coursesSnap.val() ?? {}
  const existingCourseTitles = new Set(
    Object.values(existingCourses).map((c) => c.title)
  )
  console.log(`Found ${existingCourseTitles.size} existing courses.`)

  // 3. Push courses and collect title → id map
  const courseTitleToId = new Map(
    Object.entries(existingCourses).map(([id, c]) => [c.title, id])
  )

  let coursesAdded = 0
  let coursesSkipped = 0

  for (const course of SEED_COURSES) {
    if (!force && existingCourseTitles.has(course.title)) {
      console.log(`  SKIP  course "${course.title}"`)
      coursesSkipped++
      continue
    }
    const newRef = await push(ref(db, "courses"), {
      title: course.title,
      description: course.description ?? "",
      tagId: course.tagId,
      lessonIds: [],
      createdAt: now,
      updatedAt: now,
    })
    courseTitleToId.set(course.title, newRef.key)
    console.log(`  ADD   course "${course.title}" → ${newRef.key}`)
    coursesAdded++
  }

  console.log(`\nCourses — Added: ${coursesAdded}  Skipped: ${coursesSkipped}`)

  // 4. Push lessons and update parent course.lessonIds
  let lessonsAdded = 0
  let lessonsSkipped = 0

  // Group lessons by course for efficient lessonIds update
  const lessonIdsByCourse = new Map()

  // Pre-load existing lessonIds for courses we're touching
  for (const [title, id] of courseTitleToId.entries()) {
    const snap = await get(ref(db, `courses/${id}`))
    const data = snap.val()
    if (data?.lessonIds) {
      const ids = Array.isArray(data.lessonIds)
        ? data.lessonIds
        : Object.values(data.lessonIds)
      lessonIdsByCourse.set(id, ids)
    } else {
      lessonIdsByCourse.set(id, [])
    }
  }

  // Load existing lessons to check for duplicates
  const lessonsSnap = await get(ref(db, "lessons"))
  const lessonsVal = lessonsSnap.val() ?? {}
  const existingLessonTitles = new Set(
    Object.values(lessonsVal).map((l) => `${l.courseId}::${l.title}`)
  )

  for (const lesson of SEED_LESSONS) {
    const courseId = courseTitleToId.get(lesson.courseTitleRef)
    if (!courseId) {
      console.warn(`  WARN  No course found for ref "${lesson.courseTitleRef}" — skipping lesson "${lesson.title}"`)
      continue
    }

    const dedupeKey = `${courseId}::${lesson.title}`
    if (!force && existingLessonTitles.has(dedupeKey)) {
      console.log(`  SKIP  lesson "${lesson.title}"`)
      lessonsSkipped++
      continue
    }

    // Resolve note title refs to IDs
    const noteIds = (lesson.noteTitleRefs ?? [])
      .map((title) => notesByTitle.get(title))
      .filter(Boolean)

    const newRef = await push(ref(db, "lessons"), {
      title: lesson.title,
      markdown: lesson.markdown,
      courseId,
      noteIds,
      order: lesson.order ?? 0,
      createdAt: now,
      updatedAt: now,
    })

    const lessonId = newRef.key
    const existing = lessonIdsByCourse.get(courseId) ?? []
    lessonIdsByCourse.set(courseId, [...existing, lessonId])
    console.log(`  ADD   lesson "${lesson.title}" → ${lessonId}`)
    lessonsAdded++
  }

  console.log(`\nLessons — Added: ${lessonsAdded}  Skipped: ${lessonsSkipped}`)

  // 5. Update each course's lessonIds
  console.log("\nUpdating course lessonIds…")
  for (const [courseId, lessonIds] of lessonIdsByCourse.entries()) {
    const courseRef = ref(db, `courses/${courseId}`)
    const snap = await get(courseRef)
    const data = snap.val()
    if (data) {
      await set(courseRef, { ...data, lessonIds, updatedAt: now })
      console.log(`  UPDATE course ${courseId} → ${lessonIds.length} lessons`)
    }
  }

  console.log("\nDone.")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
