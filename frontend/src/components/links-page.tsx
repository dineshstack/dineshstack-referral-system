'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search, RotateCw, X, ChevronLeft, ChevronRight,
  ArrowUpDown, ExternalLink, HeartPulse,
} from 'lucide-react'
import { getAllLinks, getPrograms, removeLink, requeueLink } from '@/lib/api'
import {
  type Program, type ReferralLink, type LinkStatus, type PaginatedMeta,
} from '@/types'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const STATUS_BADGE: Record<LinkStatus, { variant: 'success' | 'warning' | 'secondary' | 'danger'; label: string }> = {
  active:  { variant: 'success',   label: 'Active'  },
  queued:  { variant: 'warning',   label: 'Queued'  },
  used:    { variant: 'secondary', label: 'Used'    },
  expired: { variant: 'danger',    label: 'Expired' },
}

const HEALTH_BADGE = {
  ok:        { variant: 'success'   as const, label: 'OK'        },
  dead:      { variant: 'danger'    as const, label: 'Dead'      },
  unchecked: { variant: 'secondary' as const, label: 'Unchecked' },
}

type SortKey = 'created_at' | 'used_at' | 'status' | 'position' | 'program_id'

const STATUS_FILTERS  = ['', 'active', 'queued', 'used', 'expired'] as const
const HEALTH_FILTERS  = ['', 'ok', 'dead', 'unchecked'] as const

function pill(label: string, active: boolean, onClick: () => void) {
  return (
    <button
      key={label}
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {label || 'All'}
    </button>
  )
}

