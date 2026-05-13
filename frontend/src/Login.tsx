import { Navigate } from "react-router-dom"
import { LoginForm } from "./components"
import { useAuth } from "./contexts/AuthContext"

export function Login() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500 dark:text-neutral-400">
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  )
}
