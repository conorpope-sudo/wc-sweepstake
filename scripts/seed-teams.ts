// Seed the 48 teams from world-cup-2026-teams.json into the DB.
// Run with: npm run db:seed-teams
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  // Dynamic import AFTER env is loaded, so the DB client sees DATABASE_URL.
  const { seedTeams } = await import('../src/lib/seedTeams')
  const result = await seedTeams()
  console.log(`✓ Seeded ${result.count} teams.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Seed failed:', err)
    process.exit(1)
  })
