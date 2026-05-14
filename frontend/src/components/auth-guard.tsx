'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const PUBLIC_PATHS = ['/login', '/deals', '/portfolio']
    const token = localStorage.getItem('api_token')
    if (!token && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
