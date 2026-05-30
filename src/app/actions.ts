'use server'

import { revalidatePath } from 'next/cache'
import { entrySchema } from '@/lib/validation'
import {
  createEntry,
  CapReachedError,
  DuplicateEmailError,
} from '@/lib/entries'
import { mirrorEntry } from '@/lib/sheets'

export type SubmitState =
  | { status: 'idle' }
  | { status: 'success'; name: string }
  | { status: 'closed' }
  | {
      status: 'error'
      message: string
      fieldErrors?: { name?: string; email?: string }
    }

export async function submitEntry(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const parsed = entrySchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
      },
    }
  }

  if (!process.env.DATABASE_URL) {
    return {
      status: 'error',
      message:
        'The database isn’t configured yet. Set DATABASE_URL in .env.local.',
    }
  }

  try {
    const entry = await createEntry(parsed.data.name, parsed.data.email)
    await mirrorEntry({
      name: entry.name,
      email: entry.email,
      paid: entry.paid,
    })
    revalidatePath('/')
    return { status: 'success', name: entry.name }
  } catch (err) {
    if (err instanceof CapReachedError) {
      revalidatePath('/')
      return { status: 'closed' }
    }
    if (err instanceof DuplicateEmailError) {
      return {
        status: 'error',
        message: 'This email has already entered.',
        fieldErrors: { email: 'This email has already entered.' },
      }
    }
    console.error('submitEntry failed:', err)
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    }
  }
}
