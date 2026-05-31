import { NextRequest, NextResponse } from 'next/server'
import { SITE_COOKIE, SITE_COOKIE_VALUE } from '@/lib/siteAuth'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    !process.env.SITE_PASSWORD ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/password') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const authenticated =
    request.cookies.get(SITE_COOKIE)?.value === SITE_COOKIE_VALUE

  if (authenticated) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/password'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api).*)'],
}
