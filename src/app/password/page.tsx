import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  isSiteAuthenticated,
  isSiteProtectionConfigured,
} from '@/lib/siteAuth'
import { unlockSite } from './actions'

export const dynamic = 'force-dynamic'

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (!isSiteProtectionConfigured() || (await isSiteAuthenticated())) {
    redirect('/')
  }

  const params = await searchParams

  return (
    <section className="relative overflow-hidden px-5 py-12 md:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-[34vw] bg-brand-blue" />
        <div className="absolute right-[29vw] top-0 h-full w-16 skew-x-[-18deg] bg-brand-red" />
        <div className="absolute left-0 top-0 h-[70%] w-[68%] diagonal-lines text-brand-black opacity-[0.06]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.65fr)] lg:items-start">
        <div>
          <p className="mb-4 inline-block bg-brand-red px-3 py-1 font-mono text-xs font-bold uppercase text-brand-white">
            ★ Staff access
          </p>
          <h1 className="font-headline text-7xl font-black uppercase leading-none md:text-8xl">
            Enter The Sweepstake
          </h1>
          <div className="my-6 h-[5px] max-w-sm bg-brand-black" />
          <p className="max-w-xl text-xl font-semibold leading-snug">
            This page is password protected. Enter the shared password to view
            the World Cup sweepstake.
          </p>

          <form action={unlockSite} className="mt-8 max-w-md">
            <label className="block">
              <span className="font-mono text-xs font-bold uppercase">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="mt-2 w-full border-[3px] border-brand-black bg-brand-white px-4 py-3 font-mono text-base focus:outline-none focus:ring-[3px] focus:ring-brand-blue"
                autoComplete="current-password"
              />
            </label>

            {params.error && (
              <p className="mt-3 font-mono text-sm font-bold text-brand-red">
                That password is not quite right.
              </p>
            )}

            <button className="mt-6 skew-x-[-12deg] border-[3px] border-brand-black bg-brand-blue px-8 py-4 font-headline text-3xl font-black uppercase leading-none text-brand-white shadow-[8px_8px_0_#000000]">
              <span className="inline-block skew-x-[12deg]">Unlock</span>
            </button>
          </form>
        </div>

        <div className="hidden border-[3px] border-brand-black bg-brand-white p-5 shadow-[14px_14px_0_#000000] lg:block">
          <Image
            src="/WC_sweepstake.png"
            alt="411 World Cup Sweepstake"
            width={1536}
            height={1024}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  )
}
