import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import {
  assignments,
  entries,
  fixtures,
  matchdayEmailNotifications,
  teams,
} from '@/db/schema'
import { formatUkDayDate, formatUkTime } from './datetime'
import { refreshFixtures } from './feed/refresh'
import { getTodayWindow } from './tracker'

const SUBJECT = "Matchday: You're playing today!"
const TODAYS_MATCHES_URL = 'https://www.411sweepstake.com/todays-matches'

interface AssignmentOwner {
  assignmentId: number
  entryName: string
  entryEmail: string
  teamName: string
}

interface MatchdayMessage {
  assignmentId: number
  fixtureId: number
  to: string
  name: string
  teamName: string
  opponentName: string
  opponentOwnerName: string | null
  ukDate: string
  ukTime: string
  ground: string | null
}

export interface MatchdayEmailRunResult {
  considered: number
  sent: number
  skippedDuplicate: number
}

interface ResendResult {
  id?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function opponentOwnerLine(message: MatchdayMessage): string {
  return message.opponentOwnerName
    ? `${message.opponentName} are held by ${message.opponentOwnerName}.`
    : 'The other team has not been assigned to anyone yet.'
}

function buildMatchdayEmail(message: MatchdayMessage) {
  const groundLine = message.ground ? `\nVenue: ${message.ground}` : ''
  const text = `${message.name}

Your team are playing today.

${message.teamName} play ${message.opponentName} at ${message.ukTime} on ${message.ukDate}.${groundLine}

You have ${message.teamName}.
${opponentOwnerLine(message)}

See today's other World Cup matches, and who from 411 is up against who:
${TODAYS_MATCHES_URL}`

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1C1C1C">
      <p>${escapeHtml(message.name)}</p>
      <p>Your team are playing today.</p>
      <p>
        <strong>${escapeHtml(message.teamName)}</strong> play
        <strong>${escapeHtml(message.opponentName)}</strong> at
        <strong>${escapeHtml(message.ukTime)}</strong> on
        ${escapeHtml(message.ukDate)}.
        ${
          message.ground
            ? `<br><strong>Venue:</strong> ${escapeHtml(message.ground)}`
            : ''
        }
      </p>
      <p>
        You have ${escapeHtml(message.teamName)}.<br>
        ${escapeHtml(opponentOwnerLine(message))}
      </p>
      <p>
        <a href="${TODAYS_MATCHES_URL}">
          See today's other World Cup matches, and who from 411 is up against who
        </a>
      </p>
    </div>
  `

  return { subject: SUBJECT, text, html }
}

async function sendMatchdayEmail(message: MatchdayMessage): Promise<ResendResult> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY and EMAIL_FROM must be set before sending.')
  }

  const preview = buildMatchdayEmail(message)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: message.to,
      subject: preview.subject,
      text: preview.text,
      html: preview.html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend failed with ${response.status}: ${body}`)
  }

  return response.json()
}

async function getAssignmentOwners(): Promise<AssignmentOwner[]> {
  const rows = await db
    .select({
      assignmentId: assignments.id,
      entryName: entries.name,
      entryEmail: entries.email,
      teamName: teams.name,
    })
    .from(assignments)
    .innerJoin(entries, eq(assignments.entryId, entries.id))
    .innerJoin(teams, eq(assignments.teamId, teams.id))
    .orderBy(asc(teams.name))

  return rows
}

async function notificationAlreadySent(
  assignmentId: number,
  fixtureId: number,
): Promise<boolean> {
  const [existing] = await db
    .select({ id: matchdayEmailNotifications.id })
    .from(matchdayEmailNotifications)
    .where(
      and(
        eq(matchdayEmailNotifications.assignmentId, assignmentId),
        eq(matchdayEmailNotifications.fixtureId, fixtureId),
      ),
    )
    .limit(1)

  return Boolean(existing)
}

async function markNotificationSent(
  assignmentId: number,
  fixtureId: number,
): Promise<void> {
  await db
    .insert(matchdayEmailNotifications)
    .values({ assignmentId, fixtureId })
    .onConflictDoNothing()
}

export async function sendTodaysMatchdayEmails(
  now = new Date(),
): Promise<MatchdayEmailRunResult> {
  await refreshFixtures()

  const { start, end } = getTodayWindow(now)
  const fixtureRows = await db
    .select()
    .from(fixtures)
    .where(and(gte(fixtures.kickoffUtc, start), lte(fixtures.kickoffUtc, end)))
    .orderBy(asc(fixtures.kickoffUtc))

  const owners = await getAssignmentOwners()
  const ownerByTeam = new Map(owners.map((owner) => [owner.teamName, owner]))
  const messages: MatchdayMessage[] = []

  for (const fixture of fixtureRows) {
    const sides = [
      {
        teamName: fixture.teamA,
        isKnownTeam: fixture.teamAIsTeam,
        opponentName: fixture.teamB,
        opponentIsKnownTeam: fixture.teamBIsTeam,
      },
      {
        teamName: fixture.teamB,
        isKnownTeam: fixture.teamBIsTeam,
        opponentName: fixture.teamA,
        opponentIsKnownTeam: fixture.teamAIsTeam,
      },
    ]

    for (const side of sides) {
      if (!side.isKnownTeam) continue

      const owner = ownerByTeam.get(side.teamName)
      if (!owner) continue

      const opponentOwner = side.opponentIsKnownTeam
        ? ownerByTeam.get(side.opponentName)
        : null

      messages.push({
        assignmentId: owner.assignmentId,
        fixtureId: fixture.id,
        to: owner.entryEmail,
        name: owner.entryName,
        teamName: owner.teamName,
        opponentName: side.opponentName,
        opponentOwnerName: opponentOwner?.entryName ?? null,
        ukDate: formatUkDayDate(fixture.kickoffUtc),
        ukTime: formatUkTime(fixture.kickoffUtc),
        ground: fixture.ground,
      })
    }
  }

  let sent = 0
  let skippedDuplicate = 0

  for (const message of messages) {
    if (await notificationAlreadySent(message.assignmentId, message.fixtureId)) {
      skippedDuplicate += 1
      continue
    }

    await sendMatchdayEmail(message)
    await markNotificationSent(message.assignmentId, message.fixtureId)
    sent += 1
  }

  return {
    considered: messages.length,
    sent,
    skippedDuplicate,
  }
}
