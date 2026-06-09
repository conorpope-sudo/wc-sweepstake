'use server'

import { revalidatePath } from 'next/cache'
import { saveGameLeaderboardEntry } from '@/lib/politicianGame'

export type LeaderboardSubmitState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export async function submitGameScore(
  _prev: LeaderboardSubmitState,
  formData: FormData,
): Promise<LeaderboardSubmitState> {
  const name = String(formData.get('name') ?? '').trim()
  const score = Number(formData.get('score'))
  const total = Number(formData.get('total'))

  if (!name) {
    return { status: 'error', message: 'Add your name for the leaderboard.' }
  }

  if (!Number.isInteger(score) || !Number.isInteger(total) || total !== 15) {
    return { status: 'error', message: 'That score could not be saved.' }
  }

  if (score < 0 || score > total) {
    return { status: 'error', message: 'That score could not be saved.' }
  }

  try {
    await saveGameLeaderboardEntry(name, score, total)
    revalidatePath('/game')
    return { status: 'success', message: 'Added to the leaderboard.' }
  } catch (err) {
    console.error('submitGameScore failed:', err)
    return { status: 'error', message: 'The leaderboard could not be updated.' }
  }
}
