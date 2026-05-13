import { type ReactNode } from "react"

type CardProps = {
  children: ReactNode
  className?: string
  as?: "div" | "article" | "section"
}

/**
 * Card with soft shadow and 2xl rounded corners (per .cursorrules).
 * Use for note cards and content blocks.
 */
export function Card({
  children,
  className = "",
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
    >
      {children}
    </Component>
  )
}
