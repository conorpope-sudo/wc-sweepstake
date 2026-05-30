#!/usr/bin/env tsx

import { eq, sql } from 'drizzle-orm'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  if (process.env.CONFIRM_RESET_TEST_DRAW !== 'YES') {
    throw new Error(
      'Refusing to reset the draw without CONFIRM_RESET_TEST_DRAW=YES. Only run this on a test database branch.',
    )
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.')
  }

  const { db } = await import('../src/db')
  const { DRAW_STATE_ID, assignments, drawState, entries } = await import(
    '../src/db/schema'
  )

  const [entryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)

  const [assignmentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assignments)

  await db.delete(assignments)
  await db.delete(drawState).where(eq(drawState.id, DRAW_STATE_ID))

  console.log(
    `✓ Reset test draw. Removed ${
      assignmentCount?.count ?? 0
    } assignment(s). Entries remain: ${entryCount?.count ?? 0}.`,
  )
}

main().catch((err) => {
  console.error('✗ Test draw reset failed:', err)
  process.exit(1)
})
