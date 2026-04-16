import { useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Brain, Flame, Target } from "lucide-react"
import type { Note, QuizSession, Tag } from "./types"

const SESSIONS_KEY = "QUIZ_SESSIONS"

function loadSessions(): QuizSession[] {
  const raw = localStorage.getItem(SESSIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function calcStreak(sessions: QuizSession[]): number {
  if (sessions.length === 0) return 0
  const days = Array.from(
    new Set(sessions.map((s) => new Date(s.date).toDateString()))
  ).map((d) => new Date(d).getTime())
  days.sort((a, b) => b - a)

  const today = new Date().toDateString()
  const todayMs = new Date(today).getTime()
  const oneDayMs = 86400000

  let streak = 0
  let expected = days[0] === todayMs ? todayMs : todayMs - oneDayMs
  for (const day of days) {
    if (day === expected) {
      streak++
      expected -= oneDayMs
    } else {
      break
    }
  }
  return streak
}

type StatsProps = {
  notes: (Note & { updatedAt?: number })[]
  availableTags: Tag[]
}

export function Stats({ notes, availableTags }: StatsProps) {
  const sessions = useMemo(() => loadSessions(), [])

  const totalQuestions = notes.length
  const totalQuizzes = sessions.length
  const streak = useMemo(() => calcStreak(sessions), [sessions])

  const overallAccuracy = useMemo(() => {
    if (sessions.length === 0) return null
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0)
    const totalAnswered = sessions.reduce((sum, s) => sum + s.total, 0)
    return totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100)
  }, [sessions])

  // Questions per tag
  const tagStats = useMemo(() => {
    return availableTags
      .map((tag) => ({
        tag,
        count: notes.filter((n) => n.tags.some((t) => t.id === tag.id)).length,
      }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [notes, availableTags])

  const maxTagCount = tagStats[0]?.count ?? 1
  const untaggedCount = notes.filter((n) => n.tags.length === 0).length

  // Weak spots: tags sorted by accuracy across sessions
  const weakSpots = useMemo(() => {
    const tagAccuracy: Record<string, { correct: number; total: number }> = {}

    for (const session of sessions) {
      const tagsForSession =
        session.tagIds.length > 0 ? session.tagIds : availableTags.map((t) => t.id)

      for (const tagId of tagsForSession) {
        if (!tagAccuracy[tagId]) tagAccuracy[tagId] = { correct: 0, total: 0 }
        // Distribute proportionally — approximate since we don't store per-tag breakdown
        tagAccuracy[tagId].total += session.total / tagsForSession.length
        tagAccuracy[tagId].correct += session.correct / tagsForSession.length
      }
    }

    return availableTags
      .filter((t) => tagAccuracy[t.id] && tagAccuracy[t.id].total >= 3)
      .map((t) => ({
        tag: t,
        accuracy: Math.round((tagAccuracy[t.id].correct / tagAccuracy[t.id].total) * 100),
        total: Math.round(tagAccuracy[t.id].total),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
  }, [sessions, availableTags])

  const recentSessions = sessions.slice(0, 10)

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
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Stats</h1>
      </header>

      {/* Overview cards */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total questions"
          value={totalQuestions}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Quizzes taken"
          value={totalQuizzes}
        />
        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Overall accuracy"
          value={overallAccuracy !== null ? `${overallAccuracy}%` : "—"}
          accent={
            overallAccuracy !== null
              ? overallAccuracy >= 80
                ? "green"
                : overallAccuracy >= 60
                ? "yellow"
                : "red"
              : undefined
          }
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Day streak"
          value={streak}
          accent={streak >= 3 ? "green" : undefined}
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Questions by tag */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Questions by topic
          </h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            {tagStats.length === 0 ? (
              <p className="text-sm text-neutral-500">No tagged questions yet.</p>
            ) : (
              <ul className="space-y-3">
                {tagStats.map(({ tag, count }) => (
                  <li key={tag.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {tag.label}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-neutral-800 transition-all dark:bg-neutral-100"
                        style={{ width: `${(count / maxTagCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
                {untaggedCount > 0 && (
                  <li className="pt-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-neutral-400 dark:text-neutral-500">Untagged</span>
                      <span className="text-neutral-400 dark:text-neutral-500">{untaggedCount}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-neutral-300 dark:bg-neutral-600"
                        style={{ width: `${(untaggedCount / maxTagCount) * 100}%` }}
                      />
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>

        {/* Weak spots */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Weak spots
          </h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            {weakSpots.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Complete a few quizzes to see which topics need more work.
              </p>
            ) : (
              <ul className="space-y-3">
                {weakSpots.map(({ tag, accuracy }) => (
                  <li key={tag.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {tag.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            accuracy >= 80
                              ? "bg-green-500"
                              : accuracy >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span
                        className={`w-10 text-right text-sm font-semibold ${
                          accuracy >= 80
                            ? "text-green-600 dark:text-green-400"
                            : accuracy >= 60
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {accuracy}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Recent quiz history */}
      <section className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-200">
          Recent quizzes
        </h2>
        {recentSessions.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No quizzes yet.{" "}
              <Link to="/quiz" className="font-medium text-neutral-800 underline dark:text-neutral-200">
                Start your first one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left dark:border-neutral-700">
                  <th className="px-5 py-3 font-medium text-neutral-500 dark:text-neutral-400">Date</th>
                  <th className="px-5 py-3 font-medium text-neutral-500 dark:text-neutral-400">Topics</th>
                  <th className="px-5 py-3 font-medium text-neutral-500 dark:text-neutral-400">Score</th>
                  <th className="px-5 py-3 font-medium text-neutral-500 dark:text-neutral-400 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session, i) => {
                  const accuracy = Math.round((session.correct / session.total) * 100)
                  const sessionTags =
                    session.tagIds.length > 0
                      ? availableTags.filter((t) => session.tagIds.includes(t.id))
                      : []
                  return (
                    <tr
                      key={session.id}
                      className={i < recentSessions.length - 1 ? "border-b border-neutral-100 dark:border-neutral-700/50" : ""}
                    >
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                        {formatDate(session.date)}
                      </td>
                      <td className="px-5 py-3">
                        {sessionTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {sessionTags.map((t) => (
                              <span
                                key={t.id}
                                className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                              >
                                {t.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500">All topics</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-neutral-700 dark:text-neutral-300">
                        {session.correct}/{session.total}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            accuracy >= 80
                              ? "text-green-600 dark:text-green-400"
                              : accuracy >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {accuracy}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

type AccentColor = "green" | "yellow" | "red"

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  accent?: AccentColor
}) {
  const valueClass =
    accent === "green"
      ? "text-green-600 dark:text-green-400"
      : accent === "yellow"
      ? "text-yellow-600 dark:text-yellow-400"
      : accent === "red"
      ? "text-red-600 dark:text-red-400"
      : "text-neutral-900 dark:text-white"

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-3 text-neutral-400 dark:text-neutral-500">{icon}</div>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  )
}
