#!/usr/bin/env tsx

import { eq } from 'drizzle-orm'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const { db } = await import('../src/db')
  const { entries } = await import('../src/db/schema')
  const { createEntry, getEntryCount, ENTRY_CAP } = await import('../src/lib/entries')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.')
  }

  const existingCount = await getEntryCount()
  const slotsToFill = ENTRY_CAP - existingCount

  if (slotsToFill <= 0) {
    console.log(`✓ Entry table is already full (${existingCount}/${ENTRY_CAP}).`)
    return
  }

  let created = 0
  for (let i = 1; created < slotsToFill && i <= ENTRY_CAP; i += 1) {
    const padded = String(i).padStart(2, '0')
    const name = `Test Entrant ${padded}`
    const email = `test.entrant.${padded}@example.com`

    try {
      const entry = await createEntry(name, email)
      await db.update(entries).set({ paid: true }).where(eq(entries.id, entry.id))
      created += 1
    } catch (err) {
      if (err instanceof Error && err.name === 'DuplicateEmailError') {
        continue
      }
      throw err
    }
  }

  const finalCount = await getEntryCount()
  console.log(
    `✓ Seeded ${created} test entries. Entry table now has ${finalCount}/${ENTRY_CAP}.`,
  )
}

main().catch((err) => {
  console.error('✗ Test entry seed failed:', err)
  process.exit(1)
})
