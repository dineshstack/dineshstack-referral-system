'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, AlertTriangle, AlertOctagon } from 'lucide-react'
import {
  getPrograms, createProgram, updateProgram, deleteProgram, addLinks,
} from '@/lib/api'
import { type Program, type ProgramFormData } from '@/types'
import { formatNumber } from '@/lib/utils'
import { ProgramCard } from '@/components/program-card'
import { ProgramModal } from '@/components/program-modal'
import { AddLinksModal } from '@/components/add-links-modal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const router = useRouter()
  const [programs, setPrograms]         = useState<Program[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Program | null>(null)
  const [addLinksTarget, setAddLinksTarget] = useState<Program | null>(null)

  const load = useCallback(async () => {
    try {
      setPrograms(await getPrograms())
    } catch {
      toast.error('Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  // Auto-refresh every 30s to catch queue changes
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
      setShowModal(false)
      setEditTarget(null)
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Save failed')
      throw e
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

  const alerts = programs.filter(p => p.is_empty || p.is_queue_low)
  const totals = {
    programs:    programs.length,
    clicks:      programs.reduce((s, p) => s + p.total_clicks, 0),
    used:        programs.reduce((s, p) => s + p.total_conversions, 0),
    queue:       programs.reduce((s, p) => s + (p.queued_links_count ?? p.queue_count), 0),
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your referral programs and link queues</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setShowModal(true) }}>
          <Plus className="h-4 w-4" /> New Program
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Programs',  val: totals.programs },
          { label: 'Total Clicks',    val: formatNumber(totals.clicks) },
          { label: 'Links Used',      val: formatNumber(totals.used) },
          { label: 'Queue Total',     val: formatNumber(totals.queue) },
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
              {p.is_empty
                ? <AlertOctagon className="h-4 w-4" />
                : <AlertTriangle className="h-4 w-4" />
              }
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

      {/* Programs grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🔗</span>
          <h2 className="text-lg font-semibold">No programs yet</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">Add your first referral program to get started</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Add Program
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(p => (
            <ProgramCard
              key={p.id}
              program={p}
              onEdit={() => { setEditTarget(p); setShowModal(true) }}
              onDelete={() => handleDelete(p.id, p.name)}
              onAddLinks={() => setAddLinksTarget(p)}
              onViewDetail={() => router.push(`/programs/${p.id}`)}
            />
          ))}
          {/* Add card placeholder */}
          <button
            onClick={() => { setEditTarget(null); setShowModal(true) }}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors min-h-[220px]"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Add Program</span>
          </button>
        </div>
      )}

      <ProgramModal
        open={showModal}
        program={editTarget}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditTarget(null) }}
      />

      {addLinksTarget && (
        <AddLinksModal
          open={!!addLinksTarget}
          program={addLinksTarget}
          onAdd={links => handleAddLinks(addLinksTarget.id, links)}
          onClose={() => setAddLinksTarget(null)}
        />
      )}
    </div>
  )
}
