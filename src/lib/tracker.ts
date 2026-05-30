import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { assignments, entries, fixtures, teams, type Fixture, type Team } from '@/db/schema'
import { formatUkDayDate, formatUkTime } from './datetime'
import { getDrawStatus } from './draw'

export interface TeamOwnerView {
  team: Team
  ownerName: string | null
}

export interface MatchOwnerView {
  fixture: Fixture
  teamAOwner: string | null
  teamBOwner: string | null
  ukDayDate: string
  ukTime: string
}

export interface WallChartGroup {
  group: string
  teams: TeamOwnerView[]
  fixtures: Fixture[]
}

export interface WallChartRound {
  round: string
  fixtures: Fixture[]
}

const ROUND_LABELS: Record<string, string> = {
  group: 'Group Stage',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter Finals',
  semi_final: 'Semi Finals',
  third_place: 'Third Place',
  final: 'Final',
}

export function roundLabel(round: string): string {
  return ROUND_LABELS[round] ?? round.replace(/_/g, ' ')
}

export async function hasDrawRun(): Promise<boolean> {
  try {
    const status = await getDrawStatus()
    return status.hasRun || status.assignmentCount > 0
  } catch {
    return false
  }
}

export async function getTeamOwners(): Promise<TeamOwnerView[]> {
  const rows = await db
    .select({
      team: teams,
      ownerName: entries.name,
    })
    .from(teams)
    .leftJoin(assignments, eq(assignments.teamId, teams.id))
    .leftJoin(entries, eq(assignments.entryId, entries.id))
    .orderBy(asc(teams.name))

  return rows.map((row) => ({
    team: row.team,
    ownerName: row.ownerName,
  }))
}

export async function getOwnersByTeamName(): Promise<Map<string, string>> {
  const owners = await getTeamOwners()
  return new Map(
    owners
      .filter((item): item is TeamOwnerView & { ownerName: string } =>
        Boolean(item.ownerName),
      )
      .map((item) => [item.team.name, item.ownerName]),
  )
}

function londonDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  }
}

// The daily match window is 08:00 today -> 08:00 tomorrow in UK time.
// During the tournament the UK is on BST, so 08:00 UK = 07:00 UTC.
export function getTodayWindow(now = new Date()) {
  const { year, month, day } = londonDateParts(now)
  const start = new Date(Date.UTC(year, month - 1, day, 7, 0, 0))
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

export async function getTodaysMatches(now = new Date()): Promise<MatchOwnerView[]> {
  const { start, end } = getTodayWindow(now)
  const ownerMap = await getOwnersByTeamName()
  const rows = await db
    .select()
    .from(fixtures)
    .where(and(gte(fixtures.kickoffUtc, start), lte(fixtures.kickoffUtc, end)))
    .orderBy(asc(fixtures.kickoffUtc))

  return rows.map((fixture) => ({
    fixture,
    teamAOwner: ownerMap.get(fixture.teamA) ?? null,
    teamBOwner: ownerMap.get(fixture.teamB) ?? null,
    ukDayDate: formatUkDayDate(fixture.kickoffUtc),
    ukTime: formatUkTime(fixture.kickoffUtc),
  }))
}

export async function getWallChartData() {
  const ownerViews = await getTeamOwners()
  const fixtureRows = await db
    .select()
    .from(fixtures)
    .orderBy(asc(fixtures.roundOrder), asc(fixtures.kickoffUtc))

  const groupMap = new Map<string, TeamOwnerView[]>()
  for (const item of ownerViews) {
    const group = item.team.group
    groupMap.set(group, [...(groupMap.get(group) ?? []), item])
  }

  const groups: WallChartGroup[] = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, groupTeams]) => ({
      group,
      teams: groupTeams.sort((a, b) => a.team.name.localeCompare(b.team.name)),
      fixtures: fixtureRows.filter((fixture) => fixture.group === `Group ${group}`),
    }))

  const knockoutRounds: WallChartRound[] = Array.from(
    fixtureRows
      .filter((fixture) => fixture.round !== 'group')
      .reduce((map, fixture) => {
        map.set(fixture.round, [...(map.get(fixture.round) ?? []), fixture])
        return map
      }, new Map<string, Fixture[]>())
      .entries(),
  )
    .sort(([, aFixtures], [, bFixtures]) => {
      const a = aFixtures[0]?.roundOrder ?? 0
      const b = bFixtures[0]?.roundOrder ?? 0
      return a - b
    })
    .map(([round, roundFixtures]) => ({
      round,
      fixtures: roundFixtures,
    }))

  return { groups, knockoutRounds }
}
