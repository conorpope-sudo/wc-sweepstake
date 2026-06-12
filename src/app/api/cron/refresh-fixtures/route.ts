import { NextResponse } from 'next/server'
import { refreshFixtures } from '@/lib/feed/refresh'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await refreshFixtures()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('fixture refresh cron failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'The fixture refresh cron failed.',
      },
      { status: 500 },
    )
  }
}
