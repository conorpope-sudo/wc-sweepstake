import Image from 'next/image'

// Visual shell for the landing page. The left content column is supplied via
// `children` (the entry form / post-submit / closed states); the right column
// features the sweepstake logo. Background shapes are flat USA '94 decoration.
export default function HeroSection({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="relative min-h-[calc(100vh-156px)] overflow-hidden bg-brand-white">

      {/* ─── Background decorative layer ───────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">

        <div className="absolute right-0 top-0 h-full w-[34vw] bg-brand-blue" />
        <div className="absolute right-[29vw] top-0 h-full w-16 skew-x-[-18deg] bg-brand-red" />
        <div className="absolute bottom-0 left-0 h-16 w-[46vw] skew-x-[-18deg] bg-brand-red" />
        <div className="absolute bottom-16 left-[-8vw] h-10 w-[34vw] skew-x-[-18deg] bg-brand-blue" />
        <div className="absolute right-[36vw] top-24 hidden h-28 w-28 rotate-12 football-outline text-brand-black/20 lg:block" />

        {/* USA '94 diagonal shooting lines - top-left quadrant */}
        <div className="absolute left-0 top-0 h-[68%] w-[55%] diagonal-lines text-brand-black opacity-[0.06]" />
        <div className="absolute bottom-24 right-[14vw] hidden h-28 w-48 -rotate-6 speed-lines text-brand-red lg:block" />

        <div className="absolute left-6 top-8 font-headline text-6xl font-black text-brand-blue/15 md:left-10 md:text-8xl">
          ★
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-156px)] max-w-[1440px] items-center px-6 py-10 md:px-10 lg:px-14">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.86fr)] lg:gap-16">

          {/* Left column: entry states (supplied by the page) */}
          <div className="max-w-[680px]">{children}</div>

          {/* Right column: large sweepstake mark */}
          <div className="flex items-center justify-center lg:-translate-y-12 lg:justify-end xl:-translate-y-16">
            <div className="relative w-full max-w-[520px] border-[3px] border-brand-black bg-brand-white p-5 shadow-[14px_14px_0_#000000] md:max-w-[650px]">
              <div aria-hidden className="absolute -right-5 -top-5 h-10 w-32 skew-x-[-20deg] bg-brand-red" />
              <div aria-hidden className="absolute -bottom-6 left-8 h-8 w-44 skew-x-[-20deg] bg-brand-blue" />
              <Image
                src="/WC_sweepstake.png"
                alt="411 World Cup Sweepstake"
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 1024px) 46vw, 82vw"
                className="relative h-auto w-full object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom accent line ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-black" />

    </section>
  )
}
