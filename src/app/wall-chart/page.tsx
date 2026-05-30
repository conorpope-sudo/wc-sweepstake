import Link from 'next/link'
import TrackerShell from '@/components/tracker/TrackerShell'
import {
  getWallChartData,
  hasDrawRun,
  roundLabel,
  type WallChartGroup,
  type WallChartRound,
} from '@/lib/tracker'
import { formatUkDate, formatUkTime } from '@/lib/datetime'

export const dynamic = 'force-dynamic'

function MatchLine({
  teamA,
  teamB,
  kickoffUtc,
}: {
  teamA: string
  teamB: string
  kickoffUtc: Date
}) {
  return (
    <div className="border-t border-brand-black/25 py-2 first:border-t-0">
      <p className="font-headline text-2xl font-black uppercase leading-none">
        {teamA} <span className="text-brand-red">v</span> {teamB}
      </p>
      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-blue">
        {formatUkDate(kickoffUtc)} / {formatUkTime(kickoffUtc)}
      </p>
    </div>
  )
}

function GroupCard({ group }: { group: WallChartGroup }) {
  return (
    <section className="border-[3px] border-brand-black bg-brand-white p-4 shadow-[7px_7px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">
        Group {group.group}
      </h2>
      <div className="mt-4 space-y-2">
        {group.teams.map((item) => (
          <div
            key={item.team.id}
            className="flex items-center justify-between gap-3 border-t border-brand-black/25 pt-2 first:border-t-0 first:pt-0"
          >
            <span className="font-headline text-3xl font-black uppercase leading-none">
              {item.team.name}
            </span>
            <span className="text-right font-mono text-[10px] font-bold uppercase tracking-widest text-brand-blue">
              {item.ownerName ?? 'Unclaimed'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t-[3px] border-brand-black pt-3">
        {group.fixtures.slice(0, 6).map((fixture) => (
          <MatchLine
            key={fixture.id}
            teamA={fixture.teamA}
            teamB={fixture.teamB}
            kickoffUtc={fixture.kickoffUtc}
          />
        ))}
      </div>
    </section>
  )
}

function RoundCard({ round }: { round: WallChartRound }) {
  return (
    <section className="min-w-[280px] border-[3px] border-brand-black bg-brand-white p-4 shadow-[7px_7px_0_#000000]">
      <h2 className="font-headline text-4xl font-black uppercase leading-none text-brand-blue">
        {roundLabel(round.round)}
      </h2>
      <div className="mt-3">
        {round.fixtures.map((fixture) => (
          <MatchLine
            key={fixture.id}
            teamA={fixture.teamA}
            teamB={fixture.teamB}
            kickoffUtc={fixture.kickoffUtc}
          />
        ))}
      </div>
    </section>
  )
}

export default async function WallChartPage() {
  const drawHasRun = await hasDrawRun()
  const data = drawHasRun ? await getWallChartData() : null

  return (
    <TrackerShell eyebrow="All 104 fixtures" title="Wall Chart">
      {!drawHasRun || !data ? (
        <div className="max-w-3xl border-[3px] border-brand-black bg-brand-white p-6 shadow-[10px_10px_0_#000000]">
          <h2 className="font-headline text-5xl font-black uppercase leading-none">
            Draw pending
          </h2>
          <p className="mt-3 text-lg font-semibold">
            The wall chart will appear after the draw has run.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000]"
          >
            <span className="inline-block skew-x-[12deg]">Back home</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <div>
            <h2 className="mb-5 font-headline text-6xl font-black uppercase leading-none">
              Groups
            </h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.groups.map((group) => (
                <GroupCard key={group.group} group={group} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-5 font-headline text-6xl font-black uppercase leading-none">
              Knockouts
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4">
              {data.knockoutRounds.map((round) => (
                <RoundCard key={round.round} round={round} />
              ))}
            </div>
          </div>
        </div>
      )}
    </TrackerShell>
  )
}
