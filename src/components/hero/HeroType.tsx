// Shared headline/typography primitives so all entry states look consistent.
// These are server components (no client hooks) and can be used anywhere.

export function HeroHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="font-headline text-[3.4rem] font-black uppercase leading-[0.86] text-brand-black sm:text-[5rem] lg:text-[6.6rem]"
    >
      {children}
    </h1>
  )
}

export function HeroLead({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="max-w-lg font-headline text-[1.7rem] font-black uppercase leading-[0.95] text-brand-black sm:text-[2.25rem]"
    >
      {children}
    </p>
  )
}

export function HeroRule({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-brand-black ${className}`} />
}
