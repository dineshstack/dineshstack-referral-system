'use client'

import { useEffect, useState } from 'react'
import { type Program, type ProgramFormData, type LinkType, type ProgramPrefix } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const CATEGORIES = ['Hosting', 'Domain', 'VPN', 'SaaS Tool', 'Design', 'SEO Tool', 'Email', 'Finance', 'Other']
const COLORS      = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444']

const PREFIX_OPTIONS: { value: ProgramPrefix; label: string; example: string }[] = [
  { value: 'tools', label: '/tools/',  example: 'dineshstack.com/tools/hosting' },
  { value: 'deals', label: '/deals/',  example: 'dineshstack.com/deals/vpn' },
  { value: 'get',   label: '/get/',    example: 'dineshstack.com/get/server' },
  { value: 'start', label: '/start/',  example: 'dineshstack.com/start/hosting' },
  { value: 'root',  label: '/ (root)', example: 'dineshstack.com/hosting' },
]

const EMPTY_FORM: ProgramFormData = {
  name: '', slug: '', category: 'Hosting', icon: '🔗',
  color: COLORS[0], commission: '', link_type: 'onetime',
  prefix: 'tools',
  affiliate_dashboard_url: '', low_queue_threshold: 3,
  critical_queue_threshold: 1, initial_links: '',
}

interface ProgramModalProps {
  open: boolean
  program: Program | null
  onSave: (data: ProgramFormData, id?: number) => Promise<void>
  onClose: () => void
}

export function ProgramModal({ open, program, onSave, onClose }: ProgramModalProps) {
  const editing = !!program
  const [form, setForm]     = useState<ProgramFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormData, string>>>({})

  useEffect(() => {
    if (program) {
      setForm({
        name:                    program.name,
        slug:                    program.slug,
        category:                program.category,
        icon:                    program.icon,
        color:                   program.color,
        commission:              program.commission ?? '',
        link_type:               program.link_type,
        prefix:                  program.prefix ?? 'tools',
        affiliate_dashboard_url: program.affiliate_dashboard_url ?? '',
        low_queue_threshold:      program.low_queue_threshold,
        critical_queue_threshold: program.critical_queue_threshold,
        initial_links:            '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [program, open])

  function set<K extends keyof ProgramFormData>(field: K, val: ProgramFormData[K]) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function handleNameChange(val: string) {
    set('name', val)
    if (!editing) {
      set('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  async function handleSubmit() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.slug.trim()) errs.slug = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const payload: ProgramFormData = { ...form }
      if (!payload.initial_links?.trim()) delete payload.initial_links
      await onSave(payload, program?.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Program' : 'New Program'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {/* Name */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">Program Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Hostinger"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="hosting"
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>

          {/* URL Prefix */}
          <div className="space-y-1.5">
            <Label>URL Prefix</Label>
            <Select value={form.prefix} onValueChange={v => set('prefix', v as ProgramPrefix)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PREFIX_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="font-mono">{opt.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{opt.example}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Embed URL preview */}
          {form.slug && (
            <div className="col-span-2 rounded-lg border bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-1">Your embed URL</p>
              <code className="text-sm font-mono">
                {(() => {
                  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8000'
                  return form.prefix === 'root'
                    ? `${base}/${form.slug}`
                    : `${base}/${form.prefix}/${form.slug}`
                })()}
              </code>
            </div>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Commission */}
          <div className="space-y-1.5">
            <Label htmlFor="commission">Commission</Label>
            <Input
              id="commission"
              value={form.commission}
              onChange={e => set('commission', e.target.value)}
              placeholder="e.g. 20% or $50 flat"
            />
          </div>

          {/* Link Type */}
          <div className="space-y-1.5">
            <Label>Link Type</Label>
            <Select value={form.link_type} onValueChange={v => set('link_type', v as LinkType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="onetime">One-Time (expires after use)</SelectItem>
                <SelectItem value="permanent">Permanent (never expires)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input
              id="icon"
              value={form.icon}
              onChange={e => set('icon', e.target.value)}
              placeholder="🔗"
              maxLength={4}
            />
          </div>

          {/* Low queue threshold */}
          <div className="space-y-1.5">
            <Label htmlFor="threshold">Low Queue Alert (links remaining)</Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              max={20}
              value={form.low_queue_threshold}
              onChange={e => set('low_queue_threshold', parseInt(e.target.value))}
            />
          </div>

          {/* Critical queue threshold */}
          <div className="space-y-1.5">
            <Label htmlFor="critical-threshold">Critical Alert + Discord (links remaining)</Label>
            <Input
              id="critical-threshold"
              type="number"
              min={1}
              max={10}
              value={form.critical_queue_threshold}
              onChange={e => set('critical_queue_threshold', parseInt(e.target.value))}
            />
          </div>

          {/* Affiliate URL */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="dashboard-url">Affiliate Dashboard URL</Label>
            <Input
              id="dashboard-url"
              value={form.affiliate_dashboard_url}
              onChange={e => set('affiliate_dashboard_url', e.target.value)}
              placeholder="https://hostinger.com/affiliates"
            />
          </div>

          {/* Color picker */}
          <div className="col-span-2 space-y-1.5">
            <Label>Card Color</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className="h-7 w-7 rounded-full ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : undefined,
                    outlineOffset: form.color === c ? '2px' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Initial links (create only) */}
          {!editing && (
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="initial-links">
                Initial Links <span className="text-muted-foreground font-normal">(one per line or comma-separated, optional)</span>
              </Label>
              <Textarea
                id="initial-links"
                rows={4}
                value={form.initial_links ?? ''}
                onChange={e => set('initial_links', e.target.value)}
                placeholder={'https://hostinger.com?ref=CODE_001\nhttps://hostinger.com?ref=CODE_002\n\nor comma-separated:\nhttps://hostinger.com?ref=001, https://hostinger.com?ref=002'}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Program'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
