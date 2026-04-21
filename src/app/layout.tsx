import type { Metadata } from 'next'
import { Source_Serif_4, Geist, JetBrains_Mono, Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { cn } from '@/lib/utils'

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif-src',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans-src',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-src',
  weight: ['400', '500'],
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Interview Journey',
  description:
    'A quiet place for the hardest chapter of your career. Every application, every interview, on one living timeline.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          sourceSerif.variable,
          geist.variable,
          jetbrainsMono.variable,
          plusJakarta.variable,
          inter.variable,
          'font-body bg-background text-on-surface antialiased min-h-full',
        )}
      >
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
