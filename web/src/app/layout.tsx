import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { ClientProviders } from '@/components/ClientProviders'
import { cn } from '@/lib/utils'

import './globals.css'

export const metadata: Metadata = {
  title: 'Good Bread by Greg',
  description: 'Made with love, built on Ethereum.',
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
  src: '../assets/fonts/kelsi/fill.otf',
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
      ])}
    >
      <ClientProviders>
        <body className="bg-brand-background text-brand-primary">
          {children}
        </body>
      </ClientProviders>
    </html>
  )
}
