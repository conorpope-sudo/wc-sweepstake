import { promises as fs } from 'fs'
import path from 'path'
import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { gameLeaderboard } from '@/db/schema'

export type GameCategory = 'Politician' | 'World Cup Winner'

export interface GameQuestion {
  name: string
  category: GameCategory
  country: string
  detail: string
}

export interface LeaderboardEntry {
  id: number
  name: string
  score: number
  total: number
  createdAt: Date
}

const CSV_PATH = path.join(
  process.cwd(),
  'politicians_and_world_cup_winners - Politicians & World Cup Winners.csv',
)

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values.map((value) => value.trim())
}

export async function getGameQuestions(): Promise<GameQuestion[]> {
  const file = await fs.readFile(CSV_PATH, 'utf8')
  const rows = file.trim().split(/\r?\n/).slice(1)

  return rows
    .map((row) => {
      const [name, category, country, detail] = parseCsvLine(row)
      if (category !== 'Politician' && category !== 'World Cup Winner') {
        return null
      }

      return {
        name,
        category,
        country,
        detail,
      }
    })
    .filter((row): row is GameQuestion => Boolean(row))
}

export async function getGameLeaderboard(): Promise<LeaderboardEntry[]> {
  return db
    .select()
    .from(gameLeaderboard)
    .orderBy(desc(gameLeaderboard.score), desc(gameLeaderboard.createdAt))
    .limit(10)
}

export async function saveGameLeaderboardEntry(
  name: string,
  score: number,
  total: number,
): Promise<void> {
  await db.insert(gameLeaderboard).values({
    name: name.trim().slice(0, 60),
    score,
    total,
  })
}
