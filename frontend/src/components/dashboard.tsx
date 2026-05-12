'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, AlertTriangle, AlertOctagon, Pencil } from 'lucide-react'
import {
  getPrograms, createProgram, updateProgram, deleteProgram, addLinks, getProgramTrends,
} from '@/lib/api'
import { type Program, type ProgramFormData, type ProgramTrend } from '@/types'
import { formatNumber } from '@/lib/utils'
import { ProgramCard } from '@/components/program-card'
import { ProgramModal } from '@/components/program-modal'
import { AddLinksModal } from '@/components/add-links-modal'
import { ParentOverviewModal } from '@/components/parent-overview-modal'
import { UtmShareModal } from '@/components/utm-share-modal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const router = useRouter()
  const [programs, setPrograms]             = useState<Program[]>([])
  const [sparklines, setSparklines]         = useState<Map<number, number[]>>(new Map())
  const [loading, setLoading]               = useState(true)
  const [showModal, setShowModal]           = useState(false)
  const [editTarget, setEditTarget]         = useState<Program | null>(null)
  const [addLinksTarget, setAddLinksTarget] = useState<Program | null>(null)
  const [shareTarget, setShareTarget]       = useState<Program | null>(null)
  const [createParentId, setCreateParentId] = useState<number | null>(null)
  const [viewingParent, setViewingParent]   = useState<Program | null>(null)

  const load = useCallback(async () => {
    try {
      const [progs, trends] = await Promise.all([getPrograms(), getProgramTrends(7)])
      setPrograms(progs)
      setSparklines(buildSparklines(trends, 7))
    } catch {
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  function buildSparklines(trends: ProgramTrend[], days: number): Map<number, number[]> {
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      return d.toISOString().slice(0, 10)
    })
    const byProgram = new Map<number, Map<string, number>>()
    for (const t of trends) {
      if (!byProgram.has(t.program_id)) byProgram.set(t.program_id, new Map())
      byProgram.get(t.program_id)!.set(t.date, t.clicks)
    }
    const result = new Map<number, number[]>()
    for (const [id, dateMap] of byProgram) {
      result.set(id, dates.map(d => dateMap.get(d) ?? 0))
    }
    return result
  }

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  async function handleSave(data: ProgramFormData, id?: number) {
    try {
      if (id) {
        await updateProgram(id, data)
        toast.success('Program updated')
      } else {
        await createProgram(data)
        toast.success('Program created')
      }
      closeModal()
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Save failed')
      throw e
    }
  }

  async function handleTogglePublic(program: Program) {
    const nextPublic = !program.is_public
    // Flip immediately so the icon responds on click without waiting for the server
    setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, is_public: nextPublic } : p))
    try {
      await updateProgram(program.id, { is_public: nextPublic })
      toast.success(nextPublic ? `${program.name} now visible publicly` : `${program.name} hidden from public`)
      load()
    } catch {
      // Revert the optimistic flip on failure
      setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, is_public: program.is_public } : p))
      toast.error('Failed to update visibility')
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteProgram(id)
      toast.success('Program deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  async function handleAddLinks(programId: number, links: string[]) {
    const res = await addLinks(programId, links)
    toast.success(res.message)
    setAddLinksTarget(null)
    load()
  }

  function openCreate(parentId: number | null = null) {
    setEditTarget(null)
    setCreateParentId(parentId)
    setShowModal(true)
  }

  function openEdit(program: Program) {
    setEditTarget(program)
    setCreateParentId(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditTarget(null)
    setCreateParentId(null)
  }

  // Hierarchy grouping — max 1 level deep
  const parentIdSet = new Set(
    programs.map(p => p.parent_id).filter((id): id is number => id !== null)
  )
  const parentPrograms     = programs.filter(p => p.parent_id === null && parentIdSet.has(p.id))
  const standalonePrograms = programs.filter(p => p.parent_id === null && !parentIdSet.has(p.id))
  const childrenByParent   = new Map<number, Program[]>()
  programs.filter(p => p.parent_id !== null).forEach(c => {
    if (!childrenByParent.has(c.parent_id!)) childrenByParent.set(c.parent_id!, [])
    childrenByParent.get(c.parent_id!)!.push(c)
  })

  const alerts = programs.filter(p => p.is_empty || p.is_queue_low)
  const totals = {
    programs: programs.length,
    clicks:   programs.reduce((s, p) => s + p.total_clicks, 0),
    used:     programs.reduce((s, p) => s + p.total_conversions, 0),
    queue:    programs.reduce((s, p) => s + (p.queued_links_count ?? p.queue_count), 0),
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your referral programs and link queues</p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4" /> New Program
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Programs', val: totals.programs },
          { label: 'Total Clicks',   val: formatNumber(totals.clicks) },
          { label: 'Links Used',     val: formatNumber(totals.used) },
          { label: 'Queue Total',    val: formatNumber(totals.queue) },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-2xl font-bold">{val}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Queue alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(p => (
            <Alert key={p.id} variant={p.is_empty ? 'destructive' : 'warning'}>
              {p.is_empty ? <AlertOctagon className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>
                {p.name}: {p.is_empty ? 'Queue EMPTY' : `Only ${p.queued_links_count ?? p.queue_count} link(s) left`}
              </AlertTitle>
              <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {p.is_empty
                    ? 'Visitors are not getting referral links — you are losing commissions!'
                    : 'Add more links now before the queue runs out.'}
                </span>
                <Button
                  size="sm"
                  variant={p.is_empty ? 'destructive' : 'outline'}
                  className="self-start shrink-0 sm:ml-4"
                  onClick={() => setAddLinksTarget(p)}
                >
                  + Add Links
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Programs — hierarchy view */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🔗</span>
          <h2 className="text-lg font-semibold">No programs yet</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Add your first referral program to get started</p>
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> Add Program
          </Button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Parent groups ─────────────────────────────────────────── */}
          {parentPrograms.map(parent => {
            const children    = childrenByParent.get(parent.id) ?? []
            const groupClicks = children.reduce((s, c) => s + c.total_clicks, 0)
            const groupAlert  = children.some(c => c.is_empty || c.is_queue_low)

            return (
              <div key={parent.id} className="space-y-3">

                {/* Group header */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-xl shrink-0"
                    style={{ background: (parent.color ?? '#f97316') + '22' }}
                  >
                    {parent.icon || '🔗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingParent(parent)}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                      >
                        {parent.name}
                      </button>
                      {groupAlert && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {parent.category} · {children.length} sub-program{children.length !== 1 ? 's' : ''} · {formatNumber(groupClicks)} clicks
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(parent)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openCreate(parent.id)}>
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>

                {/* Children grid */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-3 sm:pl-5 rtl:pl-0 rtl:pr-3 rtl:sm:pr-5 border-l-2 rtl:border-l-0 rtl:border-r-2"
                  style={{ borderColor: (parent.color ?? '#f97316') + '50' }}
                >
                  {children.map(p => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      sparkline={sparklines.get(p.id)}
                      onEdit={() => openEdit(p)}
                      onDelete={() => handleDelete(p.id, p.name)}
                      onAddLinks={() => setAddLinksTarget(p)}
                      onViewDetail={() => router.push(`/programs/${p.id}`)}
                      onTogglePublic={() => handleTogglePublic(p)}
                      onShare={() => setShareTarget(p)}
                    />
                  ))}
                  <button
                    onClick={() => openCreate(parent.id)}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors min-h-[160px]"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add to {parent.name}</span>
                  </button>
                </div>
              </div>
            )
          })}

          {/* ── Standalone programs ───────────────────────────────────── */}
          <div className="space-y-3">
            {parentPrograms.length > 0 && (
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Other Programs</p>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {standalonePrograms.map(p => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  onEdit={() => openEdit(p)}
                  onDelete={() => handleDelete(p.id, p.name)}
                  onAddLinks={() => setAddLinksTarget(p)}
                  onViewDetail={() => router.push(`/programs/${p.id}`)}
                  onTogglePublic={() => handleTogglePublic(p)}
                  onShare={() => setShareTarget(p)}
                />
              ))}
              <button
                onClick={() => openCreate()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors min-h-[220px]"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Program</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {viewingParent && (
        <ParentOverviewModal
          parent={viewingParent}
          children={childrenByParent.get(viewingParent.id) ?? []}
          open={!!viewingParent}
          onClose={() => setViewingParent(null)}
          onEditParent={() => {
            const p = viewingParent
            setViewingParent(null)
            openEdit(p)
          }}
          onAddChild={() => {
            const p = viewingParent
            setViewingParent(null)
            openCreate(p.id)
          }}
          onAddLinks={child => {
            setViewingParent(null)
            setAddLinksTarget(child)
          }}
        />
      )}

      <ProgramModal
        open={showModal}
        program={editTarget}
        programs={programs}
        defaultParentId={createParentId}
        onSave={handleSave}
        onClose={closeModal}
      />

      {addLinksTarget && (
        <AddLinksModal
          open={!!addLinksTarget}
          program={addLinksTarget}
          onAdd={links => handleAddLinks(addLinksTarget.id, links)}
          onClose={() => setAddLinksTarget(null)}
        />
      )}

      {shareTarget && (
        <UtmShareModal
          open={!!shareTarget}
          program={shareTarget}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  )
}
