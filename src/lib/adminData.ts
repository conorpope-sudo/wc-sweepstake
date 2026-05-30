import { asc, sql } from 'drizzle-orm'
import { db } from '@/db'
import { entries, teams } from '@/db/schema'
import { getAssignments, getDrawStatus } from './draw'

export async function getAdminDashboardData() {
  const [entryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teams)

  const entryRows = await db.select().from(entries).orderBy(asc(entries.createdAt))
  const draw = await getDrawStatus()
  const assignmentRows = await getAssignments()

  return {
    entryCount: entryCount?.count ?? 0,
    teamCount: teamCount?.count ?? 0,
    entries: entryRows,
    draw,
    assignments: assignmentRows,
  }
}
