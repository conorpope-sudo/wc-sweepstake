import { HeroHeadline, HeroLead, HeroRule } from '@/components/hero/HeroType'

export default function EntriesClosed() {
  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <HeroRule className="h-[3px] w-20" />
        <span className="font-headline text-4xl font-black text-brand-blue">★</span>
      </div>

      <HeroHeadline>
        ENTRIES TO
        <br />
        <span className="text-brand-red">411&rsquo;S</span> WORLD CUP
        <br />
        SWEEPSTAKE
        <br />
        HAVE NOW CLOSED
      </HeroHeadline>

      <HeroRule className="my-6 h-[5px] max-w-sm" />

      <HeroLead>
        All 48 places are taken. The draw takes place at noon on 11 June -
        watch the countdown below.
      </HeroLead>
    </div>
  )
}
