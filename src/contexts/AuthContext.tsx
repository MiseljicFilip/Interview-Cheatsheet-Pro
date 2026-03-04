import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import * as authApi from "../api/auth"
import type { LoginCredentials, User } from "../types"

const AUTH_TOKEN_KEY = "NOTES_AUTH_TOKEN"

type AuthState = {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  // On mount: if we have a stored token, try to restore the user (getMe).
  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    authApi
      .getMe(token)
      .then((u) => {
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null)
    setIsLoading(true)
    try {
      const { user: u, accessToken } = await authApi.login(credentials)
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
      setToken(accessToken)
      setUser(u)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed"
      setError(message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
