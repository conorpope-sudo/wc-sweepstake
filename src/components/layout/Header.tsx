import Link from 'next/link'
import LogoImage from '@/components/logo/LogoImage'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-white border-b-[3px] border-brand-black">
      <div className="flex items-center justify-between px-5 md:px-8 h-[84px] max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-brand-ink focus-visible:outline-offset-4 rounded-sm"
        >
          <LogoImage />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/todays-matches"
            className="hidden skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-4 py-2 font-headline text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 sm:inline-block"
          >
            <span className="inline-block skew-x-[14deg]">
              <span className="lg:hidden">Today</span>
              <span className="hidden lg:inline">Today&apos;s Matches</span>
            </span>
          </Link>
          <Link
            href="/wall-chart"
            className="hidden skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-4 py-2 font-headline text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 md:inline-block"
          >
            <span className="inline-block skew-x-[14deg]">Wall Chart</span>
          </Link>

          <Link
            href="/rules"
            className="skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-4 py-2 font-headline text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4"
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