export function LinksPage() {
  const router = useRouter()

  const [links, setLinks]       = useState<ReferralLink[]>([])
  const [meta, setMeta]         = useState<PaginatedMeta | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading]   = useState(true)

  // Filters
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [programId, setProgramId]     = useState('all')
  const [status, setStatus]           = useState('')
  const [health, setHealth]           = useState('')
  const [page, setPage]               = useState(1)
  const [perPage, setPerPage]         = useState(20)
  const [sort, setSort]               = useState<SortKey>('created_at')
  const [dir, setDir]                 = useState<'asc' | 'desc'>('desc')

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { getPrograms().then(setPrograms).catch(() => {}) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllLinks({
        page, per_page: perPage, sort, dir,
        ...(debouncedSearch            ? { search: debouncedSearch } : {}),
        ...(programId && programId !== 'all' ? { program_id: parseInt(programId) } : {}),
        ...(status                     ? { status } : {}),
        ...(health                     ? { health } : {}),
      })
      setLinks(res.data)
      setMeta(res.meta)
    } catch {
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, sort, dir, debouncedSearch, programId, status, health])

  useEffect(() => { load() }, [load])

  function toggleSort(key: SortKey) {
    if (sort === key) setDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(key); setDir('desc') }
    setPage(1)
  }

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    return (
      <button
        className={`flex items-center gap-1 text-left ${sort === col ? 'text-foreground' : ''}`}
        onClick={() => toggleSort(col)}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sort === col ? 'text-primary' : 'opacity-40'}`} />
      </button>
    )
  }

  async function handleRemove(link: ReferralLink) {
    const msg = link.status === 'active'
      ? 'Remove active link? The next queued link will become active.'
      : 'Remove this queued link?'
    if (!confirm(msg)) return
    try {
      await removeLink(link.program_id, link.id)
      toast.success('Link removed')
      load()
    } catch {
      toast.error('Remove failed')
    }
  }

  async function handleRequeue(link: ReferralLink) {
    if (!confirm('Re-queue this link?')) return
    try {
      await requeueLink(link.program_id, link.id)
      toast.success('Link re-queued')
      load()
    } catch {
      toast.error('Re-queue failed')
    }
  }

  const totalPages = meta?.last_page ?? 1

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Links</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta ? `${meta.total.toLocaleString()} links across all programs` : 'All referral links'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* URL search */}
            <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search URL…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-8"
              />
            </div>

            {/* Program dropdown */}
            <Select value={programId} onValueChange={v => { setProgramId(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.icon} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Per page */}
            <Select value={String(perPage)} onValueChange={v => { setPerPage(parseInt(v)); setPage(1) }}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[20, 50, 100].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            {STATUS_FILTERS.map(s =>
              pill(s ? s.charAt(0).toUpperCase() + s.slice(1) : '', status === s, () => { setStatus(s); setPage(1) })
            )}
            <span className="text-xs text-muted-foreground ml-3">Health:</span>
            {HEALTH_FILTERS.map(h =>
              pill(h ? h.charAt(0).toUpperCase() + h.slice(1) : '', health === h, () => { setHealth(h); setPage(1) })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
            </div>
          ) : links.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              No links match your filters
            </p>
          ) : (
            <div className="overflow-x-auto">

              {/* Desktop header */}
              <div className="hidden sm:grid grid-cols-[2rem_156px_1fr_80px_80px_88px_100px_64px] gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                <span>#</span>
                <SortBtn col="program_id" label="Program" />
                <span>URL</span>
                <SortBtn col="status"     label="Status" />
                <span>Health</span>
                <SortBtn col="created_at" label="Added" />
                <SortBtn col="used_at"    label="Used / Exp." />
                <span />
              </div>

              <div className="divide-y">
                {links.map((link, i) => {
                  const rowNum    = ((meta?.current_page ?? 1) - 1) * perPage + i + 1
                  const s         = STATUS_BADGE[link.status]
                  const h         = HEALTH_BADGE[link.health_status] ?? HEALTH_BADGE.unchecked
                  const isExpiring = link.expires_at && link.status !== 'used' && link.status !== 'expired'

                  const actionBtn = (link.status === 'active' || link.status === 'queued') ? (
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemove(link)}
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  ) : (link.status === 'used' || link.status === 'expired') ? (
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-emerald-600 hover:text-emerald-700 shrink-0"
                      onClick={() => handleRequeue(link)}
                      title="Re-queue"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                  ) : null

                  return (
                    <div key={link.id}>
                      {/* Mobile card */}
                      <div className="sm:hidden p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{rowNum}</span>
                              {link.program && (
                                <button
                                  onClick={() => router.push(`/programs/${link.program!.id}`)}
                                  className="flex items-center gap-1 text-xs font-medium hover:text-primary"
                                >
                                  <span>{link.program.icon}</span>
                                  <span className="truncate max-w-[120px]">{link.program.name}</span>
                                </button>
                              )}
                              <Badge variant={s.variant} className="text-[10px] px-1.5 shrink-0">{s.label}</Badge>
                            </div>
                            <p className="font-mono text-xs break-all text-muted-foreground">{link.url}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>Added {formatDate(link.created_at)}</span>
                              {link.used_at && <span>Used {formatDate(link.used_at)}</span>}
                              {link.health_status === 'dead' && (
                                <span className="flex items-center gap-0.5 text-red-500">
                                  <HeartPulse className="h-3 w-3" /> dead
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">{actionBtn}</div>
                        </div>
                      </div>

                      {/* Desktop row */}
                      <div className="hidden sm:grid grid-cols-[2rem_156px_1fr_80px_80px_88px_100px_64px] gap-2 items-center px-4 py-2.5 hover:bg-muted/20 transition-colors text-sm">
                        <span className="text-xs text-muted-foreground">{rowNum}</span>

                        {/* Program */}
                        <div className="min-w-0">
                          {link.program ? (
                            <button
                              onClick={() => router.push(`/programs/${link.program!.id}`)}
                              className="flex items-center gap-1.5 text-xs font-medium hover:text-primary w-full"
                            >
                              <span className="shrink-0">{link.program.icon}</span>
                              <span className="truncate">{link.program.name}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-40" />
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>

                        {/* URL */}
                        <div className="min-w-0">
                          <span className="truncate font-mono text-xs block">{link.url}</span>
                          {link.health_status === 'dead' && (
                            <span className="text-[10px] text-red-500 flex items-center gap-0.5 mt-0.5">
                              <HeartPulse className="h-3 w-3" /> dead
                            </span>
                          )}
                        </div>

                        <span><Badge variant={s.variant} className="text-[10px] px-1.5">{s.label}</Badge></span>
                        <span><Badge variant={h.variant} className="text-[10px] px-1.5">{h.label}</Badge></span>
                        <span className="text-xs text-muted-foreground">{formatDate(link.created_at)}</span>
                        <span className="text-xs text-muted-foreground">
                          {link.used_at
                            ? formatDate(link.used_at)
                            : isExpiring
                              ? formatDate(link.expires_at!)
                              : '—'}
                        </span>
                        <div className="flex items-center">{actionBtn}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <span>
            Showing {meta.from?.toLocaleString() ?? '—'}–{meta.to?.toLocaleString() ?? '—'} of {meta.total.toLocaleString()} links
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-xs tabular-nums">Page {page} of {totalPages}</span>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
