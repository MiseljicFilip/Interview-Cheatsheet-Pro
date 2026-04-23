import { FormEvent, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./index"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Mode = "signin" | "signup"

export function LoginForm() {
  const { login, signup, loginWithGoogle, isLoading, error, clearError } = useAuth()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setValidationError(null)
    clearError()
  }

  function validate(): boolean {
    if (!EMAIL_REGEX.test(email.trim())) {
      setValidationError("Enter a valid email address.")
      return false
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.")
      return false
    }
    if (mode === "signup" && password !== confirmPassword) {
      setValidationError("Passwords do not match.")
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
      if (mode === "signin") {
        await login({ email: email.trim(), password })
      } else {
        await signup({ email: email.trim(), password })
      }
    } catch {
      // Error shown from context
    }
  }

  const displayError = validationError ?? error
  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 transition-colors focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"

  return (
    <div className="w-full max-w-sm">
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <img src="/icon.svg" alt="RecallStack" className="h-14 w-14 rounded-2xl shadow-md" />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            RecallStack
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "signin"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
          >
            {displayError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
            disabled={isLoading}
            required
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-1.5">
            <label htmlFor="auth-confirm" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirm password
            </label>
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              disabled={isLoading}
              required
            />
          </div>
        )}

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
          {isLoading
            ? mode === "signin" ? "Signing in…" : "Creating account…"
            : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-400">or</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
