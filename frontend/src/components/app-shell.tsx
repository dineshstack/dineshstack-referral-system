'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin  = pathname === '/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
