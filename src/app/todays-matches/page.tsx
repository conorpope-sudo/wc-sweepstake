import Link from 'next/link'
import TrackerShell from '@/components/tracker/TrackerShell'
import { getTodayWindow, getTodaysMatches, hasDrawRun } from '@/lib/tracker'

export const dynamic = 'force-dynamic'

function ownerLabel(owner: string | null) {
  return owner ? ` (${owner})` : ' (Unclaimed)'
}

export default async function TodaysMatchesPage() {
  const drawHasRun = await hasDrawRun()
  const matches = drawHasRun ? await getTodaysMatches() : []
  const { start, end } = getTodayWindow()

  return (
    <TrackerShell eyebrow="08:00 to 08:00 UK" title="Today">
      {!drawHasRun ? (
        <div className="max-w-3xl border-[3px] border-brand-black bg-brand-white p-6 shadow-[10px_10px_0_#000000]">
          <h2 className="font-headline text-5xl font-black uppercase leading-none">
            Draw pending
          </h2>
          <p className="mt-3 text-lg font-semibold">
            Today&apos;s Matches will appear after the draw has run.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000]"
          >
            <span className="inline-block skew-x-[12deg]">Back home</span>
          </Link>
        </div>
      ) : matches.length === 0 ? (
        <div className="max-w-3xl border-[3px] border-brand-black bg-brand-white p-6 shadow-[10px_10px_0_#000000]">
          <h2 className="font-headline text-5xl font-black uppercase leading-none">
            No matches today
          </h2>
          <p className="mt-3 text-lg font-semibold">
            There are no cached World Cup fixtures between{' '}
            {start.toISOString().slice(0, 10)} and{' '}
            {end.toISOString().slice(0, 10)}{' '}
            in the 08:00 UK daily window.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {matches.map((match) => (
            <article
              key={match.fixture.id}
              className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-brand-black pb-3">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-blue">
                  {match.ukDayDate}
                </p>
                <p className="skew-x-[-12deg] bg-brand-red px-4 py-1 font-headline text-3xl font-black uppercase leading-none text-brand-white">
                  <span className="inline-block skew-x-[12deg]">
                    {match.ukTime}
                  </span>
                </p>
              </div>
              <p className="mt-4 font-headline text-4xl font-black uppercase leading-none md:text-6xl">
                {match.fixture.teamA}
                <span className="text-brand-blue">{ownerLabel(match.teamAOwner)}</span>
                <span className="mx-3 text-brand-red">v</span>
                {match.fixture.teamB}
                <span className="text-brand-blue">{ownerLabel(match.teamBOwner)}</span>
              </p>
              {match.fixture.ground && (
                <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest">
                  {match.fixture.ground}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </TrackerShell>
  )
}
