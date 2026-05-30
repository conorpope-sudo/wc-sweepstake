import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'wc_sweepstake_admin'
const ADMIN_COOKIE_VALUE = 'authenticated'

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_COOKIE_VALUE
}

export async function setAdminAuthenticated(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 8,
  })
}

export async function clearAdminAuthenticated(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

export function validAdminPassword(password: string): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)
}
