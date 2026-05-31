import { cookies } from 'next/headers'

export const SITE_COOKIE = 'wc_sweepstake_site'
export const SITE_COOKIE_VALUE = 'authenticated'

export function isSiteProtectionConfigured(): boolean {
  return Boolean(process.env.SITE_PASSWORD)
}

export async function isSiteAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SITE_COOKIE)?.value === SITE_COOKIE_VALUE
}

export async function setSiteAuthenticated(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SITE_COOKIE, SITE_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function validSitePassword(password: string): boolean {
  return Boolean(process.env.SITE_PASSWORD && password === process.env.SITE_PASSWORD)
}
