import '@rainbow-me/rainbowkit/styles.css'
import { getFrameMetadata } from 'frog/next'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClientProviders } from '@/components/ClientProviders'
import { cn } from '@/lib/utils'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const DOMAIN = new URL(process.env.DOMAIN || 'http://localhost:3000')
  const frameMetadata = await getFrameMetadata(`${DOMAIN.origin}/api/frame`)

  return {
    title: 'Good Bread by Greg',
    description: 'Made with love, built on Ethereum.',
    metadataBase: new URL(process.env.DOMAIN || 'http://localhost:3000'),
    openGraph: { images: ['/opengraph.png'] },
    other: frameMetadata,
  }
}

const pangramSans = localFont({
  display: 'swap',
  variable: '--font-pangram-sans',
  src: [
    {
      path: '../assets/fonts/pangram-sans-rounded/regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/pangram-sans-rounded/semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/pangram-sans-rounded/extrabold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
})

const pangramSansCompact = localFont({
  display: 'swap',
  variable: '--font-pangram-sans-compact',
  src: [
    {
      path: '../assets/fonts/pangram-sans-rounded/compact-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/pangram-sans-rounded/compact-bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
})

const kelsi = localFont({
  display: 'swap',
  src: [
    {
      path: '../assets/fonts/kelsi/regular.otf',
      weight: '400',
      style: 'normal',
    },
    { path: '../assets/fonts/kelsi/fill.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-kelsi',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn([
        pangramSans.variable,
        pangramSansCompact.variable,
        kelsi.variable,
        'scroll-smooth',
      ])}
    >
      <head>
        {/* Preload carousel buttons */}
        <link rel="preload" href="/carousel/dot1.svg" as="image" />
        <link rel="preload" href="/carousel/dot2-filled.svg" as="image" />
        <link rel="preload" href="/carousel/dot3-filled.svg" as="image" />
        <link rel="preload" href="/carousel/dot4-filled.svg" as="image" />
      </head>

      <body className="bg-brand-background-primary text-brand-primary">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
