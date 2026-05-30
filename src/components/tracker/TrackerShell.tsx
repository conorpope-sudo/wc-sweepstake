export default function TrackerShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="relative min-h-[calc(100vh-156px)] overflow-hidden bg-brand-white px-6 py-12 md:px-10 lg:px-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-[24vw] bg-brand-blue" />
        <div className="absolute right-[19vw] top-0 h-full w-14 skew-x-[-18deg] bg-brand-red" />
        <div className="absolute left-0 top-0 h-[55%] w-[58%] diagonal-lines text-brand-black opacity-[0.06]" />
        <div className="absolute bottom-16 left-[-8vw] h-10 w-[32vw] skew-x-[-18deg] bg-brand-red" />
        <div className="absolute bottom-6 left-[8vw] h-8 w-[24vw] skew-x-[-18deg] bg-brand-blue" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="mb-7 flex items-center gap-3">
          <div className="h-[5px] w-24 bg-brand-black" />
          <span className="font-headline text-5xl font-black text-brand-red">★</span>
        </div>
        <p className="mb-2 inline-block bg-brand-blue px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-brand-white">
          {eyebrow}
        </p>
        <h1 className="font-headline text-[4.7rem] font-black uppercase leading-[0.82] text-brand-black md:text-[8rem]">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
