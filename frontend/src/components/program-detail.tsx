'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Copy, Check, ExternalLink, Plus, X, RotateCw, Bot, Clock, HeartPulse, Gift, KeyRound, DollarSign, Trash2 } from 'lucide-react'
import { getProgram, getLinks, removeLink, addLinks, requeueLink, getPayouts, addPayout, deletePayout } from '@/lib/api'
import { type Program, type ReferralLink, type ClickEvent, type LinkStatus, type Payout } from '@/types'
import { buildRedirectUrl, formatDate, formatDateTime } from '@/lib/utils'
import { useLocale } from '@/lib/locale'
import { AddLinksModal } from '@/components/add-links-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_BADGE: Record<LinkStatus, { variant: 'success' | 'warning' | 'secondary' | 'danger'; label: string }> = {
  active:  { variant: 'success',   label: 'Active'  },
  queued:  { variant: 'warning',   label: 'Queued'  },
  used:    { variant: 'secondary', label: 'Used'    },
  expired: { variant: 'danger',    label: 'Expired' },
}

type FilterTab = 'all' | LinkStatus

interface ProgramDetailPageProps {
  id: number
}

export function ProgramDetailPage({ id }: ProgramDetailPageProps) {
  const router = useRouter()
  const { isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft
  const [program, setProgram]           = useState<Program | null>(null)
  const [links, setLinks]               = useState<ReferralLink[]>([])
  const [recentClicks, setRecentClicks] = useState<ClickEvent[]>([])
  const [payouts, setPayouts]           = useState<Payout[]>([])
  const [loading, setLoading]           = useState(true)
  const [showAdd, setShowAdd]           = useState(false)
  const [filter, setFilter]             = useState<FilterTab>('all')
  const [copiedUrl, setCopiedUrl]       = useState(false)

  // Payout form state
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    amount: '', currency: 'USD', paid_at: new Date().toISOString().slice(0, 10),
    payment_method: '', notes: '',
  })
  const [savingPayout, setSavingPayout] = useState(false)

  async function load() {
    try {
      const [prog, linkList, payoutList] = await Promise.all([
        getProgram(id),
        getLinks(id),
        getPayouts(id),
      ])
      setProgram(prog.data)
      setRecentClicks(prog.recent_clicks)
      setLinks(linkList)
      setPayouts(payoutList)
    } catch {
      toast.error('Failed to load program')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddPayout() {
    const amount = parseFloat(payoutForm.amount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (!payoutForm.paid_at) { toast.error('Select a payment date'); return }
    setSavingPayout(true)
    try {
      await addPayout(id, {
        amount,
        currency:        payoutForm.currency || 'USD',
        paid_at:         payoutForm.paid_at,
        payment_method:  payoutForm.payment_method || undefined,
        notes:           payoutForm.notes || undefined,
      })
      toast.success('Payout recorded')
      setShowPayoutForm(false)
      setPayoutForm({ amount: '', currency: 'USD', paid_at: new Date().toISOString().slice(0, 10), payment_method: '', notes: '' })
      load()
    } catch {
      toast.error('Failed to save payout')
    } finally {
      setSavingPayout(false)
    }
  }

  async function handleDeletePayout(payoutId: number) {
    if (!confirm('Delete this payout record? This will also reduce the program earnings total.')) return
    try {
      await deletePayout(id, payoutId)
      toast.success('Payout deleted')
      load()
    } catch {
      toast.error('Failed to delete payout')
    }
  }

  useEffect(() => { load() }, [id])

  async function handleRemove(linkId: number, status: LinkStatus) {
    const msg = status === 'active'
      ? 'Remove the active link? Next queued link will become active.'
      : 'Remove this queued link?'
    if (!confirm(msg)) return
    try {
      const res = await removeLink(id, linkId)
      toast.success(res.message)
      load()
    } catch {
      toast.error('Remove failed')
    }
  }

  async function handleRequeue(linkId: number) {
    if (!confirm('Re-queue this link? It will go back into the queue (or become active if no active link exists).')) return
    try {
      const res = await requeueLink(id, linkId)
      toast.success(res.message)
      load()
    } catch {
      toast.error('Re-queue failed')
    }
  }

  async function handleAddLinks(newLinks: string[]) {
    const res = await addLinks(id, newLinks)
    toast.success(res.message)
    setShowAdd(false)
    load()
  }

  function copyRedirect() {
    if (!program) return
    navigator.clipboard.writeText(buildRedirectUrl(program.slug))
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 1500)
  }

  const filtered = filter === 'all' ? links : links.filter(l => l.status === filter)
  const counts = {
    all:     links.length,
    active:  links.filter(l => l.status === 'active').length,
    queued:  links.filter(l => l.status === 'queued').length,
    used:    links.filter(l => l.status === 'used').length,
    expired: links.filter(l => l.status === 'expired').length,
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Program not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>← Back</Button>
      </div>
    )
  }

  const redirectUrl = buildRedirectUrl(program.slug)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <BackIcon className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>{program.icon}</span> {program.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {program.category} · {program.link_type === 'onetime' ? 'One-time links' : 'Permanent link'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Links
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks',   val: program.total_clicks },
          { label: 'Links Used',     val: program.total_conversions },
          { label: 'In Queue',       val: links.filter(l => l.status === 'queued').length },
          {
            label: 'Earned',
            val: program.total_earnings > 0
              ? `$${Number(program.total_earnings).toFixed(2)}`
              : program.commission ?? '—',
          },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-xl font-bold">{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Program info: benefit + affiliate login */}
      {(program.affiliate_dashboard_url || program.referral_benefit || program.login_email || program.login_password || program.login_method) && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          {program.affiliate_dashboard_url && (
            <div className="flex items-start gap-2">
              <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Affiliate Dashboard</p>
                <a
                  href={program.affiliate_dashboard_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {program.affiliate_dashboard_url}
                </a>
              </div>
            </div>
          )}
          {program.referral_benefit && (
            <div className="flex items-start gap-2">
              <Gift className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Visitor Benefit</p>
                <p className="text-sm">{program.referral_benefit}</p>
              </div>
            </div>
          )}
          {(program.login_email || program.login_password || program.login_method) && (
            <div className="flex items-start gap-2">
              <KeyRound className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Affiliate Login</p>
                <div className="rounded-md border bg-muted/40 px-2.5 py-2 space-y-1">
                  {program.login_method && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-16 shrink-0">Method</span>
                      <span className="font-medium">{program.login_method}</span>
                    </div>
                  )}
                  {program.login_email && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-16 shrink-0">Email</span>
                      <span className="font-mono">{program.login_email}</span>
                    </div>
                  )}
                  {program.login_password && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-16 shrink-0">Password</span>
                      <span className="font-mono">{program.login_password}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embed URL */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Your embed link (use this everywhere)</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 min-w-0 truncate rounded-md border bg-muted px-3 py-2 text-sm font-mono" dir="ltr">
            {redirectUrl}
          </code>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyRedirect}>
              {copiedUrl ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={redirectUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> Test
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Link queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Link Queue</CardTitle>
            <div className="overflow-x-auto">
              <Tabs value={filter} onValueChange={v => setFilter(v as FilterTab)}>
                <TabsList className="h-8">
                  {(['all', 'active', 'queued', 'used', 'expired'] as const).map(f => (
                    <TabsTrigger key={f} value={f} className="text-xs px-2.5 h-7">
                      {f} ({counts[f]})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No links in this filter</p>
          ) : (
            <div className="divide-y">
              {/* Mobile: card per link */}
              {filtered.map((link, i) => {
                const s          = STATUS_BADGE[link.status]
                const isExpiring = link.expires_at && link.status !== 'used' && link.status !== 'expired'
                return (
                  <div
                    key={link.id}
                    className={`p-4 space-y-2 sm:hidden ${link.status === 'active' ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                        <Badge variant={s.variant} className="text-[10px] px-1.5">{s.label}</Badge>
                        {link.health_status === 'dead' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                            <HeartPulse className="h-3 w-3" /> dead
                          </span>
                        )}
                      </div>
                      {(link.status === 'active' || link.status === 'queued') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleRemove(link.id, link.status)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(link.status === 'used' || link.status === 'expired') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700 shrink-0"
                          onClick={() => handleRequeue(link.id)}
                          title="Re-queue this link"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="font-mono text-xs break-all text-muted-foreground" dir="ltr">{link.url}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Added {formatDate(link.created_at)}</span>
                      {link.used_at && <span>Used {formatDate(link.used_at)}</span>}
                      {isExpiring && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-3 w-3" /> Expires {formatDate(link.expires_at!)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Desktop: table header */}
              <div className="hidden sm:grid grid-cols-[2rem_1fr_80px_90px_100px_40px] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground">
                <span>#</span><span>URL</span><span>Status</span>
                <span>Added</span><span>Used / Expires</span><span />
              </div>

              {/* Desktop: table rows */}
              {filtered.map((link, i) => {
                const s          = STATUS_BADGE[link.status]
                const isExpiring = link.expires_at && link.status !== 'used' && link.status !== 'expired'
                return (
                  <div
                    key={`d-${link.id}`}
                    className={`hidden sm:grid grid-cols-[2rem_1fr_80px_90px_100px_40px] gap-2 items-center px-4 py-2.5 text-sm ${
                      link.status === 'active' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="truncate font-mono text-xs block" dir="ltr">{link.url}</span>
                      {link.notes && (
                        <span className="text-[10px] text-muted-foreground truncate block">{link.notes}</span>
                      )}
                      {link.health_status === 'dead' && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500 font-medium mt-0.5">
                          <HeartPulse className="h-3 w-3" /> dead link
                        </span>
                      )}
                    </div>
                    <span><Badge variant={s.variant} className="text-[10px] px-1.5">{s.label}</Badge></span>
                    <span className="text-xs text-muted-foreground">{formatDate(link.created_at)}</span>
                    <span className="text-xs text-muted-foreground">
                      {link.used_at ? formatDate(link.used_at) : isExpiring ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-3 w-3" />{formatDate(link.expires_at!)}
                        </span>
                      ) : '—'}
                    </span>
                    <span>
                      {(link.status === 'active' || link.status === 'queued') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(link.id, link.status)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {(link.status === 'used' || link.status === 'expired') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                          onClick={() => handleRequeue(link.id)}
                          title="Re-queue this link"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent clicks */}
      {recentClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Clicks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentClicks.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${
                    c.is_bot ? 'bg-slate-300' : c.link_was_rotated ? 'bg-primary' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="truncate text-muted-foreground block">{c.referer ?? 'Direct'}</span>
                    {c.utm_source && (
                      <span className="text-[10px] text-violet-500">
                        {[c.utm_source, c.utm_medium, c.utm_campaign].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  {c.is_bot && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      <Bot className="h-2.5 w-2.5 mr-1" /> bot
                    </Badge>
                  )}
                  {!c.is_bot && c.link_was_rotated && (
                    <Badge variant="warning" className="text-[10px] px-1.5">
                      <RotateCw className="h-2.5 w-2.5 mr-1" /> rotated
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(c.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payouts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Payouts Received
              </CardTitle>
              {payouts.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total: <span className="font-semibold text-foreground">
                    ${payouts.reduce((s, p) => s + p.amount, 0).toFixed(2)}
                  </span>
                  {' '}across {payouts.length} payment{payouts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPayoutForm(v => !v)}
              className="shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Record
            </Button>
          </div>
        </CardHeader>

        {showPayoutForm && (
          <div className="border-b px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Amount *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="50.00"
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Currency</label>
                <input
                  placeholder="USD"
                  value={payoutForm.currency}
                  onChange={e => setPayoutForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-ring"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Date *</label>
                <input
                  type="date"
                  value={payoutForm.paid_at}
                  onChange={e => setPayoutForm(f => ({ ...f, paid_at: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Method</label>
                <input
                  placeholder="PayPal, Wire…"
                  value={payoutForm.payment_method}
                  onChange={e => setPayoutForm(f => ({ ...f, payment_method: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Notes</label>
              <input
                placeholder="e.g. April commission for 12 conversions"
                value={payoutForm.notes}
                onChange={e => setPayoutForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddPayout} disabled={savingPayout}>
                {savingPayout ? 'Saving…' : 'Save Payout'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowPayoutForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No payouts recorded yet. Click "Record" when you receive a payment.
            </p>
          ) : (
            <div className="divide-y">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 shrink-0">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.currency} {p.amount.toFixed(2)}
                      </span>
                      {p.payment_method && (
                        <span className="text-[10px] font-medium bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                          {p.payment_method}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{p.paid_at}</span>
                      {p.notes && <span className="truncate">· {p.notes}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeletePayout(p.id)}
                    title="Delete payout"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {program && (
        <AddLinksModal
          open={showAdd}
          program={program}
          onAdd={handleAddLinks}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
