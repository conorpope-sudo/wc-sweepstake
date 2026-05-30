import Link from 'next/link'
import LogoImage from '@/components/logo/LogoImage'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-white border-b-[3px] border-brand-black">
      <div className="flex min-h-[112px] flex-col justify-center gap-3 px-5 py-3 md:h-[84px] md:min-h-0 md:flex-row md:items-center md:justify-between md:px-8 md:py-0 max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="shrink-0 self-start focus-visible:outline-2 focus-visible:outline-brand-ink focus-visible:outline-offset-4 rounded-sm md:self-auto"
        >
          <LogoImage />
        </Link>

        <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto md:gap-4 md:overflow-visible md:pb-0">
          <Link
            href="/todays-matches"
            className="shrink-0 skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-3 py-2 font-headline text-xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 md:px-4 md:text-2xl"
          >
            <span className="inline-block skew-x-[14deg]">
              <span className="xl:hidden">Today</span>
              <span className="hidden xl:inline">Today&apos;s Matches</span>
            </span>
          </Link>
          <Link
            href="/wall-chart"
            className="shrink-0 skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-3 py-2 font-headline text-xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 md:px-4 md:text-2xl"
          >
            <span className="inline-block skew-x-[14deg]">Wall Chart</span>
          </Link>

          <Link
            href="/rules"
            className="shrink-0 skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-3 py-2 font-headline text-xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 md:px-4 md:text-2xl"
          >
            <span className="inline-block skew-x-[14deg]">Rules</span>
          </Link>

          <div aria-hidden className="hidden items-center gap-2 md:flex">
            <span className="h-4 w-16 skew-x-[-22deg] bg-brand-red" />
            <span className="h-4 w-16 skew-x-[-22deg] bg-brand-blue" />
            <span className="font-headline text-3xl font-black leading-none">
              ★
            </span>
          </div>
        </nav>
      </div>
    </header>
  )
}
