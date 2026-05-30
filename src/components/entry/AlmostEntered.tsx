import { HeroHeadline, HeroRule } from '@/components/hero/HeroType'

const MONZO_URL =
  'https://monzo.me/conorpope/2.00?h=DUL0kW&account_type=personal'

export default function AlmostEntered({ name }: { name: string }) {
  return (
    <div>
      <p className="mb-5 inline-block skew-x-[-12deg] bg-brand-blue px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-white">
        <span className="inline-block skew-x-[12deg]">
          Entry received - thanks, {name}
        </span>
      </p>

      <HeroHeadline>
        YOU HAVE
        <br />
        ALMOST ENTERED
        <br />
        <span className="text-brand-blue">411&rsquo;S</span> WORLD CUP
        <br />
        SWEEPSTAKE
      </HeroHeadline>

      <HeroRule className="my-6 h-[5px] max-w-sm" />

      <p
        className="max-w-lg font-headline text-4xl font-black uppercase leading-none text-brand-black"
      >
        To make your entry official, please send your £2 entry fee to Conor.
      </p>

      <a
        href={MONZO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex skew-x-[-12deg] items-center justify-center border-[3px] border-brand-black bg-brand-red px-8 py-4 font-headline text-3xl font-black uppercase text-brand-white shadow-[8px_8px_0_#000000] transition-transform hover:-translate-y-1"
      >
        <span className="skew-x-[12deg]">Pay now / £2</span>
      </a>

      <p className="mt-6 max-w-sm border-l-[6px] border-brand-blue pl-4 font-mono text-[12px] leading-relaxed text-brand-black">
        Payment is tracked manually and doesn&rsquo;t affect the draw - every
        entry is drawn regardless. But please do pay Conor!
      </p>
    </div>
  )
}
