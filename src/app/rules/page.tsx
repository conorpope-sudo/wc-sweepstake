const MONZO_URL =
  'https://monzo.me/conorpope/2.00?h=DUL0kW&account_type=personal'

const rules = [
  {
    key: 'entry-payment',
    content: (
      <>
        Entry to the 411 World Cup Sweepstake is £2. You must pay the £2 to
        Conor Pope prior to the draw at 12pm on 11 June 2026 to be valid.{' '}
        <a
          href={MONZO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-brand-red decoration-[3px] underline-offset-4 hover:text-brand-blue"
        >
          You can make your entry payment here
        </a>{' '}
        after filling out the entry form. Please leave your payment with
        reference &apos;Sweepstake&apos;.
      </>
    ),
  },
  {
    key: 'winner',
    content:
      'The winner will receive all of the winnings (£96), minus the cost of a secret mystery prize, to be revealed at a later date.',
  },
  {
    key: 'one-entry',
    content: 'One entry per person.',
  },
  {
    key: 'staff-only',
    content:
      'Entry is only valid to 411 staff (unless we can’t fill all 48 positions, at which point it is at Conor Pope’s discretion).',
  },
]

export default function RulesPage() {
  return (
    <section className="relative min-h-[calc(100vh-156px)] overflow-hidden bg-brand-white px-6 py-12 md:px-10 lg:px-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-[28vw] bg-brand-blue" />
        <div className="absolute right-[22vw] top-0 h-full w-16 skew-x-[-18deg] bg-brand-red" />
        <div className="absolute left-0 top-0 h-[65%] w-[58%] diagonal-lines text-brand-black opacity-[0.06]" />
        <div className="absolute bottom-20 left-[-8vw] h-12 w-[34vw] skew-x-[-18deg] bg-brand-red" />
        <div className="absolute bottom-8 left-[8vw] h-8 w-[26vw] skew-x-[-18deg] bg-brand-blue" />
        <div className="absolute right-[34vw] top-24 hidden h-28 w-28 rotate-12 football-outline text-brand-black/20 lg:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-[5px] w-24 bg-brand-black" />
          <span className="font-headline text-5xl font-black text-brand-red">★</span>
        </div>

        <h1 className="font-headline text-[5rem] font-black uppercase leading-[0.82] text-brand-black md:text-[8rem]">
          Rules
        </h1>

        <div className="mt-8 max-w-4xl border-[3px] border-brand-black bg-brand-white p-6 shadow-[14px_14px_0_#000000] md:p-8">
          <div className="space-y-6">
            {rules.map((rule, index) => (
              <div
                key={rule.key}
                className="grid gap-4 border-b-[3px] border-brand-black pb-6 last:border-b-0 last:pb-0 md:grid-cols-[5rem_1fr]"
              >
                <div className="font-headline text-6xl font-black leading-none text-brand-blue">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <p className="text-lg font-semibold leading-snug text-brand-black md:text-2xl">
                  {rule.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
