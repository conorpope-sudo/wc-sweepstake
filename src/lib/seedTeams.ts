import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { teams } from '@/db/schema'
import { TEAMS } from './teamsData'

export interface SeedResult {
  count: number
}

// Loads the 48 teams from world-cup-2026-teams.json into the teams table.
// Idempotent: re-running refreshes editorial fields (group/manager/star/funFact)
// but DELIBERATELY does not touch eliminated / eliminatedRound, so any admin
// override or feed-driven elimination survives a re-seed.
export async function seedTeams(): Promise<SeedResult> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — cannot seed teams.')
  }

  await db
    .insert(teams)
    .values(
      TEAMS.map((t) => ({
        name: t.name,
        group: t.group,
        manager: t.manager,
        starPlayer: t.starPlayer,
        funFact: t.funFact,
      })),
    )
    .onConflictDoUpdate({
      target: teams.name,
      set: {
        group: sql`excluded.group`,
        manager: sql`excluded.manager`,
        starPlayer: sql`excluded.star_player`,
        funFact: sql`excluded.fun_fact`,
        // eliminated / eliminatedRound intentionally preserved.
      },
    })

  return { count: TEAMS.length }
}
