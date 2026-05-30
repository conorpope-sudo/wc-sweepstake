import { promises as fs } from 'fs'
import path from 'path'

export interface MirrorRow {
  name: string
  email: string
  paid: boolean
  drawnTeam?: string | null
}

const DATA_DIR = path.join(process.cwd(), 'data')
const CSV_PATH = path.join(DATA_DIR, 'entries-mirror.csv')
const CSV_HEADER = 'Name,Email,Entry paid,Drawn team\n'

function sheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  )
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

async function appendCsv(row: MirrorRow): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(CSV_PATH)
  } catch {
    await fs.writeFile(CSV_PATH, CSV_HEADER, 'utf8')
  }
  const line =
    [
      csvEscape(row.name),
      csvEscape(row.email),
      row.paid ? 'TRUE' : 'FALSE',
      csvEscape(row.drawnTeam ?? ''),
    ].join(',') + '\n'
  await fs.appendFile(CSV_PATH, line, 'utf8')
}

// Mirrors an entry to the external record. The DB is the source of truth, so
// this must never throw — a mirror failure should not fail the entry.
//
// Phase 2: writes to a local CSV fallback (data/entries-mirror.csv).
// Phase 2b: when GOOGLE_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_KEY are set, swap the
// marked block below to append to the live Google Sheet via the service account.
export async function mirrorEntry(row: MirrorRow): Promise<void> {
  try {
    if (sheetsConfigured()) {
      // TODO Phase 2b: append to the live Google Sheet here.
      console.info(
        '[sheets] Sheets credentials present but live sync not yet wired up — using CSV mirror.',
      )
    } else {
      console.warn(
        '[sheets] Google Sheets not configured — writing to CSV fallback (data/entries-mirror.csv). Sheets sync pending.',
      )
    }
    await appendCsv(row)
  } catch (err) {
    console.error('[sheets] mirror failed (entry still saved to DB):', err)
  }
}

export async function mirrorDrawAssignment(row: MirrorRow): Promise<void> {
  try {
    if (sheetsConfigured()) {
      console.info(
        '[sheets] Sheets credentials present but live drawn-team sync not yet wired up — using CSV mirror.',
      )
    } else {
      console.warn(
        '[sheets] Google Sheets not configured — appending drawn-team mirror row to CSV fallback.',
      )
    }
    await appendCsv(row)
  } catch (err) {
    console.error('[sheets] draw mirror failed (draw still saved to DB):', err)
  }
}
