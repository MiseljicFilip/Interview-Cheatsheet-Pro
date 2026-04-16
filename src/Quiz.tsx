import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { Button } from "./components"
import { TagsSelect } from "./components/TagsSelect"
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react"
import type { Tag } from "./types"

type QuizNote = {
  id: string
  title: string
  markdown: string
  tags: Tag[]
}

type QuizProps = {
  notes: QuizNote[]
  availableTags: Tag[]
}

type Phase = "setup" | "question" | "results"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Quiz({ notes, availableTags }: QuizProps) {
  const [phase, setPhase] = useState<Phase>("setup")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [maxQuestions, setMaxQuestions] = useState(10)
  const [queue, setQueue] = useState<QuizNote[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [missedNotes, setMissedNotes] = useState<QuizNote[]>([])

  const filteredNotes = useMemo(() => {
    if (selectedTags.length === 0) return notes
    return notes.filter((note) =>
      selectedTags.every((tag) => note.tags.some((t) => t.id === tag.id))
    )
  }, [notes, selectedTags])

  function startQuiz() {
    const shuffled = shuffle(filteredNotes).slice(0, maxQuestions)
    setQueue(shuffled)
    setCurrentIndex(0)
    setRevealed(false)
    setCorrect(0)
    setIncorrect(0)
    setMissedNotes([])
    setPhase("question")
  }

  function handleAnswer(wasCorrect: boolean) {
    if (wasCorrect) {
      setCorrect((c) => c + 1)
    } else {
      setIncorrect((i) => i + 1)
      setMissedNotes((prev) => [...prev, queue[currentIndex]])
    }

    const next = currentIndex + 1
    if (next >= queue.length) {
      setPhase("results")
    } else {
      setCurrentIndex(next)
      setRevealed(false)
    }
  }

  function retryMissed() {
    const shuffled = shuffle(missedNotes)
    setQueue(shuffled)
    setCurrentIndex(0)
    setRevealed(false)
    setCorrect(0)
    setIncorrect(0)
    setMissedNotes([])
    setPhase("question")
  }

  function restartQuiz() {
    setPhase("setup")
    setSelectedTags([])
    setMaxQuestions(10)
  }

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-lg py-8">
        <header className="mb-8 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" className="p-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Start a Quiz
          </h1>
        </header>

        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div>
            <TagsSelect
              id="quiz-tags"
              label="Filter by tags (optional)"
              availableTags={availableTags}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="All topics"
            />
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              {filteredNotes.length} question{filteredNotes.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="max-questions"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Number of questions
            </label>
            <input
              id="max-questions"
              type="number"
              min={1}
              max={filteredNotes.length || 1}
              value={maxQuestions}
              onChange={(e) =>
                setMaxQuestions(Math.max(1, Math.min(filteredNotes.length || 1, Number(e.target.value))))
              }
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-600 dark:bg-neutral-700"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={filteredNotes.length === 0}
            onClick={startQuiz}
          >
            Start Quiz
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>

          {filteredNotes.length === 0 && (
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              No notes match the selected tags.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (phase === "question") {
    const note = queue[currentIndex]
    const total = queue.length
    const progress = ((currentIndex) / total) * 100

    return (
      <div className="mx-auto max-w-2xl py-8">
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={restartQuiz}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Exit quiz
          </button>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {currentIndex + 1} / {total}
          </span>
        </header>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className="h-full rounded-full bg-neutral-800 transition-all duration-300 dark:bg-neutral-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div className="p-6">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Question
            </p>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {note.title}
            </h2>
            {note.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!revealed ? (
            <div className="border-t border-neutral-200 p-6 dark:border-neutral-700">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setRevealed(true)}
              >
                Reveal answer
              </Button>
            </div>
          ) : (
            <>
              <div className="border-t border-neutral-200 p-6 dark:border-neutral-700">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  Answer
                </p>
                <div className="prose prose-neutral max-w-none text-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold">
                  <ReactMarkdown>{note.markdown}</ReactMarkdown>
                </div>
              </div>
              <div className="flex gap-3 border-t border-neutral-200 p-6 dark:border-neutral-700">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleAnswer(false)}
                >
                  Need review
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleAnswer(true)}
                >
                  Got it
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Results phase
  const total = queue.length
  const score = Math.round((correct / total) * 100)

  return (
    <div className="mx-auto max-w-sm py-8 text-center">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Quiz complete!
        </h1>
      </header>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <p className="mb-1 text-6xl font-bold text-neutral-900 dark:text-white">
          {score}%
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {correct} / {total} correct
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{correct}</p>
            <p className="text-xs text-green-600 dark:text-green-500">Got it</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{incorrect}</p>
            <p className="text-xs text-red-600 dark:text-red-500">Need review</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {missedNotes.length > 0 && (
          <Button variant="danger" className="w-full" onClick={retryMissed}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retry {missedNotes.length} missed question{missedNotes.length !== 1 ? "s" : ""}
          </Button>
        )}
        <Button variant="primary" className="w-full" onClick={restartQuiz}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          New quiz
        </Button>
        <Link to="/">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to notes
          </Button>
        </Link>
      </div>
    </div>
  )
}
