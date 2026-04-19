import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { cn } from '@/lib/utils'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Interview Journey',
  description:
    'Your employment lifetime, organised. Track every application, interview, and career milestone.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(plusJakarta.variable, inter.variable, 'font-body bg-background text-on-surface antialiased min-h-full')}>
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </QueryProvider>
        <a
          href="https://www.hetzner.com/cloud"
          target="_blank"
          rel="noopener noreferrer"
          title="Self-hosted on Hetzner Cloud (ARM) via Coolify — migrated off Vercel+Supabase Cloud to cut demo hosting costs"
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            zIndex: 9999,
            background: "rgba(17, 24, 39, 0.85)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 9999,
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            textDecoration: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
          }}
        >
          🏠 Hetzner · Coolify
        </a>
      </body>
    </html>
  )
}
