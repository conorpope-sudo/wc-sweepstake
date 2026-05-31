import { createSign } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entries } from '@/db/schema'

export interface MirrorRow {
  name: string
  email: string
  paid: boolean
  drawnTeam?: string | null
}

export interface PaidSyncResult {
  matched: number
  paid: number
  unpaid: number
}

interface ServiceAccountKey {
  client_email: string
  private_key: string
}

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
}

interface SheetsValueRange {
  values?: string[][]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const CSV_PATH = path.join(DATA_DIR, 'entries-mirror.csv')
const CSV_HEADER = 'Name,Email,Entry paid,Drawn team\n'
const SHEET_HEADER = ['Name', 'Email', 'Entry paid', 'Drawn team', 'Updated at']
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

let tokenCache: { accessToken: string; expiresAt: number } | null = null

function sheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  )
}

function sheetName(): string {
  return process.env.GOOGLE_SHEET_NAME || 'Entries'
}

function range(a1: string): string {
  return `'${sheetName().replace(/'/g, "''")}'!${a1}`
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

function parseServiceAccountKey(): ServiceAccountKey {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set.')

  const parsed = JSON.parse(raw) as Partial<ServiceAccountKey>
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is missing required fields.')
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  }
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (tokenCache && tokenCache.expiresAt - 60 > now) {
    return tokenCache.accessToken
  }

  const key = parseServiceAccountKey()
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64Url(
    JSON.stringify({
      iss: key.client_email,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  )
  const unsigned = `${header}.${claim}`
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(key.private_key)
  const assertion = `${unsigned}.${base64Url(signature)}`

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) {
    throw new Error(`Google auth failed with ${response.status}: ${await response.text()}`)
  }

  const token = (await response.json()) as GoogleTokenResponse
  tokenCache = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in,
  }
  return token.access_token
}

async function sheetsRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
  rangeName: string,
  body?: unknown,
  query = '',
): Promise<T> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not set.')

  const token = await getAccessToken()
  const encodedRange = encodeURIComponent(rangeName)
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}${query}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  )

  if (!response.ok) {
    throw new Error(`Google Sheets failed with ${response.status}: ${await response.text()}`)
  }

  return (await response.json()) as T
}

async function ensureSheetHeader(): Promise<void> {
  const current = await sheetsRequest<SheetsValueRange>('GET', range('A1:E1'))
  const firstRow = current.values?.[0] ?? []
  if (SHEET_HEADER.every((heading, index) => firstRow[index] === heading)) {
    return
  }

  await sheetsRequest(
    'PUT',
    range('A1:E1'),
    { values: [SHEET_HEADER] },
    '?valueInputOption=USER_ENTERED',
  )
}

function rowValues(row: MirrorRow): string[] {
  return [
    row.name,
    row.email,
    row.paid ? 'TRUE' : 'FALSE',
    row.drawnTeam ?? '',
    new Date().toISOString(),
  ]
}

async function appendSheetRow(row: MirrorRow): Promise<void> {
  await ensureSheetHeader()
  await sheetsRequest(
    'POST',
    range('A:E'),
    { values: [rowValues(row)] },
    ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
  )
}

async function updateSheetRowByEmail(row: MirrorRow): Promise<void> {
  await ensureSheetHeader()
  const data = await sheetsRequest<SheetsValueRange>('GET', range('A2:E'))
  const rows = data.values ?? []
  const rowIndex = rows.findIndex(
    (values) => values[1]?.trim().toLowerCase() === row.email.toLowerCase(),
  )

  if (rowIndex === -1) {
    await appendSheetRow(row)
    return
  }

  const sheetRowNumber = rowIndex + 2
  await sheetsRequest(
    'PUT',
    range(`A${sheetRowNumber}:E${sheetRowNumber}`),
    { values: [rowValues(row)] },
    '?valueInputOption=USER_ENTERED',
  )
}

function paidFromCell(value: string | undefined): boolean {
  return ['true', 'yes', 'y', 'paid', '1'].includes(
    (value ?? '').trim().toLowerCase(),
  )
}

// Mirrors an entry to the external record. The DB is the source of truth, so
// this must never throw — a mirror failure should not fail the entry.
export async function mirrorEntry(row: MirrorRow): Promise<void> {
  try {
    if (sheetsConfigured()) {
      await appendSheetRow(row)
    } else {
      console.warn(
        '[sheets] Google Sheets not configured — writing to CSV fallback (data/entries-mirror.csv).',
      )
      await appendCsv(row)
    }
  } catch (err) {
    console.error('[sheets] mirror failed (entry still saved to DB):', err)
    await appendCsv(row).catch((csvErr) =>
      console.error('[sheets] CSV fallback failed:', csvErr),
    )
  }
}

export async function mirrorDrawAssignment(row: MirrorRow): Promise<void> {
  try {
    if (sheetsConfigured()) {
      await updateSheetRowByEmail(row)
    } else {
      console.warn(
        '[sheets] Google Sheets not configured — appending drawn-team mirror row to CSV fallback.',
      )
      await appendCsv(row)
    }
  } catch (err) {
    console.error('[sheets] draw mirror failed (draw still saved to DB):', err)
    await appendCsv(row).catch((csvErr) =>
      console.error('[sheets] CSV fallback failed:', csvErr),
    )
  }
}

export async function syncPaidStatusesFromSheet(): Promise<PaidSyncResult> {
  if (!sheetsConfigured()) {
    throw new Error('Google Sheets is not configured.')
  }

  await ensureSheetHeader()
  const data = await sheetsRequest<SheetsValueRange>('GET', range('A2:E'))
  const rows = data.values ?? []
  let matched = 0
  let paid = 0
  let unpaid = 0

  for (const row of rows) {
    const email = row[1]?.trim().toLowerCase()
    if (!email) continue

    const isPaid = paidFromCell(row[2])
    const updated = await db
      .update(entries)
      .set({ paid: isPaid })
      .where(eq(entries.email, email))
      .returning({ id: entries.id })

    if (updated.length > 0) {
      matched += updated.length
      if (isPaid) paid += updated.length
      else unpaid += updated.length
    }
  }

  return { matched, paid, unpaid }
}
