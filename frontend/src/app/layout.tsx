import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthGuard } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DineshStack Referral Manager',
  description: 'Manage and auto-rotate your affiliate referral links',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}
