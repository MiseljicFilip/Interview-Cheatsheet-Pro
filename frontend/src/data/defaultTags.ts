import type { Tag } from "../types"

const LABELS = [
  "React",
  "JavaScript",
  "Node.js",
  "Redux",
  "TypeScript",
  "Express",
  "SQL",
] as const

/**
 * Default tags for new users (interview tech stack).
 * IDs are stable (default-*) so they stay consistent before any user edit.
 */
export const DEFAULT_TAGS: Tag[] = LABELS.map((label) => ({
  id: `default-${label.toLowerCase().replace(/\./g, "")}`,
  label,
}))
