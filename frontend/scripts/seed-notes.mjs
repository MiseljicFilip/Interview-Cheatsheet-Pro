/**
 * Seed script — populates Firebase Realtime Database with interview Q&A notes.
 *
 * Usage:
 *   node scripts/seed-notes.mjs
 *
 * Reads Firebase config from .env (VITE_FIREBASE_* variables).
 * Requires the firebase package already installed (npm install).
 *
 * SAFE TO RE-RUN — checks for existing notes with the same title first.
 * Pass --force to skip the duplicate check and push everything.
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, get } from "firebase/database"
import { SEED_NOTES } from "./seed-data.mjs"

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
  const notesRef = ref(db, "notes")

  let existingTitles = new Set()
  if (!force) {
    console.log("Checking for existing notes…")
    const snapshot = await get(notesRef)
    const val = snapshot.val()
    if (val) {
      existingTitles = new Set(Object.values(val).map((n) => n.title))
      console.log(`Found ${existingTitles.size} existing notes.`)
    }
  }

  let added = 0
  let skipped = 0

  for (const note of SEED_NOTES) {
    if (!force && existingTitles.has(note.title)) {
      console.log(`  SKIP  "${note.title.slice(0, 60)}"`)
      skipped++
      continue
    }

    await push(notesRef, {
      title:     note.title,
      markdown:  note.markdown,
      tagIds:    note.tagIds,
      updatedAt: Date.now(),
    })

    console.log(`  ADD   "${note.title.slice(0, 60)}"`)
    added++
  }

  console.log(`\nDone. Added: ${added}  Skipped: ${skipped}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
