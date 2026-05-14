'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Sparkles, BadgeCheck, TrendingUp, ExternalLink,
  MessageCircle, Copy, Check, Moon, Sun, ArrowUp, Star,
  ChevronRight, Globe, Tag, Flame, Calendar, Quote, Zap,
} from 'lucide-react'
import { getPublicPrograms } from '@/lib/api'
import { type PublicProgram } from '@/types'
import { formatNumber } from '@/lib/utils'
import { useLocale } from '@/lib/locale'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

/* ── Dark mode ────────────────────────────────────────────────────────────── */
function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === 'dark' || (!saved && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
    setDark(isDark)
  }, [])

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return { dark, toggle }
}

/* ── Scroll-in animation wrapper ─────────────────────────────────────────── */
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`h-full ${visible ? 'animate-fade-up' : 'opacity-0'}`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/* ── Pricing badge ────────────────────────────────────────────────────────── */
function PricingBadge({ label }: { label: string }) {
  const lower = label.toLowerCase()
  const cls = lower === 'free'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : lower === 'freemium'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

/* ── Integration pills ────────────────────────────────────────────────────── */
function IntegrationPills({ integrations }: { integrations: string }) {
  const items = integrations.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5)
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Zap className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      {items.map(item => (
        <span
          key={item}
          className="inline-flex items-center rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
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

/* ── Public Navbar ────────────────────────────────────────────────────────── */
function PublicNav({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  const { locale, setLocale } = useLocale()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <a
          href="https://dineshstack.com"
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            D
          </div>
          <span className="font-semibold text-sm hidden sm:block">DineshStack</span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href="https://dineshstack.com"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
          >
            <Globe className="h-3.5 w-3.5" />
            dineshstack.com
          </a>
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Switch language"
          >
            {locale === 'ar' ? '🇬🇧 EN' : '🇦🇪 AR'}
          </button>
          <button
            onClick={toggleDark}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ── Copy button ──────────────────────────────────────────────────────────── */
function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={copy}
      title="Copy link"
      className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

/* ── Promo code pill ──────────────────────────────────────────────────────── */
function PromoCodePill({ code, accent, label }: { code: string; accent: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="group/pill w-full flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all hover:shadow-sm"
      style={{ borderColor: accent + '40', background: accent + '08' }}
      title="Click to copy code"
    >
      <Tag className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
          {label}
        </p>
        <p className="font-mono font-bold text-sm tracking-widest text-foreground truncate">{code}</p>
      </div>
      <div className="shrink-0 rounded-lg p-1 transition-colors" style={{ background: accent + '15' }}>
        {copied
          ? <Check className="h-3.5 w-3.5 text-emerald-500" />
          : <Copy className="h-3.5 w-3.5" style={{ color: accent }} />}
      </div>
    </button>
  )
}

/* ── Star rating ──────────────────────────────────────────────────────────── */
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  )
}

/* ── Bento Lead Card (first item — wider horizontal layout) ───────────────── */
function BentoLeadCard({ p }: { p: PublicProgram }) {
  const { t, locale } = useLocale()
  const accent = p.color ?? '#4f46e5'
  const isHot  = p.clicks_30d >= 50

  return (
    <div
      className="group relative flex flex-col sm:flex-row h-full rounded-2xl border-2 bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
      style={{ borderColor: accent + '30' }}
    >
      <div className="h-1.5 sm:h-auto sm:w-1.5 w-full shrink-0" style={{ background: accent }} />

      <div className="flex flex-col sm:flex-row flex-1 p-5 gap-5">
        {/* Left: icon + meta */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2"
            style={{ background: accent + '18', borderColor: accent + '30' }}
          >
            {p.icon || '🔗'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {p.exclusive_note && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  {p.exclusive_note}
                </span>
              )}
              {p.pricing_label && <PricingBadge label={p.pricing_label} />}
            </div>
            <p className="font-bold text-lg leading-snug group-hover:text-primary transition-colors mb-0.5">
              {p.name}
            </p>
            <p className="text-xs text-muted-foreground mb-2">{p.category}</p>

            {/* Trust bar */}
            {(p.my_rating || p.using_since || isHot || p.review_score) && (
              <div className="flex flex-wrap items-center gap-3 mb-2.5">
                {p.my_rating && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={p.my_rating} />
                    <span className="text-[10px] text-muted-foreground">{t('deals.my_pick')}</span>
                  </span>
                )}
                {p.using_since && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {t('deals.using_since')} {p.using_since}
                  </span>
                )}
                {isHot && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-500">
                    <Flame className="h-3 w-3 fill-orange-500" />
                    {formatNumber(p.clicks_30d)} {t('deals.this_month')}
                  </span>
                )}
                {p.review_score && (
                  <a
                    href={p.review_url ?? undefined}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {p.review_score.toFixed(1)} {t('deals.review_score')}
                  </a>
                )}
              </div>
            )}

            {p.description && (
              <div className="relative rounded-xl bg-muted/40 border border-border/40 px-3.5 py-2.5 mb-2.5">
                <Quote className="absolute top-2 left-2.5 h-3 w-3 text-muted-foreground/30" />
                <p className="text-xs leading-relaxed text-muted-foreground pl-4 italic line-clamp-3">
                  {p.description}
                </p>
              </div>
            )}

            {p.integrations && <IntegrationPills integrations={p.integrations} />}
          </div>
        </div>

        {/* Right: benefit + promo + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 sm:w-52">
          <div className="flex-1 sm:flex-none w-full sm:w-auto">
            {p.referral_benefit && (
              <div className="rounded-xl bg-muted/60 border border-border/50 px-3 py-2.5 mb-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>
                  {t('deals.you_get')}
                </p>
                <p className="text-sm text-foreground">{p.referral_benefit}</p>
              </div>
            )}
            {p.promo_code && (
              <div className="mb-2.5">
                <PromoCodePill code={p.promo_code} accent={accent} label={t('deals.promo_code_label')} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={whatsappShare(p, locale)}
              target="_blank"
              rel="noreferrer noopener"
              title={t('deals.whatsapp_share')}
              className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-[#25d366] hover:bg-[#25d366]/10 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <CopyButton url={p.embed_url} />
            <a
              href={p.embed_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: accent }}
            >
              {t('deals.cta')}
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {p.last_verified_at && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <BadgeCheck className="h-3 w-3" />
              {t('deals.verified')} {timeAgo(p.last_verified_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Standard Deal Card ───────────────────────────────────────────────────── */
function DealCard({ p }: { p: PublicProgram }) {
  const { t, locale } = useLocale()
  const accent = p.color ?? '#4f46e5'
  const isHot  = p.clicks_30d >= 50

  return (
    <div className="group flex flex-col h-full rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">

      <div className="h-1 w-full shrink-0" style={{ background: accent }} />

      <div className="flex flex-col flex-1 p-5 gap-3.5">

        {/* Header */}
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
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <p className="text-xs text-muted-foreground">{p.category}</p>
                {p.pricing_label && <PricingBadge label={p.pricing_label} />}
              </div>
            </div>
          </a>

          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
            <a
              href={whatsappShare(p, locale)}
              target="_blank"
              rel="noreferrer noopener"
              title={t('deals.whatsapp_share')}
              className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-[#25d366] hover:bg-[#25d366]/10 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <CopyButton url={p.embed_url} />
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

        {/* Trust bar */}
        {(p.my_rating || p.using_since || isHot || p.review_score) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {p.my_rating && (
              <span className="flex items-center gap-1">
                <StarRating rating={p.my_rating} />
                <span className="text-[10px] text-muted-foreground">{t('deals.my_pick')}</span>
              </span>
            )}
            {p.using_since && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {t('deals.using_since')} {p.using_since}
              </span>
            )}
            {isHot && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-500">
                <Flame className="h-3 w-3 fill-orange-500" />
                {formatNumber(p.clicks_30d)} {t('deals.this_month')}
              </span>
            )}
            {p.review_score && (
              <a
                href={p.review_url ?? undefined}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                {p.review_score.toFixed(1)} {t('deals.review_score')}
              </a>
            )}
          </div>
        )}

        {/* Personal quote */}
        {p.description && (
          <div className="relative rounded-xl bg-muted/40 border border-border/40 px-3.5 py-3">
            <Quote className="absolute top-2.5 left-3 h-3 w-3 text-muted-foreground/30" />
            <p className="text-xs leading-relaxed text-muted-foreground pl-4 italic">
              {p.description}
            </p>
          </div>
        )}

        {/* Integrations */}
        {p.integrations && <IntegrationPills integrations={p.integrations} />}

        {/* Visitor benefit */}
        {p.referral_benefit && (
          <div className="rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>
              {t('deals.you_get')}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{p.referral_benefit}</p>
          </div>
        )}

        {/* Promo code */}
        {p.promo_code && (
          <PromoCodePill
            code={p.promo_code}
            accent={accent}
            label={t('deals.promo_code_label')}
          />
        )}

        {/* Badges + verified */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            {p.commission && (
              <Badge variant="secondary" className="text-[10px] h-5 px-2 font-semibold">
                {p.commission}
              </Badge>
            )}
            {p.link_type === 'onetime' && (
              <Badge variant="outline" className="text-[10px] h-5 px-2">1× use</Badge>
            )}
            {p.last_verified_at && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <BadgeCheck className="h-3 w-3" />
                {t('deals.verified')} {timeAgo(p.last_verified_at)}
              </span>
            )}
          </div>
          {!isHot && p.clicks_30d > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums shrink-0">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {formatNumber(p.clicks_30d)}
            </span>
          )}
        </div>

        {/* CTA */}
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

/* ── Featured Card (exclusive picks — horizontal prominent layout) ─────────── */
function FeaturedCard({ p }: { p: PublicProgram }) {
  const { t, locale } = useLocale()
  const accent = p.color ?? '#4f46e5'

  return (
    <div
      className="group relative flex flex-col sm:flex-row rounded-2xl border-2 bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
      style={{ borderColor: accent + '35' }}
    >
      <div className="h-1 sm:h-auto sm:w-1.5 w-full shrink-0" style={{ background: accent }} />

      <div className="flex flex-col sm:flex-row flex-1 p-5 gap-5">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2"
            style={{ background: accent + '18', borderColor: accent + '30' }}
          >
            {p.icon || '🔗'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5"
                style={{ background: accent + '20', color: accent }}
              >
                <Star className="h-2.5 w-2.5 fill-current" />
                {p.exclusive_note || t('deals.featured')}
              </span>
              {p.pricing_label && <PricingBadge label={p.pricing_label} />}
            </div>
            <p className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
              {p.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>

            {/* Trust bar */}
            {(p.my_rating || p.using_since || p.review_score) && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {p.my_rating && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={p.my_rating} />
                    <span className="text-[10px] text-muted-foreground">{t('deals.my_pick')}</span>
                  </span>
                )}
                {p.using_since && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {t('deals.using_since')} {p.using_since}
                  </span>
                )}
                {p.review_score && (
                  <a
                    href={p.review_url ?? undefined}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {p.review_score.toFixed(1)} {t('deals.review_score')}
                  </a>
                )}
              </div>
            )}

            {p.description && (
              <div className="relative mt-2.5 rounded-xl bg-muted/40 border border-border/40 px-3.5 py-2.5">
                <Quote className="absolute top-2 left-2.5 h-3 w-3 text-muted-foreground/30" />
                <p className="text-xs leading-relaxed text-muted-foreground pl-4 italic line-clamp-3">
                  {p.description}
                </p>
              </div>
            )}

            {p.integrations && (
              <div className="mt-2">
                <IntegrationPills integrations={p.integrations} />
              </div>
            )}

            {p.referral_benefit && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {p.referral_benefit}
              </p>
            )}
            {p.promo_code && (
              <div className="mt-2">
                <PromoCodePill
                  code={p.promo_code}
                  accent={accent}
                  label={t('deals.promo_code_label')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            {p.commission && (
              <Badge
                className="text-[10px] h-5 px-2 font-bold border"
                style={{ background: accent + '15', color: accent, borderColor: accent + '30' }}
              >
                {p.commission}
              </Badge>
            )}
            {p.last_verified_at && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <BadgeCheck className="h-3 w-3" />
                {t('deals.verified')} {timeAgo(p.last_verified_at)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={whatsappShare(p, locale)}
              target="_blank"
              rel="noreferrer noopener"
              title={t('deals.whatsapp_share')}
              className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-[#25d366] hover:bg-[#25d366]/10 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <CopyButton url={p.embed_url} />
            <a
              href={p.embed_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: accent }}
            >
              {t('deals.cta')}
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export function DealsPage() {
  const { t, locale } = useLocale()
  const { dark, toggle: toggleDark } = useDarkMode()
  const [programs, setPrograms] = useState<PublicProgram[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy]     = useState<'trending' | 'default'>('trending')
  const [showTop, setShowTop]   = useState(false)

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

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* JSON-LD: @graph of Product schemas with per-card aggregateRating */
  useEffect(() => {
    if (programs.length === 0) return
    const id = 'deals-jsonld'
    let el = document.getElementById(id) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id   = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': programs.map(p => ({
        '@type': 'Product',
        name: p.name,
        url: p.embed_url,
        description: p.description ?? p.referral_benefit ?? p.name,
        ...(p.review_score ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.review_score,
            bestRating: 5,
            reviewCount: 1,
          },
        } : {}),
        ...(p.my_rating ? {
          review: {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Dinesh' },
            reviewRating: { '@type': 'Rating', ratingValue: p.my_rating, bestRating: 5 },
          },
        } : {}),
      })),
    })
    return () => { document.getElementById(id)?.remove() }
  }, [programs])

  const categories = useMemo(
    () => ['', ...Array.from(new Set(programs.map(p => p.category).filter(Boolean))).sort()],
    [programs],
  )

  const featured = useMemo(
    () => programs.filter(p => p.exclusive_note),
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

  const showFeatured = featured.length > 0 && search === '' && category === ''

  // Bento: first card in main grid gets wider slot when no featured section is active
  const bentoLeadId = !showFeatured && filtered.length >= 2 ? filtered[0]?.id : null

  return (
    <div className="min-h-screen bg-background">

      <PublicNav dark={dark} toggleDark={toggleDark} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative border-b overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-background pointer-events-none" />
        <div className="deals-hero-grid absolute inset-0 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

          <div className="flex items-start gap-5 mb-6">
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
                D
              </div>
              <span className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold ring-2 ring-background">
                ✓
              </span>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 rounded-full px-2.5 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                  {t('deals.badge')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1.5">
                {t('deals.hero_greeting')}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t('deals.hero_role')}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            {t('deals.subtitle')}
          </p>

          {/* Credibility stats */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {[
              { value: '10+', label: t('deals.stat_years') },
              { value: t('deals.stat_role_value'), label: t('deals.stat_role') },
              { value: loading ? '…' : `${programs.length}`, label: t('deals.stat_tools') },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
              </div>
            ))}
            <div className="h-8 w-px bg-border hidden sm:block" />
            <a
              href="https://dineshstack.com"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              dineshstack.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Sticky category nav ───────────────────────────────────────────── */}
      {categories.length > 1 && !loading && (
        <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {categories.map(c => (
                <button
                  key={c || '__all__'}
                  onClick={() => setCategory(c)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all shrink-0 ${
                    category === c
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {c || t('deals.all')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Affiliate disclosure ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-px" />
            <span>{t('deals.disclosure')}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 pl-5">{t('deals.editorial_note')}</p>
        </div>

        {/* ── Featured picks ──────────────────────────────────────────────── */}
        {showFeatured && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t('deals.featured_title')}
              </h2>
            </div>
            <div className="space-y-3">
              {featured.map((p, i) => (
                <AnimatedCard key={p.id} delay={i * 80}>
                  <FeaturedCard p={p} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Search + sort ───────────────────────────────────────────────── */}
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

        {/* ── Results count ───────────────────────────────────────────────── */}
        {!loading && (
          <p className="text-xs text-muted-foreground">
            {countLabel}
            {category ? ` · ${category}` : ''}
            {search ? ` · "${search}"` : ''}
          </p>
        )}

        {/* ── Bento grid ──────────────────────────────────────────────────── */}
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
            {filtered.map((p, i) => {
              const isLead = p.id === bentoLeadId
              return (
                <div key={p.id} className={isLead ? 'sm:col-span-2 lg:col-span-2' : ''}>
                  <AnimatedCard delay={Math.min(i, 5) * 60}>
                    {isLead ? <BentoLeadCard p={p} /> : <DealCard p={p} />}
                  </AnimatedCard>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Personal footer ─────────────────────────────────────────────── */}
        <div className="border-t pt-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-start">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  D
                </div>
                <span className="text-sm font-semibold">Dinesh · DineshStack</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">{t('deals.footer')}</p>
            </div>
            <a
              href="https://dineshstack.com"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shrink-0"
            >
              <Globe className="h-3.5 w-3.5" />
              dineshstack.com
            </a>
          </div>
          <p className="mt-5 text-center text-[11px] text-muted-foreground/50">
            © {new Date().getFullYear()} DineshStack · {t('deals.rights')}
          </p>
        </div>

      </div>

      {/* ── Back to top ─────────────────────────────────────────────────────── */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          aria-label={t('deals.back_to_top')}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

    </div>
  )
}
