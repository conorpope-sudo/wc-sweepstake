import { and, asc, eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { fixtures, type Fixture } from '@/db/schema'
import { formatUkDate, formatUkDayDate, formatUkTime } from './datetime'

export interface TeamFixtureView {
  opponent: string
  opponentIsTeam: boolean
  round: string
  group: string | null
  kickoffUtc: Date
  ukTime: string // "6pm"
  ukDate: string // "26 June"
  ukDayDate: string // "Monday, 22 June"
  status: 'scheduled' | 'completed'
  scoreFor: number | null
  scoreAgainst: number | null
  ground: string | null
}

function toView(team: string, f: Fixture): TeamFixtureView {
  const isTeamA = f.teamA === team
  return {
    opponent: isTeamA ? f.teamB : f.teamA,
    opponentIsTeam: isTeamA ? f.teamBIsTeam : f.teamAIsTeam,
    round: f.round,
    group: f.group,
    kickoffUtc: f.kickoffUtc,
    ukTime: formatUkTime(f.kickoffUtc),
    ukDate: formatUkDate(f.kickoffUtc),
    ukDayDate: formatUkDayDate(f.kickoffUtc),
    status: f.status as 'scheduled' | 'completed',
    scoreFor: isTeamA ? f.scoreA : f.scoreB,
    scoreAgainst: isTeamA ? f.scoreB : f.scoreA,
    ground: f.ground,
  }
}

// All cached fixtures involving a team, earliest first. Only matches where the
// team appears by name resolve here — knockout placeholders won't until the feed
// fills them in.
export async function getTeamFixtures(
  teamName: string,
): Promise<TeamFixtureView[]> {
  const rows = await db
    .select()
    .from(fixtures)
    .where(or(eq(fixtures.teamA, teamName), eq(fixtures.teamB, teamName)))
    .orderBy(asc(fixtures.kickoffUtc))

  return rows.map((f) => toView(teamName, f))
}

// The three group-stage fixtures for a team — used by the draw result email.
export async function getTeamGroupFixtures(
  teamName: string,
): Promise<TeamFixtureView[]> {
  const rows = await db
    .select()
    .from(fixtures)
    .where(
      and(
        eq(fixtures.round, 'group'),
        or(eq(fixtures.teamA, teamName), eq(fixtures.teamB, teamName)),
      ),
    )
    .orderBy(asc(fixtures.kickoffUtc))

  return rows.map((f) => toView(teamName, f))
}
