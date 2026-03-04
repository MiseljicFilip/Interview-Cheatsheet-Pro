import { FormEvent, useState } from "react"
import { LogIn } from "lucide-react"
import { Button, Card } from "./index"
import { useAuth } from "../contexts/AuthContext"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  function validate(): boolean {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setValidationError("Email is required.")
      return false
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address.")
      return false
    }
    if (!password) {
      setValidationError("Password is required.")
      return false
    }
    setValidationError(null)
    clearError()
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await login({ email: email.trim(), password })
    } catch {
      // Error is shown from context
    }
  }

  const displayError = validationError ?? error
  const inputClass =
    "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:placeholder:text-neutral-500"

  return (
    <Card as="section" className="max-w-md mx-auto" aria-labelledby="login-heading">
      <h1
        id="login-heading"
        className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6"
      >
        Sign in
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {displayError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200"
          >
            {displayError}
          </div>
        )}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            disabled={isLoading}
            aria-required
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
            disabled={isLoading}
            aria-required
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            "Signing in…"
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
