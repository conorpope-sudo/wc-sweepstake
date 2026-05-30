// All user-facing times are shown in UK time (Europe/London), which handles
// BST automatically. Feed kick-offs are stored as true UTC; these helpers
// format them for display in emails and pages.

const TZ = 'Europe/London'

// "6pm", "1am", "10:30pm" — minutes omitted when on the hour.
export function formatUkTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date)

  const hour = parts.find((p) => p.type === 'hour')?.value ?? ''
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const period = (parts.find((p) => p.type === 'dayPeriod')?.value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

  return minute === '00' ? `${hour}${period}` : `${hour}:${minute}${period}`
}

// "26 June"
export function formatUkDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
  }).format(date)
}

// "Monday, 22 June"
export function formatUkDayDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'long',
  }).format(date)
  return `${weekday}, ${formatUkDate(date)}`
}

// "Monday, 22 June, 6pm"
export function formatUkDayDateTime(date: Date): string {
  return `${formatUkDayDate(date)}, ${formatUkTime(date)}`
}
