import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// drizzle-kit runs outside Next.js, so load env from .env.local explicitly.
dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
