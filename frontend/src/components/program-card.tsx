'use client'

import { useState } from 'react'
import { Copy, Check, Eye, Plus, Pencil, Trash2, Globe, GlobeLock } from 'lucide-react'
import { type Program } from '@/types'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ProgramCardProps {
  program: Program
  onEdit: () => void
  onDelete: () => void
  onAddLinks: () => void
  onViewDetail: () => void
  onTogglePublic: () => void
}

export function ProgramCard({
  program: p,
  onEdit,
  onDelete,
  onAddLinks,
  onViewDetail,
  onTogglePublic,
}: ProgramCardProps) {
  const [copied, setCopied] = useState(false)
  const redirectUrl = p.embed_url

  function copyRedirect() {
    navigator.clipboard.writeText(redirectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const queueVariant = p.is_empty ? 'danger' : p.is_queue_low ? 'warning' : 'success'
  const queueLabel   = p.is_empty ? 'Empty'  : p.is_queue_low ? 'Low'    : 'Active'

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Color accent stripe */}
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: p.color ?? '#f97316' }} />

      <CardContent className="pl-5 pt-5 pb-4">

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">{p.icon || '🔗'}</span>
            <div>
              <p className="font-semibold text-sm leading-tight">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {p.category} · {p.link_type === 'onetime' ? '1× use' : 'Permanent'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Public visibility toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onTogglePublic}
                  className={`rounded-md p-1 transition-colors ${
                    p.is_public
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {p.is_public
                    ? <Globe className="h-3.5 w-3.5" />
                    : <GlobeLock className="h-3.5 w-3.5" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[160px] text-center text-xs">
                {p.is_public
                  ? 'Shown on public deals page — click to hide'
                  : 'Hidden from public — click to show'}
              </TooltipContent>
            </Tooltip>
            <Badge variant={queueVariant}>{queueLabel}</Badge>
          </div>
        </div>

        {/* Public indicator strip */}
        {p.is_public && (
          <div className="mb-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <Globe className="h-3 w-3" />
            Visible on public deals page
          </div>
        )}

        {/* Embed URL */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Your embed link</p>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5">
            <code className="flex-1 truncate text-xs font-mono">{redirectUrl}</code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copyRedirect}>
                  {copied
                    ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                    : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Active affiliate link */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Active affiliate link</p>
          <code className="block truncate text-xs font-mono text-muted-foreground rounded border bg-muted/30 px-2.5 py-1.5">
            {p.active_link_url ?? '— No active link —'}
          </code>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Clicks', val: formatNumber(p.total_clicks) },
            { label: 'Used',   val: formatNumber(p.total_conversions) },
            { label: 'Queue',  val: formatNumber(p.queued_links_count ?? p.queue_count) },
            { label: 'Rate',   val: p.commission ?? '—' },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-semibold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="flex-1" onClick={onViewDetail}>
            <Eye className="h-3.5 w-3.5" /> Queue
          </Button>
          <Button size="sm" variant="outline" onClick={onAddLinks}>
            <Plus className="h-3.5 w-3.5" /> Links
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
