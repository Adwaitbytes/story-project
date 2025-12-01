import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './providers/ThemeProvider'
import { Web3Provider } from './providers/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Story Music dApp - Next Generation Music IP Platform',
  description: 'A revolutionary music NFT platform using Story Protocol for IP registration and licensing. Upload, discover, and monetize your music with AI-powered features.',
  keywords: 'music, NFT, IP, blockchain, Story Protocol, AI, licensing, marketplace',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased transition-colors duration-200`}>
        <Web3Provider>
          <ThemeProvider>
            <div className="min-h-screen text-story-text-primary">
              {children}
            </div>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
