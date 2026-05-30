'use client'

import Link from 'next/link'
import { useState } from 'react'
import LogoImage from '@/components/logo/LogoImage'

const navLinks = [
  { href: '/todays-matches', label: "Today's Matches", shortLabel: 'Today' },
  { href: '/wall-chart', label: 'Wall Chart' },
  { href: '/rules', label: 'Rules' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-white border-b-[3px] border-brand-black">
      <div className="flex h-[84px] items-center justify-between px-5 md:px-8 max-w-[1440px] mx-auto">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-brand-ink focus-visible:outline-offset-4 rounded-sm"
          onClick={() => setMenuOpen(false)}
        >
          <LogoImage />
        </Link>

        <button
          type="button"
          className="skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-4 py-3 shadow-[4px_4px_0_#000000] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 md:hidden"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="flex skew-x-[14deg] flex-col gap-1.5" aria-hidden>
            <span className="h-[3px] w-8 bg-brand-black" />
            <span className="h-[3px] w-8 bg-brand-black" />
            <span className="h-[3px] w-8 bg-brand-black" />
          </span>
        </button>

        <nav className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="skew-x-[-14deg] border-[3px] border-brand-black bg-brand-white px-4 py-2 font-headline text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#000000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4"
            >
              <span className="inline-block skew-x-[14deg]">
                {link.shortLabel ? (
                  <>
                    <span className="xl:hidden">{link.shortLabel}</span>
                    <span className="hidden xl:inline">{link.label}</span>
                  </>
                ) : (
                  link.label
                )}
              </span>
            </Link>
          ))}
          <div aria-hidden className="hidden items-center gap-2 md:flex">
            <span className="h-4 w-16 skew-x-[-22deg] bg-brand-red" />
            <span className="h-4 w-16 skew-x-[-22deg] bg-brand-blue" />
            <span className="font-headline text-3xl font-black leading-none">
              ★
            </span>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t-[3px] border-brand-black bg-brand-white px-5 py-4 shadow-[0_8px_0_#000000] md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`skew-x-[-12deg] border-[3px] border-brand-black px-5 py-3 font-headline text-3xl font-black uppercase leading-none shadow-[5px_5px_0_#000000] focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-4 ${
                  index === 0
                    ? 'bg-brand-blue text-brand-white'
                    : 'bg-brand-white text-brand-black'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="inline-block skew-x-[12deg]">{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
