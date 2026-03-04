import { Navigate } from "react-router-dom"
import { Container, LoginForm } from "./components"
import { useAuth } from "./contexts/AuthContext"

/**
 * Login page: centered card with form. Matches .cursorrules layout (max width, padding).
 * If already logged in, redirects to home.
 */
export function Login() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500 dark:text-neutral-400">
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center">
      <LoginForm />
    </Container>
  )
}
