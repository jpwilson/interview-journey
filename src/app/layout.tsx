import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interview Journey',
  description:
    'Your employment lifetime, organised. Track every application, interview, and career milestone.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${geist.className} min-h-full bg-slate-900 text-white antialiased`}>
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
