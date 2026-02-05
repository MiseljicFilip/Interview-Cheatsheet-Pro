import { type ReactNode } from "react"
import { Link, type LinkProps } from "react-router-dom"

type CardLinkProps = LinkProps & {
  children: ReactNode
  className?: string
}

/**
 * Card that is a link: same look as Card but navigates.
 * Hover lift + focus ring for a11y (per .cursorrules).
 */
export function CardLink({ children, className = "", ...linkProps }: CardLinkProps) {
  return (
    <Link
      {...linkProps}
      className={`block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-visible:ring-neutral-400 ${className}`}
    >
      {children}
    </Link>
  )
}
