'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Link2 } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname()
  const isShell = pathname !== '/login' && pathname !== '/deals' && pathname !== '/portfolio'
  const [open, setOpen] = useState(false)

  if (!isShell) return <>{children}</>

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 z-50 md:hidden">
            <AppSidebar onClose={() => setOpen(false)} />
          </div>
        </>
      )}

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b bg-background px-4 py-3 md:hidden shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">DineshStack</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
