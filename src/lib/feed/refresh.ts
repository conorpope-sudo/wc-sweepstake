import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { fixtures } from '@/db/schema'
import { openFootballSource } from './openfootball'
import { footballDataSource } from './footballData'
import { type FeedSource, type ParsedFixture } from './types'

export interface RefreshResult {
  source: string
  fetched: number
  upserted: number
  completed: number
  ranAt: Date
}

// Primary source first; fallback only if the primary throws AND a key is set.
function sources(): FeedSource[] {
  const list: FeedSource[] = [openFootballSource]
  if (process.env.FOOTBALL_DATA_API_KEY) list.push(footballDataSource)
  return list
}

async function fetchWithFallback(): Promise<{
  source: string
  rows: ParsedFixture[]
}> {
  let lastErr: unknown
  for (const src of sources()) {
    try {
      const rows = await src.fetchFixtures()
      return { source: src.name, rows }
    } catch (err) {
      lastErr = err
      console.warn(`[feed] source "${src.name}" failed:`, err)
    }
  }
  throw new Error(
    `All feed sources failed. Last error: ${String(lastErr)}`,
  )
}

// Fetches the feed and upserts every match into the fixtures cache.
// Idempotent: re-running updates existing rows (scores/status/kickoff) by feedKey.
export async function refreshFixtures(): Promise<RefreshResult> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — cannot refresh fixtures.')
  }

  const { source, rows } = await fetchWithFallback()

  await db
    .insert(fixtures)
    .values(
      rows.map((r) => ({
        feedKey: r.feedKey,
        round: r.round,
        roundOrder: r.roundOrder,
        matchday: r.matchday,
        group: r.group,
        teamA: r.teamA,
        teamB: r.teamB,
        teamAIsTeam: r.teamAIsTeam,
        teamBIsTeam: r.teamBIsTeam,
        kickoffUtc: r.kickoffUtc,
        ground: r.ground,
        status: r.status,
        scoreA: r.scoreA,
        scoreB: r.scoreB,
      })),
    )
    .onConflictDoUpdate({
      target: fixtures.feedKey,
      set: {
        round: sql`excluded.round`,
        roundOrder: sql`excluded.round_order`,
        matchday: sql`excluded.matchday`,
        group: sql`excluded.group`,
        teamA: sql`excluded.team_a`,
        teamB: sql`excluded.team_b`,
        teamAIsTeam: sql`excluded.team_a_is_team`,
        teamBIsTeam: sql`excluded.team_b_is_team`,
        kickoffUtc: sql`excluded.kickoff_utc`,
        ground: sql`excluded.ground`,
        status: sql`excluded.status`,
        scoreA: sql`excluded.score_a`,
        scoreB: sql`excluded.score_b`,
        updatedAt: sql`now()`,
      },
    })

  return {
    source,
    fetched: rows.length,
    upserted: rows.length,
    completed: rows.filter((r) => r.status === 'completed').length,
    ranAt: new Date(),
  }
}
