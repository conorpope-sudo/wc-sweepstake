import GameClient from './GameClient'
import { getGameLeaderboard, getGameQuestions } from '@/lib/politicianGame'

export const dynamic = 'force-dynamic'

export default async function GamePage() {
  const [questions, leaderboard] = await Promise.all([
    getGameQuestions(),
    getGameLeaderboard(),
  ])

  return (
    <section className="relative overflow-hidden px-5 py-10 md:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-[26vw] bg-brand-blue" />
        <div className="absolute right-[22vw] top-0 h-full w-14 skew-x-[-18deg] bg-brand-red" />
        <div className="absolute left-0 top-0 h-[55%] w-[70%] diagonal-lines text-brand-black opacity-[0.06]" />
        <div className="absolute left-8 top-12 font-headline text-8xl font-black text-brand-blue/10">
          ★
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-8 border-b-[5px] border-brand-black pb-6">
          <p className="mb-3 inline-block bg-brand-red px-3 py-1 font-mono text-xs font-bold uppercase text-brand-white">
            ★ 411 half-time quiz
          </p>
          <h1 className="font-headline text-6xl font-black uppercase leading-none md:text-8xl">
            Politician Or World Cup Winner?
          </h1>
        </div>

        <GameClient questions={questions} leaderboard={leaderboard} />
      </div>
    </section>
  )
}
