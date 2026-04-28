import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { ref, get, set, remove, onValue, off, push } from "firebase/database"
import { db } from "../firebase"
import { useAuth } from "./AuthContext"
import type { Team } from "../types"

// Firebase keys can't contain "." — replace with ","
function encodeEmail(email: string) {
  return email.replace(/\./g, ",")
}

type TeamContextValue = {
  teamId: string | null
  team: Team | null
  isLoadingTeam: boolean
  createTeam: (name: string) => Promise<void>
  inviteMember: (email: string) => Promise<void>
  leaveTeam: () => Promise<void>
}

const TeamContext = createContext<TeamContextValue | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.id ?? ""
  const email = user?.email ?? ""

  const [teamId, setTeamId] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoadingTeam, setIsLoadingTeam] = useState(true)

  // Load teamId for current user
  useEffect(() => {
    if (!uid) { setIsLoadingTeam(false); return }
    const userTeamRef = ref(db, `users/${uid}/teamId`)
    get(userTeamRef).then((snap) => {
      const tid = snap.val() as string | null
      setTeamId(tid)
      setIsLoadingTeam(false)
    })
  }, [uid])

  // Subscribe to team data when teamId is known
  useEffect(() => {
    if (!teamId) { setTeam(null); return }
    const teamRef = ref(db, `teams/${teamId}`)
    const handle = (snap: { val: () => Omit<Team, "id"> | null }) => {
      const val = snap.val()
      setTeam(val ? { ...val, id: teamId } : null)
    }
    onValue(teamRef, handle)
    return () => off(teamRef)
  }, [teamId])

  // Listen real-time for incoming invites and auto-join
  useEffect(() => {
    if (!uid || !email) return
    const inviteRef = ref(db, `invites/${encodeEmail(email)}`)
    const handle = async (snap: { val: () => string | null }) => {
      const invitedTeamId = snap.val()
      if (!invitedTeamId) return

      // Join the team
      await set(ref(db, `teams/${invitedTeamId}/members/${uid}`), "member")
      await set(ref(db, `users/${uid}/teamId`), invitedTeamId)
      await remove(inviteRef)
      setTeamId(invitedTeamId)
    }
    onValue(inviteRef, handle)
    return () => off(inviteRef)
  }, [uid, email])

  const createTeam = useCallback(async (name: string) => {
    if (!uid) return
    const teamsRef = ref(db, "teams")
    const newTeamRef = await push(teamsRef, {
      name,
      members: { [uid]: "owner" },
      createdAt: Date.now(),
    })
    const newTeamId = newTeamRef.key!
    await set(ref(db, `users/${uid}/teamId`), newTeamId)
    setTeamId(newTeamId)
  }, [uid])

  const inviteMember = useCallback(async (inviteeEmail: string) => {
    if (!teamId) return
    await set(ref(db, `invites/${encodeEmail(inviteeEmail)}`), teamId)
  }, [teamId])

  const leaveTeam = useCallback(async () => {
    if (!uid || !teamId) return
    await remove(ref(db, `teams/${teamId}/members/${uid}`))
    await remove(ref(db, `users/${uid}/teamId`))
    setTeamId(null)
    setTeam(null)
  }, [uid, teamId])

  return (
    <TeamContext.Provider value={{ teamId, team, isLoadingTeam, createTeam, inviteMember, leaveTeam }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error("useTeam must be used within a TeamProvider")
  return ctx
}
