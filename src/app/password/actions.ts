'use server'

import { redirect } from 'next/navigation'
import { setSiteAuthenticated, validSitePassword } from '@/lib/siteAuth'

export async function unlockSite(formData: FormData) {
  const password = String(formData.get('password') ?? '')

  if (validSitePassword(password)) {
    await setSiteAuthenticated()
    redirect('/')
  }

  redirect('/password?error=1')
}
