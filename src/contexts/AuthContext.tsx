import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth } from "../firebase"
import type { LoginCredentials, User } from "../types"

type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
}

type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toUser(firebaseUser) : null)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      setError("Google sign-in failed. Try again.")
    })
  }, [])

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError("Invalid email or password")
      throw new Error("Invalid email or password")
    }
  }, [])

  const signup = useCallback(async ({ email, password }: LoginCredentials) => {
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      const message =
        code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : "Could not create account. Try again."
      setError(message)
      throw new Error(message)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    await signInWithRedirect(auth, new GoogleAuthProvider())
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
