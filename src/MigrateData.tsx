import { useEffect, useState } from "react"
import { ref, get, set, remove } from "firebase/database"
import { db } from "./firebase"
import { useAuth } from "./contexts/AuthContext"

const MIGRATION_KEY = "DATA_MIGRATED_V1"

type MigrationStatus = "checking" | "migrating" | "done" | "skipped" | "error"

export function MigrateData({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [status, setStatus] = useState<MigrationStatus>("checking")

  useEffect(() => {
    if (!user) return

    const alreadyMigrated = localStorage.getItem(MIGRATION_KEY)
    if (alreadyMigrated) {
      setStatus("done")
      return
    }

    async function migrate() {
      setStatus("migrating")
      try {
        const [notesSnap, coursesSnap, lessonsSnap] = await Promise.all([
          get(ref(db, "notes")),
          get(ref(db, "courses")),
          get(ref(db, "lessons")),
        ])

        const uid = user!.id
        const writes: Promise<void>[] = []

        if (notesSnap.exists()) {
          writes.push(set(ref(db, `users/${uid}/notes`), notesSnap.val()))
        }
        if (coursesSnap.exists()) {
          writes.push(set(ref(db, `users/${uid}/courses`), coursesSnap.val()))
        }
        if (lessonsSnap.exists()) {
          writes.push(set(ref(db, `users/${uid}/lessons`), lessonsSnap.val()))
        }

        await Promise.all(writes)

        // Remove old root data only after successful write
        const deletes: Promise<void>[] = []
        if (notesSnap.exists()) deletes.push(remove(ref(db, "notes")))
        if (coursesSnap.exists()) deletes.push(remove(ref(db, "courses")))
        if (lessonsSnap.exists()) deletes.push(remove(ref(db, "lessons")))
        await Promise.all(deletes)

        localStorage.setItem(MIGRATION_KEY, "true")
        setStatus("done")
      } catch (err) {
        console.error("[Migration] Failed:", err)
        setStatus("error")
      }
    }

    migrate()
  }, [user])

  if (status === "checking" || status === "migrating") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {status === "migrating" ? "Migrating your data…" : "Loading…"}
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-red-500">
          Data migration failed. Please refresh and try again.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
