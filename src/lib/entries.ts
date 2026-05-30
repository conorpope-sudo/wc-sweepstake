import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { entries, type Entry } from '@/db/schema'

export const ENTRY_CAP = 48

// Arbitrary fixed key for the transaction-scoped advisory lock that
// serialises entry inserts (so the cap check can't be raced).
const ENTRY_LOCK_KEY = 411411

export class CapReachedError extends Error {
  constructor() {
    super('Entry cap reached')
    this.name = 'CapReachedError'
  }
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('Email already entered')
    this.name = 'DuplicateEmailError'
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '23505'
  )
}

export async function getEntryCount(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)
  return row?.count ?? 0
}

// Creates an entry atomically:
//  - takes a transaction advisory lock so concurrent submits are serialised
//  - rejects once 48 entries exist (CapReachedError) — even under a race
//  - rejects a duplicate email (DuplicateEmailError) via the unique index
export async function createEntry(name: string, email: string): Promise<Entry> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${ENTRY_LOCK_KEY})`)

    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(entries)

    if (count >= ENTRY_CAP) {
      throw new CapReachedError()
    }

    try {
      const [entry] = await tx
        .insert(entries)
        .values({ name, email })
        .returning()
      return entry
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateEmailError()
      throw err
    }
  })
}
