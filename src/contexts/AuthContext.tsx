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

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError("Invalid email or password")
      throw new Error("Invalid email or password")
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value: AuthContextValue = {
    user,
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
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
