'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TrendingUp, MousePointerClick, Link2, DollarSign, Bot, Users } from 'lucide-react'
import { getAnalytics } from '@/lib/api'
import { type AnalyticsData } from '@/types'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const DAY_OPTIONS = [7, 14, 30, 90] as const

export function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [days, setDays]       = useState<(typeof DAY_OPTIONS)[number]>(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAnalytics(days)
      .then(setData)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [days])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { totals, programs, clicks_per_day, top_referers, utm_sources, top_countries } = data
  const maxClicks   = Math.max(...programs.map(p => p.total_clicks), 1)
  const maxDay      = Math.max(...clicks_per_day.map(d => d.clicks), 1)
  const maxUtm      = Math.max(...utm_sources.map(u => u.count), 1)
  const maxCountry  = Math.max(...top_countries.map(c => c.count), 1)

  const botPct = totals.clicks > 0
    ? Math.round((totals.bot_clicks / totals.clicks) * 100)
    : 0

  const statCards = [
    { label: 'Total Clicks',   val: formatNumber(totals.clicks),      icon: MousePointerClick, color: 'text-blue-500'    },
    { label: 'Real Visitors',  val: formatNumber(totals.real_clicks),  icon: Users,             color: 'text-emerald-500' },
    { label: 'Bot Clicks',     val: formatNumber(totals.bot_clicks),   icon: Bot,               color: 'text-slate-400',
      badge: totals.clicks > 0 ? `${botPct}%` : undefined },
    { label: 'Link Rotations', val: formatNumber(totals.conversions),  icon: TrendingUp,        color: 'text-orange-500'  },
    { label: 'Links in Queue', val: formatNumber(totals.queue_total),  icon: Link2,             color: 'text-violet-500'  },
    { label: 'Total Earnings', val: formatCurrency(totals.earnings),   icon: DollarSign,        color: 'text-amber-500'   },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Click performance across all programs</p>
        </div>
        <Tabs value={String(days)} onValueChange={v => setDays(Number(v) as typeof days)}>
          <TabsList>
            {DAY_OPTIONS.map(d => <TabsTrigger key={d} value={String(d)}>{d}d</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, val, icon: Icon, color, badge }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground truncate pr-1">{label}</p>
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{val}</p>
                {badge && (
                  <Badge variant="secondary" className="mb-0.5 text-[10px]">{badge}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clicks per day bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clicks per Day</CardTitle>
        </CardHeader>
        <CardContent>
          {clicks_per_day.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No click data yet</p>
          ) : (
            <>
              <div className="flex items-end gap-1 h-40">
                {clicks_per_day.map(d => {
                  // MySQL SUM() returns a string via PDO — coerce to number
                  const botCount = Number(d.bot_clicks ?? 0)
                  const realH    = Math.max(((d.clicks - botCount) / maxDay) * 100, 0)
                  const botH     = Math.max((botCount / maxDay) * 100, 0)
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-0 group">
                      <div
                        className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden cursor-default"
                        style={{ height: '120px' }}
                        title={`${d.date}: ${d.clicks} total (${d.bot_clicks} bots)`}
                      >
                        {/* Stack: real clicks on top, bots on bottom */}
                        <div className="w-full bg-primary/80 group-hover:bg-primary transition-colors"
                             style={{ height: `${realH}%` }} />
                        {d.bot_clicks > 0 && (
                          <div className="w-full bg-slate-300 dark:bg-slate-600"
                               style={{ height: `${botH}%` }} />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/80" /> Real clicks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Bot clicks
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Program performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Program Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {programs.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No programs yet</p>
            ) : (
              programs.map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span>{p.icon}</span> {p.name}
                    </span>
                    <span className="text-muted-foreground font-medium shrink-0 ml-2">
                      {formatNumber(p.total_clicks)} · {formatCurrency(p.total_earnings)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(p.total_clicks / maxClicks) * 100}%`,
                        background: p.color ?? '#f97316',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* UTM Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources (UTM)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {utm_sources.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No UTM data yet — add <code className="text-xs">?utm_source=blog</code> to your links
              </p>
            ) : (
              utm_sources.map((u, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{u.source}</span>
                    <span className="font-medium shrink-0 ml-2">{formatNumber(u.count)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500/70 transition-all"
                      style={{ width: `${(u.count / maxUtm) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {top_referers.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No referrer data yet</p>
            ) : (
              <ol className="space-y-2">
                {top_referers.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">{r.referer ?? 'Direct'}</span>
                    <span className="font-medium shrink-0">{formatNumber(r.count)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          {top_countries.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No country data yet — countries resolve automatically every 5 minutes
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {top_countries.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.country}</span>
                    <span className="text-muted-foreground text-xs">{formatNumber(c.count)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500/70 transition-all"
                      style={{ width: `${(c.count / maxCountry) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}