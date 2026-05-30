'use client'

import { useActionState } from 'react'
import { submitEntry, type SubmitState } from '@/app/actions'
import EntryForm from './EntryForm'
import AlmostEntered from './AlmostEntered'
import EntriesClosed from './EntriesClosed'

const initialState: SubmitState = { status: 'idle' }

export default function EntryFlow({
  initiallyClosed,
}: {
  initiallyClosed: boolean
}) {
  const [state, formAction, pending] = useActionState(
    submitEntry,
    initialState,
  )

  if (initiallyClosed || state.status === 'closed') {
    return <EntriesClosed />
  }

  if (state.status === 'success') {
    return <AlmostEntered name={state.name} />
  }

  return <EntryForm action={formAction} pending={pending} state={state} />
}
