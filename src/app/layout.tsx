import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bruuhim DDL',
  description: 'Professional file directory and download portal by Bruuhim',
  keywords: 'file directory, downloads, bruuhim, ddl',
  authors: [{ name: 'Bruuhim (@bruuhim)' }],
  creator: 'Bruuhim',
  publisher: 'Bruuhim',
  robots: 'index, follow',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Bruuhim DDL',
    description: 'Professional file directory and download portal by Bruuhim',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
