import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
});
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Wall Calendar - Interactive Hollow Knight Planner',
  description: 'A beautiful, interactive wall calendar with Hollow Knight aesthetics, page-flip animations, and persistent notes.',
  generator: 'Wall Calendar',
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Wall Calendar - Interactive Hollow Knight Planner',
    description: 'A beautiful, interactive wall calendar with Hollow Knight aesthetics, page-flip animations, and persistent notes.',
    url: 'http://localhost:3000',
    siteName: 'Wall Calendar',
    images: [
      {
        url: '/images/hollow-knight/dec.png',
        width: 1200,
        height: 630,
        alt: 'Wall Calendar Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wall Calendar - Interactive Hollow Knight Planner',
    description: 'A beautiful, interactive wall calendar with Hollow Knight aesthetics, page-flip animations, and persistent notes.',
    images: ['/images/hollow-knight/dec.png'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.variable} ${_geistMono.variable} ${_playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
