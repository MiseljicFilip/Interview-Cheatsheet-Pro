import type { LoginCredentials, LoginResponse, MeResponse, User } from "../types"

const API_BASE =
  typeof import.meta.env?.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "http://localhost:3001"

/**
 * When the backend is not ready, set this to true (or use VITE_MOCK_AUTH=true in .env).
 * Login will "succeed" with a fake user so you can keep building the app.
 * When your colleague's server is ready: set to false and set VITE_API_URL.
 */
const MOCK_AUTH =
  (import.meta.env?.VITE_MOCK_AUTH ?? "true") === "true"

const MOCK_USER: User = {
  id: "mock-user-id",
  email: "you@example.com",
}

const MOCK_TOKEN = "mock-jwt-token"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calls POST /api/auth/login. In mock mode, accepts any email/password and returns a fake token + user.
 */
export async function login(
  credentials: LoginCredentials
): Promise<{ user: User; accessToken: string }> {
  if (MOCK_AUTH) {
    await delay(600)
    return {
      user: { ...MOCK_USER, email: credentials.email },
      accessToken: MOCK_TOKEN,
    }
  }

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const text = await res.text()
    let message = "Login failed"
    try {
      const json = JSON.parse(text) as { message?: string; error?: string }
      message = json.message ?? json.error ?? message
    } catch {
      if (res.status === 401) message = "Invalid email or password"
      else if (res.status >= 500) message = "Server error. Try again later."
    }
    throw new Error(message)
  }

  const data = (await res.json()) as LoginResponse
  const user = await getMe(data.accessToken)
  return { user, accessToken: data.accessToken }
}

/**
 * Calls GET /api/auth/me with the given token. In mock mode, returns the fake user for the mock token.
 */
export async function getMe(accessToken: string): Promise<User> {
  if (MOCK_AUTH && accessToken === MOCK_TOKEN) {
    await delay(200)
    return { ...MOCK_USER }
  }

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired")
    throw new Error("Failed to load user")
  }

  const data = (await res.json()) as MeResponse
  return data
}
