// app/layout.tsx (for App Router) or pages/_app.tsx (for Pages Router)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bruuhim DDL',
  description: 'Professional file directory and download portal by Bruuhim',
  keywords: 'file directory, downloads, bruuhim, ddl',
  author: 'Bruuhim (@bruuhim)',
  creator: 'Bruuhim',
  publisher: 'Bruuhim',
  robots: 'index, follow',
  openGraph: {
    title: 'Bruuhim DDL - Premium File Directory',
    description: 'Professional file directory and download portal by Bruuhim',
    url: 'https://your-domain.com',
    siteName: 'Bruuhim DDL',
    images: [
      {
        url: '/logo.png', // Your logo here
        width: 1200,
        height: 630,
        alt: 'Bruuhim DDL Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bruuhim DDL - Premium File Directory',
    description: 'Professional file directory and download portal by Bruuhim',
    creator: '@bruuhim',
    images: ['/logo.png'], // Your logo here
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Add your logo as favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
