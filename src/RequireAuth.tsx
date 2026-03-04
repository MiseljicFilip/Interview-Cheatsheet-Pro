import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"

/**
 * Renders children only when the user is logged in. Otherwise redirects to /login.
 * Shows a minimal loading state while auth is being restored (e.g. from stored token).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500 dark:text-neutral-400">
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
