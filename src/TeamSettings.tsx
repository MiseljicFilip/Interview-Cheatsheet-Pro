import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Copy, LogOut, Plus, Users } from "lucide-react"
import { Button } from "./components"
import { useTeam } from "./contexts/TeamContext"

export function TeamSettings() {
  const { team, teamId, isLoadingTeam, createTeam, inviteMember, leaveTeam } = useTeam()
  const [teamName, setTeamName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteSent, setInviteSent] = useState(false)
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 transition-colors focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800/60 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim()) return
    setCreating(true)
    await createTeam(teamName.trim())
    setCreating(false)
    setTeamName("")
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    await inviteMember(inviteEmail.trim())
    setInviteSent(true)
    setInviting(false)
    setInviteEmail("")
    setTimeout(() => setInviteSent(false), 3000)
  }

  if (isLoadingTeam) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="py-8">
      <header className="mb-8 flex items-center gap-4">
        <Link to="/">
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Team</h1>
      </header>

      {!team ? (
        <div className="mx-auto max-w-sm">
          <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-neutral-100 p-2.5 dark:bg-neutral-700">
                <Users className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-white">Create a team</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Share notes, courses and tags with teammates.
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className={inputClass}
                disabled={creating}
                required
              />
              <Button type="submit" variant="primary" disabled={creating} className="w-full">
                <Plus className="h-4 w-4" aria-hidden />
                {creating ? "Creating…" : "Create team"}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-sm space-y-5">
          {/* Team info */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900 dark:text-white">{team.name}</h2>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <span>ID:</span>
              <code className="font-mono">{teamId}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(teamId ?? "")}
                className="ml-1 rounded p-0.5 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Copy team ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </p>
          </div>

          {/* Members */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Members
            </h3>
            <ul className="space-y-2">
              {Object.entries(team.members).map(([uid, role]) => (
                <li key={uid} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                    {uid}
                  </span>
                  <span className="ml-2 shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    {role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Invite */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Invite member
            </h3>
            {inviteSent && (
              <div className="mb-3 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                Invite sent — they'll be added automatically when they open the app.
              </div>
            )}
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className={inputClass}
                disabled={inviting}
                required
              />
              <Button type="submit" variant="primary" disabled={inviting} className="shrink-0">
                {inviting ? "…" : "Invite"}
              </Button>
            </form>
          </div>

          {/* Leave */}
          <button
            type="button"
            onClick={leaveTeam}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Leave team
          </button>
        </div>
      )}
    </div>
  )
}
