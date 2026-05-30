import type { Metadata } from 'next'
import Shell from '@/components/layout/Shell'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://411sweepstake.com'),
  title: '411 World Cup Sweepstake 2026',
  description:
    'Find a team. Follow them to glory. 411\'s office World Cup sweepstake for the 2026 FIFA World Cup.',
  openGraph: {
    title: '411 World Cup Sweepstake 2026',
    description:
      'Find a team. Follow them to glory. 411\'s office World Cup sweepstake for the 2026 FIFA World Cup.',
    url: 'https://411sweepstake.com',
    siteName: '411 World Cup Sweepstake',
    images: [
      {
        url: '/WC_sweepstake.png',
        width: 1536,
        height: 1024,
        alt: '411 World Cup Sweepstake logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '411 World Cup Sweepstake 2026',
    description:
      'Find a team. Follow them to glory. 411\'s office World Cup sweepstake for the 2026 FIFA World Cup.',
    images: ['/WC_sweepstake.png'],
  },
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
