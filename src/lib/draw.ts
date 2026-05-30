import { asc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  DRAW_STATE_ID,
  assignments,
  drawState,
  entries,
  teams,
  type Entry,
  type Team,
} from '@/db/schema'
import { mirrorDrawAssignment } from './sheets'

const DRAW_LOCK_KEY = 4112026

export class DrawAlreadyRunError extends Error {
  constructor() {
    super('The draw has already run')
    this.name = 'DrawAlreadyRunError'
  }
}

export class DrawPrerequisiteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DrawPrerequisiteError'
  }
}

export interface AssignmentView {
  assignmentId: number
  entry: Entry
  team: Team
  emailedAt: Date | null
  createdAt: Date
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export async function getDrawStatus() {
  const [state] = await db
    .select()
    .from(drawState)
    .where(eq(drawState.id, DRAW_STATE_ID))

  const [assignmentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assignments)

  return {
    hasRun: Boolean(state?.hasRun),
    runAt: state?.runAt ?? null,
    assignmentCount: assignmentCount?.count ?? 0,
  }
}

export async function getAssignments(): Promise<AssignmentView[]> {
  const rows = await db
    .select({
      assignment: assignments,
      entry: entries,
      team: teams,
    })
    .from(assignments)
    .innerJoin(entries, eq(assignments.entryId, entries.id))
    .innerJoin(teams, eq(assignments.teamId, teams.id))
    .orderBy(asc(teams.name))

  return rows.map((row) => ({
    assignmentId: row.assignment.id,
    entry: row.entry,
    team: row.team,
    emailedAt: row.assignment.emailedAt,
    createdAt: row.assignment.createdAt,
  }))
}

export async function getPendingEmailAssignments(): Promise<AssignmentView[]> {
  return (await getAssignments()).filter((item) => !item.emailedAt)
}

export async function runDraw(): Promise<AssignmentView[]> {
  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${DRAW_LOCK_KEY})`)

    const [state] = await tx
      .select()
      .from(drawState)
      .where(eq(drawState.id, DRAW_STATE_ID))

    if (state?.hasRun) {
      throw new DrawAlreadyRunError()
    }

    const [existingAssignments] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(assignments)

    if ((existingAssignments?.count ?? 0) > 0) {
      throw new DrawAlreadyRunError()
    }

    const entryRows = await tx.select().from(entries).orderBy(asc(entries.createdAt))
    const teamRows = await tx.select().from(teams).orderBy(asc(teams.name))

    if (entryRows.length === 0) {
      throw new DrawPrerequisiteError('There are no entries to draw yet.')
    }

    if (teamRows.length === 0) {
      throw new DrawPrerequisiteError(
        'No teams are seeded yet. Run the team seed before the draw.',
      )
    }

    const shuffledTeams = shuffle(teamRows)
    const pairs = entryRows.slice(0, shuffledTeams.length).map((entry, index) => ({
      entryId: entry.id,
      teamId: shuffledTeams[index].id,
    }))

    const inserted = await tx.insert(assignments).values(pairs).returning()

    await tx
      .insert(drawState)
      .values({ id: DRAW_STATE_ID, hasRun: true, runAt: new Date() })
      .onConflictDoUpdate({
        target: drawState.id,
        set: { hasRun: true, runAt: new Date() },
      })

    return inserted
  })

  const assignmentIds = new Set(created.map((assignment) => assignment.id))
  const views = (await getAssignments()).filter((view) =>
    assignmentIds.has(view.assignmentId),
  )

  await Promise.all(
    views.map((view) =>
      mirrorDrawAssignment({
        name: view.entry.name,
        email: view.entry.email,
        paid: view.entry.paid,
        drawnTeam: view.team.name,
      }),
    ),
  )

  return views
}

export async function markAssignmentEmailed(assignmentId: number): Promise<void> {
  await db
    .update(assignments)
    .set({ emailedAt: new Date() })
    .where(eq(assignments.id, assignmentId))
}
