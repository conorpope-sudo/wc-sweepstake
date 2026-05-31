'use client'

import { useActionState } from 'react'
import {
  refreshFixturesNow,
  sendPendingEmails,
  sendTestEmail,
  syncPaidFromSheet,
  triggerDraw,
  type AdminActionState,
} from './actions'

const initialState: AdminActionState = { status: 'idle' }

function StatusMessage({ state }: { state: AdminActionState }) {
  if (state.status === 'idle') return null
  return (
    <div
      className={`mt-4 border-[3px] p-4 text-sm ${
        state.status === 'success'
          ? 'border-brand-blue bg-brand-blue text-brand-white'
          : 'border-brand-red bg-brand-white text-brand-black'
      }`}
    >
      <p className="font-mono font-bold uppercase">{state.message}</p>
      {state.preview && (
        <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap border-[3px] border-brand-black bg-brand-white p-4 font-mono text-xs leading-relaxed text-brand-black">
          {state.preview}
        </pre>
      )}
    </div>
  )
}

export function DrawForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(triggerDraw, initialState)
  return (
    <form action={action} className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">Run Draw</h2>
      <p className="mt-2 text-sm">
        This creates one assignment per entry and locks the draw. It does not
        send result emails.
      </p>
      <label className="mt-4 block">
        <span className="font-mono text-xs font-bold uppercase">Type RUN DRAW</span>
        <input
          name="confirmation"
          className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-[3px] focus:ring-brand-blue"
          disabled={disabled || pending}
        />
      </label>
      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-red px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-block skew-x-[12deg]">
          {pending ? 'Drawing...' : 'Run Draw'}
        </span>
      </button>
      <StatusMessage state={state} />
    </form>
  )
}

export function TestEmailForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(sendTestEmail, initialState)
  return (
    <form action={action} className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">Test Email</h2>
      <p className="mt-2 text-sm">
        Sends the first drawn result to one test inbox and shows the generated
        copy here.
      </p>
      <label className="mt-4 block">
        <span className="font-mono text-xs font-bold uppercase">Test inbox</span>
        <input
          name="email"
          type="email"
          className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-[3px] focus:ring-brand-blue"
          disabled={disabled || pending}
          placeholder="name@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-block skew-x-[12deg]">
          {pending ? 'Sending...' : 'Send Test'}
        </span>
      </button>
      <StatusMessage state={state} />
    </form>
  )
}

export function RefreshFixturesForm() {
  const [state, action, pending] = useActionState(refreshFixturesNow, initialState)
  return (
    <form action={action} className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">Refresh Fixtures</h2>
      <p className="mt-2 text-sm">
        Pulls the latest fixture feed and updates the match cache used by the
        public pages.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-block skew-x-[12deg]">
          {pending ? 'Refreshing...' : 'Refresh Now'}
        </span>
      </button>
      <StatusMessage state={state} />
    </form>
  )
}

export function SyncPaidForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(syncPaidFromSheet, initialState)
  return (
    <form action={action} className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">Sync Paid</h2>
      <p className="mt-2 text-sm">
        Reads the Google Sheet and updates the paid column in the admin entry
        table.
      </p>
      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-block skew-x-[12deg]">
          {pending ? 'Syncing...' : 'Sync Paid'}
        </span>
      </button>
      <StatusMessage state={state} />
    </form>
  )
}

export function SendPendingEmailsForm({
  disabled,
  pendingCount,
}: {
  disabled: boolean
  pendingCount: number
}) {
  const [state, action, pending] = useActionState(sendPendingEmails, initialState)
  return (
    <form action={action} className="border-[3px] border-brand-black bg-brand-white p-5 shadow-[8px_8px_0_#000000]">
      <h2 className="font-headline text-5xl font-black uppercase leading-none">Send Results</h2>
      <p className="mt-2 text-sm">
        Sends unsent draw emails to entrants. Test first, then use this only
        when the sending domain and copy are approved.
      </p>
      <p className="mt-3 font-mono text-xs font-bold uppercase">
        Pending emails: {pendingCount}
      </p>
      <label className="mt-4 block">
        <span className="font-mono text-xs font-bold uppercase">
          Type SEND RESULTS
        </span>
        <input
          name="confirmation"
          className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-[3px] focus:ring-brand-blue"
          disabled={disabled || pending}
        />
      </label>
      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-4 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-red px-6 py-3 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[6px_6px_0_#000000] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-block skew-x-[12deg]">
          {pending ? 'Sending...' : 'Send Pending Emails'}
        </span>
      </button>
      <StatusMessage state={state} />
    </form>
  )
}
