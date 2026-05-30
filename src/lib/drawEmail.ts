import { getTeamGroupFixtures, type TeamFixtureView } from './teamFixtures'
import { getTeamMeta } from './teamsData'
import type { AssignmentView } from './draw'

const SUBJECT = '411 World Cup sweepstake - your team inside!'

interface ResendResult {
  id?: string
}

export interface DrawEmailPreview {
  subject: string
  text: string
  html: string
}

function fixtureLine(fixture: TeamFixtureView): string {
  return `${fixture.opponent}, ${fixture.ukTime}, ${fixture.ukDate}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function buildDrawEmail(
  assignment: AssignmentView,
): Promise<DrawEmailPreview> {
  const fixtures = await getTeamGroupFixtures(assignment.team.name)
  const teamMeta = getTeamMeta(assignment.team.name)
  const fixtureLines = fixtures.length
    ? fixtures.map(fixtureLine)
    : ['Fixtures are not cached yet. Run the fixture refresh before sending.']
  const politicsLines = teamMeta
    ? [
        `Politics: ${teamMeta.politicalLeaning}`,
        `Democracy status: ${teamMeta.democracyStatus}`,
      ]
    : []
  const politicsText = politicsLines.length ? `${politicsLines.join('\n')}\n` : ''

  const text = `${assignment.entry.name}

Your team in the 411 World Cup sweepstake is ${assignment.team.name.toUpperCase()}

Here's some information about your team!

Star player: ${assignment.team.starPlayer}
Manager: ${assignment.team.manager}
${politicsText}Fixtures:
${fixtureLines.map((line) => `- ${line}`).join('\n')}

Did you know? ${assignment.team.funFact}

All the best for the tournament!`

  const htmlFixtures = fixtureLines
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1C1C1C">
      <p>${escapeHtml(assignment.entry.name)}</p>
      <p>Your team in the 411 World Cup sweepstake is <strong>${escapeHtml(
        assignment.team.name.toUpperCase(),
      )}</strong></p>
      <p>Here's some information about your team!</p>
      <p>
        <strong>Star player:</strong> ${escapeHtml(assignment.team.starPlayer)}<br>
        <strong>Manager:</strong> ${escapeHtml(assignment.team.manager)}
        ${
          teamMeta
            ? `<br><strong>Politics:</strong> ${escapeHtml(teamMeta.politicalLeaning)}<br>
        <strong>Democracy status:</strong> ${escapeHtml(teamMeta.democracyStatus)}`
            : ''
        }
      </p>
      <p><strong>Fixtures:</strong></p>
      <ul>${htmlFixtures}</ul>
      <p><strong>Did you know?</strong> ${escapeHtml(assignment.team.funFact)}</p>
      <p>All the best for the tournament!</p>
    </div>
  `

  return { subject: SUBJECT, text, html }
}

export async function sendDrawEmail(
  to: string,
  assignment: AssignmentView,
): Promise<ResendResult> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY and EMAIL_FROM must be set before sending.')
  }

  const preview = await buildDrawEmail(assignment)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
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
