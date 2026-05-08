'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Check, ExternalLink, Plus, X, RotateCw, Bot, Clock, HeartPulse } from 'lucide-react'
import { getProgram, getLinks, removeLink, addLinks } from '@/lib/api'
import { type Program, type ReferralLink, type ClickEvent, type LinkStatus } from '@/types'
import { buildRedirectUrl, formatDate, formatDateTime } from '@/lib/utils'
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
  const [program, setProgram]           = useState<Program | null>(null)
  const [links, setLinks]               = useState<ReferralLink[]>([])
  const [recentClicks, setRecentClicks] = useState<ClickEvent[]>([])
  const [loading, setLoading]           = useState(true)
  const [showAdd, setShowAdd]           = useState(false)
  const [filter, setFilter]             = useState<FilterTab>('all')
  const [copiedUrl, setCopiedUrl]       = useState(false)

  async function load() {
    try {
      const [prog, linkList] = await Promise.all([getProgram(id), getLinks(id)])
      setProgram(prog.data)
      setRecentClicks(prog.recent_clicks)
      setLinks(linkList)
    } catch {
      toast.error('Failed to load program')
    } finally {
      setLoading(false)
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>{program.icon}</span> {program.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {program.category} · {program.link_type === 'onetime' ? 'One-time links' : 'Permanent link'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Links
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks',  val: program.total_clicks },
          { label: 'Links Used',    val: program.total_conversions },
          { label: 'In Queue',      val: links.filter(l => l.status === 'queued').length },
          { label: 'Commission',    val: program.commission ?? '—' },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-xl font-bold">{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Embed URL */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Your embed link (use this everywhere)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm font-mono">
            {redirectUrl}
          </code>
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

      {/* Link queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Link Queue</CardTitle>
            <Tabs value={filter} onValueChange={v => setFilter(v as FilterTab)}>
              <TabsList className="h-8">
                {(['all', 'active', 'queued', 'used'] as const).map(f => (
                  <TabsTrigger key={f} value={f} className="text-xs px-2.5 h-7">
                    {f} ({counts[f]})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Table header */}
            <div className="grid grid-cols-[2rem_1fr_80px_90px_100px_40px] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>#</span>
              <span>URL</span>
              <span>Status</span>
              <span>Added</span>
              <span>Used / Expires</span>
              <span />
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No links in this filter</p>
            ) : (
              filtered.map((link, i) => {
                const s          = STATUS_BADGE[link.status]
                const isExpiring = link.expires_at && link.status !== 'used' && link.status !== 'expired'
                return (
                  <div
                    key={link.id}
                    className={`grid grid-cols-[2rem_1fr_80px_90px_100px_40px] gap-2 items-center px-4 py-2.5 text-sm ${
                      link.status === 'active' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="truncate font-mono text-xs block">{link.url}</span>
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
                      {link.used_at ? (
                        formatDate(link.used_at)
                      ) : isExpiring ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(link.expires_at!)}
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
                    </span>
                  </div>
                )
              })
            )}
          </div>
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
