import { NextRequest, NextResponse } from 'next/server'

// Pages that belong to the Next.js admin app — never touch these
const ADMIN_PATHS = new Set(['login', 'analytics', 'programs'])

// Affiliate redirect URL prefixes defined in routes/web.php
const REDIRECT_PREFIXES = new Set(['tools', 'deals', 'get', 'start', 'go'])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return NextResponse.next() // homepage — admin dashboard

  const first = segments[0]

  // Never intercept Next.js internals or API routes
  if (first === 'api' || first === 'favicon.ico') return NextResponse.next()

  // Never intercept admin pages
  if (ADMIN_PATHS.has(first)) return NextResponse.next()

  // /tools/{slug}, /deals/{slug}, /get/{slug}, /start/{slug}, /go/{slug}
  const isPrefixedRedirect = REDIRECT_PREFIXES.has(first) && segments.length === 2

  // /{slug}  — root-level redirect (e.g. /vps2-hosting, /hosting)
  const isRootSlug = segments.length === 1 && /^[a-z0-9][a-z0-9\-]+$/.test(first)

  if (isPrefixedRedirect || isRootSlug) {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '')
      .replace(/\/api$/, '') // strip trailing /api
      || 'https://api-referral-system.orions360.com'

    return NextResponse.redirect(`${apiBase}${pathname}`, 302)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all paths except Next.js static assets
  matcher: ['/((?!_next/static|_next/image).*)'],
}
