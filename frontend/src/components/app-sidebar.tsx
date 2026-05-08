'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, LinkIcon, ExternalLink, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { logout } from '@/lib/api'

const navItems = [
  { href: '/',          icon: LinkIcon,   label: 'Programs'  },
  { href: '/analytics', icon: BarChart3,  label: 'Analytics' },
]

export function AppSidebar() {
  const pathname      = usePathname()
  const router        = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // token may already be invalid — proceed anyway
    } finally {
      localStorage.removeItem('api_token')
      localStorage.removeItem('user')
      router.replace('/login')
    }
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold">
          🔗
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">DineshStack</p>
          <p className="text-xs text-sidebar-foreground/60">Referral Manager</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/' ? pathname === '/' : pathname?.startsWith(href) ?? false
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8000'}/tools/hostinger`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Test redirect
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Open /tools/hostinger in new tab</TooltipContent>
        </Tooltip>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
