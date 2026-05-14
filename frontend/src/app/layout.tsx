import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import './globals.css'
/* preconnect + crossorigin declared via next/font — Next.js injects them automatically */
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthGuard } from '@/components/auth-guard'
import { AppShell } from '@/components/app-shell'
import { LocaleProvider } from '@/lib/locale'

const inter = Inter({ subsets: ['latin'],          variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap', weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  title: 'DineshStack Referral Manager',
  description: 'Manage and auto-rotate your affiliate referral links',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <LocaleProvider>
          <TooltipProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
