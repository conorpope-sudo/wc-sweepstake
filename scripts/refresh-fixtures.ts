// Fetch the football feed and upsert all fixtures into the DB cache.
// Run with: npm run db:refresh-fixtures
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const { refreshFixtures } = await import('../src/lib/feed/refresh')
  const r = await refreshFixtures()
  console.log(
    `✓ Refreshed from "${r.source}": ${r.upserted} fixtures upserted ` +
      `(${r.completed} completed) at ${r.ranAt.toISOString()}.`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Refresh failed:', err)
    process.exit(1)
  })
