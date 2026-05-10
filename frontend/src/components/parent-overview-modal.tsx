'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink, Eye, Plus, Pencil } from 'lucide-react'
import { type Program } from '@/types'
import { formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface Props {
  parent: Program
  children: Program[]
  open: boolean
  onClose: () => void
  onEditParent: () => void
  onAddChild: () => void
  onAddLinks: (child: Program) => void
}

export function ParentOverviewModal({
  parent, children, open, onClose, onEditParent, onAddChild, onAddLinks,
}: Props) {
  const router = useRouter()

  const totalClicks = children.reduce((s, c) => s + c.total_clicks, 0)
  const totalQueue  = children.reduce((s, c) => s + (c.queued_links_count ?? c.queue_count), 0)

  function queueVariant(p: Program) {
    return p.is_empty ? 'danger' : p.is_queue_low ? 'warning' : 'success'
  }
  function queueLabel(p: Program) {
    return p.is_empty ? 'Empty' : p.is_queue_low ? 'Low' : 'Active'
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">

        {/* ── Shared parent data ──────────────────────────────────────── */}
        <div className="h-1.5 w-full rounded-t-lg" style={{ background: parent.color ?? '#f97316' }} />

        <div className="px-6 pt-5 pb-5 space-y-5">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: (parent.color ?? '#f97316') + '20' }}
              >
                {parent.icon || '🔗'}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{parent.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {parent.category}{parent.commission ? ` · ${parent.commission}` : ''}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={onEditParent}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sub-programs', val: children.length },
              { label: 'Total Clicks',  val: formatNumber(totalClicks) },
              { label: 'Queue Total',   val: formatNumber(totalQueue) },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="font-bold text-lg tabular-nums">{val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Shared fields */}
          {(parent.affiliate_dashboard_url || parent.commission) && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared Data</p>

              {parent.affiliate_dashboard_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Affiliate Dashboard</p>
                  <a
                    href={parent.affiliate_dashboard_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {parent.affiliate_dashboard_url}
                  </a>
                </div>
              )}

              {parent.commission && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Commission Rate</p>
                  <p className="text-sm font-semibold">{parent.commission}</p>
                </div>
              )}
            </div>
          )}

          {/* Link to parent's own queue */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => { onClose(); router.push(`/programs/${parent.id}`) }}
          >
            <Eye className="h-3.5 w-3.5" />
            View {parent.name} own link queue
          </Button>
        </div>

        <Separator />

        {/* ── Sub-programs ────────────────────────────────────────────── */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Sub-programs{' '}
              <span className="text-muted-foreground font-normal">({children.length})</span>
            </h3>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onAddChild}>
              <Plus className="h-3.5 w-3.5" /> Add sub-program
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No sub-programs yet.
            </div>
          ) : (
            <div className="space-y-2">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: (child.color ?? '#f97316') + '20' }}
                  >
                    {child.icon || '🔗'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{child.name}</p>
                      <Badge variant={queueVariant(child)} className="text-[10px] px-1.5 shrink-0">
                        {queueLabel(child)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatNumber(child.queued_links_count ?? child.queue_count)} queued
                      {' · '}
                      {formatNumber(child.total_clicks)} clicks
                      {child.commission ? ` · ${child.commission}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => onAddLinks(child)}
                      title="Add links"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => { onClose(); router.push(`/programs/${child.id}`) }}
                      title="View link queue"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
