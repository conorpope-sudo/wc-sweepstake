import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

// The WebSocket-based pool supports transactions and advisory locks,
// which we need for race-safe entry-cap enforcement. Modern Node runtimes
// include a native WebSocket implementation, avoiding a bundled `ws` optional
// native helper that can misbehave in Next's local server.
neonConfig.webSocketConstructor = WebSocket

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
