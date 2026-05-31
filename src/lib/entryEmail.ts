const SUBJECT = "You're in!"
const PAYMENT_URL =
  'http://monzo.me/conorpope/2.00?h=DUL0kW&account_type=personal'

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

export function buildEntryConfirmationEmail(name: string) {
  const text = `${name}

Thanks for entering 411's World Cup Sweepstake! Please remember to pay your £2 entry fee before the draw if you haven't already.

Payment link: ${PAYMENT_URL}

The draw will take place at 12 midday on 11 June, before the first game of the World Cup that evening.`

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1C1C1C">
      <p>${escapeHtml(name)}</p>
      <p>
        Thanks for entering 411's World Cup Sweepstake! Please remember to pay
        your £2 entry fee before the draw if you haven't already.
        <a href="${PAYMENT_URL}">Pay your £2 entry fee here</a>.
      </p>
      <p>
        The draw will take place at 12 midday on 11 June, before the first game
        of the World Cup that evening.
      </p>
    </div>
  `

  return { subject: SUBJECT, text, html }
}

export async function sendEntryConfirmationEmail(
  to: string,
  name: string,
): Promise<ResendResult> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY and EMAIL_FROM must be set before sending.')
  }

  const preview = buildEntryConfirmationEmail(name)
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
