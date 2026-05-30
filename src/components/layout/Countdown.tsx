'use client'

import { useEffect, useState } from 'react'

// Noon UK time on 11 June 2026.
// UK is on BST (UTC+1) in June, so noon BST = 11:00 UTC.
const DRAW_TARGET = new Date('2026-06-11T11:00:00Z')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft | null {
  const diff = DRAW_TARGET.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[2.7rem]">
      <div className="font-headline text-4xl md:text-5xl font-black text-brand-white leading-none tabular-nums">
        {pad(value)}
      </div>
      <div className="font-mono text-[9px] md:text-[10px] text-brand-white/65 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  )
}

function Colon() {
  return (
    <span
      aria-hidden
      className="font-headline text-brand-red text-4xl md:text-5xl font-black leading-none mb-4 select-none"
    >
      :
    </span>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft())
    const id = setInterval(() => setTimeLeft(calculateTimeLeft()), 1_000)
    return () => clearInterval(id)
  }, [])

  const baseClasses =
    'fixed bottom-0 left-0 right-0 z-40 border-t-[3px] border-brand-black'

  if (!mounted) {
    // Stable server render - avoids hydration mismatch
    return <div className={`${baseClasses} bg-brand-black h-[72px]`} />
  }

  if (!timeLeft) {
    return (
      <div className={`${baseClasses} bg-brand-blue flex items-center justify-center h-[72px]`}>
        <p className="font-headline text-3xl font-black text-brand-white uppercase">
          The draw is live - good luck!
        </p>
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} bg-brand-black flex items-center h-[72px] overflow-x-auto`}
      role="timer"
      aria-label="Countdown to the draw"
    >
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto px-4 md:px-8 gap-4">
        <span className="font-headline text-3xl text-brand-white uppercase shrink-0 hidden sm:block">
          ★ DRAW
        </span>

        <div className="flex items-center gap-3 md:gap-5 mx-auto">
          <Unit value={timeLeft.days}    label="Days" />
          <Colon />
          <Unit value={timeLeft.hours}   label="Hrs" />
          <Colon />
          <Unit value={timeLeft.minutes} label="Min" />
          <Colon />
          <Unit value={timeLeft.seconds} label="Sec" />
        </div>

        <span className="font-mono text-[10px] text-brand-white/65 uppercase tracking-widest shrink-0 hidden sm:block text-right">
          11 JUNE 2026
        </span>
      </div>
    </div>
  )
}
