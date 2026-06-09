'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useMemo, useState } from 'react'
import type { GameQuestion, LeaderboardEntry } from '@/lib/politicianGame'
import { submitGameScore, type LeaderboardSubmitState } from './actions'

const ROUND_TOTAL = 15
const initialSubmitState: LeaderboardSubmitState = { status: 'idle' }

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

function answerDetail(question: GameQuestion): string {
  return question.category === 'Politician'
    ? `Political party: ${question.detail}`
    : `World Cup year: ${question.detail}`
}

function categoryLabel(category: GameQuestion['category']): string {
  return category === 'World Cup Winner' ? 'World Cup winner' : 'Politician'
}

export default function GameClient({
  questions,
  leaderboard,
}: {
  questions: GameQuestion[]
  leaderboard: LeaderboardEntry[]
}) {
  const router = useRouter()
  const roundQuestions = useMemo(
    () => shuffle(questions).slice(0, ROUND_TOTAL),
    [questions],
  )
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<GameQuestion['category'] | null>(null)
  const [saved, setSaved] = useState(false)
  const [submitState, submitAction, submitPending] = useActionState(
    submitGameScore,
    initialSubmitState,
  )

  useEffect(() => {
    if (submitState.status === 'success') {
      setSaved(true)
      router.refresh()
    }
  }, [router, submitState.status])

  const question = roundQuestions[index]
  const answered = Boolean(selected)
  const correct = selected === question?.category
  const finished = index >= ROUND_TOTAL

  function choose(category: GameQuestion['category']) {
    if (answered || finished) return
    setSelected(category)
    if (category === question.category) {
      setScore((current) => current + 1)
    }
  }

  function next() {
    setSelected(null)
    setIndex((current) => current + 1)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[10px_10px_0_#000000] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-block bg-brand-red px-3 py-1 font-mono text-xs font-bold uppercase text-brand-white">
            ★ Question {Math.min(index + 1, ROUND_TOTAL)}/{ROUND_TOTAL}
          </p>
          <p className="font-headline text-4xl font-black uppercase leading-none">
            {score}/{ROUND_TOTAL}
          </p>
        </div>

        {!finished && question && (
          <>
            <h2 className="mt-8 font-headline text-7xl font-black uppercase leading-none md:text-8xl">
              {question.name}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                disabled={answered}
                onClick={() => choose('Politician')}
                className="skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-4 font-headline text-4xl font-black uppercase leading-none text-brand-white shadow-[7px_7px_0_#000000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="inline-block skew-x-[12deg]">Politician</span>
              </button>
              <button
                type="button"
                disabled={answered}
                onClick={() => choose('World Cup Winner')}
                className="skew-x-[-12deg] border-[3px] border-brand-black bg-brand-red px-6 py-4 font-headline text-4xl font-black uppercase leading-none text-brand-white shadow-[7px_7px_0_#000000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="inline-block skew-x-[12deg]">
                  World Cup Winner
                </span>
              </button>
            </div>

            {answered && (
              <div
                className={`mt-8 border-[3px] p-5 ${
                  correct
                    ? 'border-brand-blue bg-brand-blue text-brand-white'
                    : 'border-brand-red bg-brand-white text-brand-black'
                }`}
              >
                <p className="font-headline text-5xl font-black uppercase leading-none">
                  {correct ? 'Correct!' : 'Wrong!'}
                </p>
                <p className="mt-3 font-mono text-sm font-bold uppercase">
                  Answer: {categoryLabel(question.category)}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Country: {question.country}
                </p>
                <p className="text-lg font-semibold">{answerDetail(question)}</p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-5 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-white px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-black shadow-[5px_5px_0_#000000]"
                >
                  <span className="inline-block skew-x-[12deg]">
                    {index + 1 === ROUND_TOTAL ? 'Finish' : 'Next'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {finished && (
          <div>
            <h2 className="mt-8 font-headline text-7xl font-black uppercase leading-none md:text-8xl">
              Full Time
            </h2>
            <p className="mt-4 text-2xl font-bold">
              You scored {score} out of {ROUND_TOTAL}.
            </p>

            {!saved && submitState.status !== 'success' && (
              <form
                action={submitAction}
                className="mt-8 max-w-md"
              >
                <input type="hidden" name="score" value={score} />
                <input type="hidden" name="total" value={ROUND_TOTAL} />
                <label className="block">
                  <span className="font-mono text-xs font-bold uppercase">
                    Leaderboard name
                  </span>
                  <input
                    name="name"
                    className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-4 py-3 font-mono text-base focus:outline-none focus:ring-[3px] focus:ring-brand-blue"
                    maxLength={60}
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitPending}
                  className="mt-5 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-7 py-4 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[7px_7px_0_#000000] disabled:opacity-60"
                >
                  <span className="inline-block skew-x-[12deg]">
                    {submitPending ? 'Saving...' : 'Add Score'}
                  </span>
                </button>
              </form>
            )}

            {submitState.status !== 'idle' && (
              <p
                className={`mt-5 font-mono text-sm font-bold uppercase ${
                  submitState.status === 'success'
                    ? 'text-brand-blue'
                    : 'text-brand-red'
                }`}
              >
                {submitState.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setIndex(0)
                setScore(0)
                setSelected(null)
                setSaved(false)
              }}
              className="mt-7 border-[3px] border-brand-black bg-brand-white px-5 py-3 font-mono text-xs font-bold uppercase shadow-[5px_5px_0_#000000]"
            >
              Play Again
            </button>
          </div>
        )}
      </section>

      <aside className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[10px_10px_0_#000000]">
        <h2 className="font-headline text-5xl font-black uppercase leading-none">
          Leaderboard
        </h2>
        <div className="mt-5 space-y-3">
          {leaderboard.map((entry, entryIndex) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 border-b border-brand-black/20 pb-3"
            >
              <div>
                <p className="font-mono text-xs font-bold uppercase">
                  #{entryIndex + 1}
                </p>
                <p className="text-lg font-black">{entry.name}</p>
              </div>
              <p className="font-headline text-4xl font-black leading-none">
                {entry.score}/{entry.total}
              </p>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-sm font-semibold">No scores yet.</p>
          )}
        </div>
      </aside>
    </div>
  )
}
