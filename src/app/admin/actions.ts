'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  clearAdminAuthenticated,
  isAdminAuthenticated,
  setAdminAuthenticated,
  validAdminPassword,
} from '@/lib/adminAuth'
import {
  DrawAlreadyRunError,
  DrawPrerequisiteError,
  getAssignments,
  getPendingEmailAssignments,
  markAssignmentEmailed,
  runDraw,
} from '@/lib/draw'
import { buildDrawEmail, sendDrawEmail } from '@/lib/drawEmail'
import { refreshFixtures } from '@/lib/feed/refresh'
import { exportEntriesToSheet, syncPaidStatusesFromSheet } from '@/lib/sheets'
import { entrySchema } from '@/lib/validation'

export type AdminActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string; preview?: string }
  | { status: 'error'; message: string; preview?: string }

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin')
  }
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (validAdminPassword(password)) {
    await setAdminAuthenticated()
  }
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminAuthenticated()
  redirect('/admin')
}

export async function triggerDraw(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin()

  if (String(formData.get('confirmation') ?? '').trim() !== 'RUN DRAW') {
    return {
      status: 'error',
      message: 'Type RUN DRAW to unlock the draw button.',
    }
  }

  try {
    const created = await runDraw()
    revalidatePath('/admin')
    revalidatePath('/')
    return {
      status: 'success',
      message: `Draw complete: ${created.length} assignment${
        created.length === 1 ? '' : 's'
      } created. No emails were sent.`,
    }
  } catch (err) {
    if (err instanceof DrawAlreadyRunError || err instanceof DrawPrerequisiteError) {
      return { status: 'error', message: err.message }
    }
    console.error('triggerDraw failed:', err)
    return { status: 'error', message: 'The draw failed. Check the server logs.' }
  }
}

export async function sendTestEmail(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin()

  const parsed = entrySchema.shape.email.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid test email address.' }
  }

  const assignments = await getAssignments()
  const assignment = assignments[0]
  if (!assignment) {
    return {
      status: 'error',
      message: 'Run the draw before sending a result email test.',
    }
  }

  try {
    const preview = await buildDrawEmail(assignment)
    const result = await sendDrawEmail(parsed.data, assignment)
    return {
      status: 'success',
      message: `Test email sent to ${parsed.data}${
        result.id ? ` (Resend id: ${result.id})` : ''
      }.`,
      preview: preview.text,
    }
  } catch (err) {
    console.error('sendTestEmail failed:', err)
    const preview = await buildDrawEmail(assignment)
    return {
      status: 'error',
      message:
        err instanceof Error
          ? err.message
          : 'The test email failed. Check the server logs.',
      preview: preview.text,
    }
  }
}

export async function sendPendingEmails(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin()

  if (String(formData.get('confirmation') ?? '').trim() !== 'SEND RESULTS') {
    return {
      status: 'error',
      message: 'Type SEND RESULTS to send pending emails.',
    }
  }

  const pending = await getPendingEmailAssignments()
  if (pending.length === 0) {
    return { status: 'success', message: 'No pending result emails to send.' }
  }

  let sent = 0
  for (const assignment of pending) {
    await sendDrawEmail(assignment.entry.email, assignment)
    await markAssignmentEmailed(assignment.assignmentId)
    sent += 1
  }

  revalidatePath('/admin')
  return {
    status: 'success',
    message: `Sent ${sent} result email${sent === 1 ? '' : 's'}.`,
  }
}

export async function refreshFixturesNow(
  _prev: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  void _prev
  void _formData

  await requireAdmin()

  try {
    const result = await refreshFixtures()
    revalidatePath('/admin')
    revalidatePath('/')
    revalidatePath('/todays-matches')
    revalidatePath('/wall-chart')
    return {
      status: 'success',
      message: `Refreshed ${result.upserted} fixtures from ${result.source}. ${result.completed} completed.`,
    }
  } catch (err) {
    console.error('refreshFixturesNow failed:', err)
    return {
      status: 'error',
      message:
        err instanceof Error
          ? err.message
          : 'The fixture refresh failed. Check the server logs.',
    }
  }
}

export async function syncPaidFromSheet(
  _prev: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  void _prev
  void _formData

  await requireAdmin()

  try {
    const result = await syncPaidStatusesFromSheet()
    revalidatePath('/admin')
    return {
      status: 'success',
      message: `Synced ${result.matched} payment status${
        result.matched === 1 ? '' : 'es'
      } from Google Sheets. Paid: ${result.paid}. Unpaid: ${result.unpaid}.`,
    }
  } catch (err) {
    console.error('syncPaidFromSheet failed:', err)
    return {
      status: 'error',
      message:
        err instanceof Error
          ? err.message
          : 'The Google Sheets payment sync failed.',
    }
  }
}

export async function populateSheetFromEntries(
  _prev: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  void _prev
  void _formData

  await requireAdmin()

  try {
    const result = await exportEntriesToSheet()
    return {
      status: 'success',
      message: `Populated Google Sheets with ${result.exported} entr${
        result.exported === 1 ? 'y' : 'ies'
      } from Neon.`,
    }
  } catch (err) {
    console.error('populateSheetFromEntries failed:', err)
    return {
      status: 'error',
      message:
        err instanceof Error
          ? err.message
          : 'The Google Sheets population failed.',
    }
  }
}
