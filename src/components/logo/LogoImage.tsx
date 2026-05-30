'use client'

import Image from 'next/image'
import { useState } from 'react'

// Drop WC_sweepstake.png into /public/ - this component picks it up automatically.
// If the file isn't there yet, it falls back to the text placeholder below.
export default function LogoImage() {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <span className="font-headline font-black text-2xl text-brand-ink leading-none">
        411 WC SWEEPSTAKE
      </span>
    )
  }

  return (
    <Image
      src="/WC_sweepstake.png"
      alt="411 World Cup Sweepstake - home"
      width={240}
      height={80}
      priority
      className="h-14 w-auto object-contain md:h-[68px]"
      onError={() => setHasError(true)}
    />
  )
}
