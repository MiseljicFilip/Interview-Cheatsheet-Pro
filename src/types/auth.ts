/**
 * Auth types matching the API contract from .cursorrules (POST /api/auth/login, GET /api/auth/me).
 * Use these when the backend is ready so request/response shapes stay consistent.
 */

export type User = {
  id: string
  email: string
}

export type LoginCredentials = {
  email: string
  password: string
}

/** Response from POST /api/auth/login */
export type LoginResponse = {
  accessToken: string
}

/** Response from GET /api/auth/me */
export type MeResponse = User
