'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Sparkles, BadgeCheck, TrendingUp, ExternalLink, MessageCircle } from 'lucide-react'
import { getPublicPrograms } from '@/lib/api'
import { type PublicProgram } from '@/types'
import { formatNumber } from '@/lib/utils'
import { useLocale } from '@/lib/locale'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function whatsappShare(p: PublicProgram, locale: string): string {
  const benefit = p.referral_benefit ? `\n${p.referral_benefit}` : ''
  const msg = locale === 'ar'
    ? `شاهد هذا العرض — ${p.name}${benefit}\n${p.embed_url}`
    : `Check out this deal — ${p.name}${benefit}\n${p.embed_url}`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

function DealCard({ p }: { p: PublicProgram }) {
  const { t, locale } = useLocale()
  const accent = p.color ?? '#f97316'

  return (
    <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">

      {/* Accent top stripe */}
      <div className="h-1 w-full shrink-0" style={{ background: accent }} />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Header: icon + name + action icons */}
        <div className="flex items-start justify-between gap-3">
          <a
            href={p.embed_url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
              style={{ background: accent + '14', borderColor: accent + '30' }}
            >
              {p.icon || '🔗'}
            </div>
            <div className="min-w-0">
              {p.exclusive_note && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  {p.exclusive_note}
                </span>
              )}
              <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
            </div>
          </a>

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <a
              href={whatsappShare(p, locale)}
              target="_blank"
              rel="noreferrer noopener"
              title={t('deals.whatsapp_share')}
              className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-[#25d366] hover:bg-[#25d366]/10 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <a
              href={p.embed_url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Visitor benefit box — neutral background, accent label */}
        {p.referral_benefit && (
          <div className="rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
              {t('deals.you_get')}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{p.referral_benefit}</p>
          </div>
        )}

        {/* Badges + stats row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            {p.commission && (
              <Badge variant="secondary" className="text-[10px] h-5 px-2 font-semibold">
                {p.commission}
              </Badge>
            )}
            {p.link_type === 'onetime' && (
              <Badge variant="outline" className="text-[10px] h-5 px-2">
                1× use
              </Badge>
            )}
            {p.last_verified_at && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <BadgeCheck className="h-3 w-3" />
                {t('deals.verified')} {timeAgo(p.last_verified_at)}
              </span>
            )}
          </div>
          {p.clicks_30d > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums shrink-0">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {formatNumber(p.clicks_30d)}
            </span>
          )}
        </div>

        {/* CTA — always brand primary, never per-program color */}
        <a
          href={p.embed_url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          {t('deals.cta')}
        </a>

      </div>
    </div>
  )
}

export function DealsPage() {
  const { t, locale } = useLocale()
  const [programs, setPrograms] = useState<PublicProgram[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy]     = useState<'trending' | 'default'>('trending')

  const load = useCallback(async () => {
    try {
      setPrograms(await getPublicPrograms())
    } catch {
      // silently fail — public page
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* JSON-LD — injected imperatively to avoid React 19 script-hoisting issues */
  useEffect(() => {
    if (programs.length === 0) return
    const id     = 'deals-jsonld'
    let el = document.getElementById(id) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id   = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Affiliate Deals',
      itemListElement: programs.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Offer',
          name: p.name,
          url: p.embed_url,
          description: p.referral_benefit ?? p.name,
          ...(p.commission ? { price: p.commission } : {}),
        },
      })),
    })
    return () => { document.getElementById(id)?.remove() }
  }, [programs])

  const categories = useMemo(
    () => ['', ...Array.from(new Set(programs.map(p => p.category).filter(Boolean))).sort()],
    [programs],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = programs.filter(p =>
      (category === '' || p.category === category) &&
      (q === '' || p.name.toLowerCase().includes(q) || p.referral_benefit?.toLowerCase().includes(q)),
    )
    if (sortBy === 'trending') {
      list = [...list].sort((a, b) => b.clicks_30d - a.clicks_30d)
    }
    return list
  }, [programs, search, category, sortBy])

  const countLabel = (() => {
    const n   = filtered.length
    const key = n === 1 ? 'deals.count_suffix' : 'deals.count_suffix_plural'
    return `${n} ${t(key)}`
  })()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative border-b overflow-hidden">
        {/* subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              {t('deals.badge')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t('deals.title')}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
            {t('deals.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Affiliate disclosure — understated ────────────────────────── */}
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          {t('deals.disclosure')}
        </p>

        {/* ── Search + sort ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('deals.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rtl:pl-3 rtl:pr-9 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1 self-start sm:self-auto shrink-0">
            {(['trending', 'default'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  sortBy === s
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'trending' && <TrendingUp className="h-3 w-3" />}
                {s === 'trending' ? t('deals.sort_trending') : t('deals.sort_default')}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category pills ────────────────────────────────────────────── */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c || '__all__'}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  category === c
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {c || t('deals.all')}
              </button>
            ))}
          </div>
        )}

        {/* ── Results count ─────────────────────────────────────────────── */}
        {!loading && (
          <p className="text-xs text-muted-foreground">
            {countLabel}
            {category ? ` · ${category}` : ''}
            {search ? ` · "${search}"` : ''}
          </p>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted-foreground">{t('deals.no_results')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => <DealCard key={p.id} p={p} />)}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="border-t pt-6 pb-2 text-center text-xs text-muted-foreground">
          {t('deals.footer')}
        </div>

      </div>
    </div>
  )
}
