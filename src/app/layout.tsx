import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EDGE Originals - Next-Gen Social Sweepstakes',
  description: 'Experience the future of social gaming with crypto-inspired sweepstakes, pack draws, and real-time gameplay.',
  keywords: 'casino, sweepstakes, crypto, gaming, social, pack draw, loot boxes',
  authors: [{ name: 'EDGE Originals' }],
  icons: {
    icon: '/Logo11.png',
    shortcut: '/Logo11.png',
    apple: '/Logo11.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00f0ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-casino-gradient">
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  )
}
