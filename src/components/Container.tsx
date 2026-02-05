import { type ReactNode } from "react"

type ContainerProps = {
  children: ReactNode
  className?: string
}

/**
 * Max-width wrapper with consistent horizontal padding.
 * Matches .cursorrules: max-w-6xl, px-4/6, py-12+
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-container px-4 py-8 sm:px-6 sm:py-12 ${className}`}>
      {children}
    </div>
  )
}
