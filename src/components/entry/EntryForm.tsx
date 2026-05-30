'use client'

import { type SubmitState } from '@/app/actions'
import { HeroHeadline, HeroLead, HeroRule } from '@/components/hero/HeroType'

export default function EntryForm({
  action,
  pending,
  state,
}: {
  action: (formData: FormData) => void
  pending: boolean
  state: SubmitState
}) {
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined
  const generalError =
    state.status === 'error' && !state.fieldErrors ? state.message : undefined

  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <HeroRule className="h-[3px] w-20" />
        <span className="font-headline text-4xl font-black text-brand-red">★</span>
      </div>

      <HeroHeadline>
        WELCOME TO
        <br />
        411&rsquo;S WORLD CUP
        <br />
        SWEEPSTAKE
      </HeroHeadline>

      <div className="my-7 h-[5px] max-w-[640px] bg-brand-black" />

      <HeroLead>
        FIND A TEAM.
        <br />
        FOLLOW THEM TO GLORY.
      </HeroLead>

      <form action={action} className="mt-7 max-w-xl" noValidate>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block font-mono text-xs uppercase tracking-widest text-brand-black mb-1.5"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Enter your name"
              aria-invalid={Boolean(fieldErrors?.name)}
              className="w-full bg-brand-white border-[3px] border-brand-black px-4 py-4 font-mono text-sm text-brand-black placeholder:text-brand-black/35 focus:outline-none focus:border-brand-blue focus:ring-[3px] focus:ring-brand-red"
            />
            {fieldErrors?.name && (
              <p className="mt-1.5 font-mono text-xs text-brand-red">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block font-mono text-xs uppercase tracking-widest text-brand-black mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
              aria-invalid={Boolean(fieldErrors?.email)}
              className="w-full bg-brand-white border-[3px] border-brand-black px-4 py-4 font-mono text-sm text-brand-black placeholder:text-brand-black/35 focus:outline-none focus:border-brand-blue focus:ring-[3px] focus:ring-brand-red"
            />
            {fieldErrors?.email && (
              <p className="mt-1.5 font-mono text-xs text-brand-red">
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        {generalError && (
          <p role="alert" className="mt-4 font-mono text-sm text-brand-red">
            {generalError}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-16 skew-x-[-12deg] items-center justify-center border-[3px] border-brand-black bg-brand-red px-10 py-4 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[8px_8px_0_#000000] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-20 sm:py-5"
          >
            <span className="skew-x-[12deg]">{pending ? 'Entering...' : 'Submit'}</span>
          </button>

          <p className="max-w-[18rem] border-l-[6px] border-brand-blue pl-4 font-mono text-[12px] leading-relaxed text-brand-black">
            Your name and email are used only for this sweepstake.
          </p>
        </div>
      </form>
    </div>
  )
}
