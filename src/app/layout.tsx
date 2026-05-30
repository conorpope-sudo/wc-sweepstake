import type { Metadata } from 'next'
import Shell from '@/components/layout/Shell'
import './globals.css'

export const metadata: Metadata = {
  title: '411 World Cup Sweepstake 2026',
  description:
    'Find a team. Follow them to glory. 411\'s office World Cup sweepstake for the 2026 FIFA World Cup.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
