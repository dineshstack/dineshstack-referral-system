'use client'

import { useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { type Program } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddLinksModalProps {
  open: boolean
  program: Program
  onAdd: (links: string[]) => Promise<void>
  onClose: () => void
}

export function AddLinksModal({ open, program, onAdd, onClose }: AddLinksModalProps) {
  const [raw, setRaw]       = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Accept newline-separated OR comma-separated URLs
  const lines = raw.split(/[\n,]+/).map(l => l.trim()).filter(Boolean)

  function handleClose() {
    setRaw('')
    setError('')
    onClose()
  }

  async function handleSubmit() {
    if (lines.length === 0) { setError('Paste at least one link.'); return }
    const invalid = lines.filter(l => !l.startsWith('http'))
    if (invalid.length) { setError(`${invalid.length} line(s) don't look like valid URLs.`); return }

    setSaving(true)
    try {
      await onAdd(lines)
      setRaw('')
    } catch {
      // parent handles error toasts
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Links — {program.name}</DialogTitle>
          <DialogDescription>
            Paste your affiliate links below, one per line.
          </DialogDescription>
        </DialogHeader>

        {/* Step guide */}
        <div className="rounded-lg border bg-muted/40 p-3.5 space-y-1 text-sm">
          <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">How to get your links</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>
              Open your{' '}
              <a
                href={program.affiliate_dashboard_url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-primary underline-offset-4 hover:underline"
              >
                Affiliate Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Go to <strong>My Links</strong> or <strong>Create Link</strong></li>
            <li>Generate 5–10 new unique referral links</li>
            <li>Copy all and paste below, one per line</li>
          </ol>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="links-input">
            Referral Links{' '}
            <span className="text-muted-foreground font-normal">(one per line or comma-separated)</span>
          </Label>
          <Textarea
            id="links-input"
            rows={8}
            placeholder={`https://${program.slug}.com?ref=YOURCODE_001\nhttps://${program.slug}.com?ref=YOURCODE_002`}
            value={raw}
            onChange={e => { setRaw(e.target.value); setError('') }}
            className="font-mono text-xs"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          {lines.length > 0 && !error && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ {lines.length} link{lines.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The first link becomes <strong>active immediately</strong>. The rest queue up and rotate in automatically
            as each one gets used.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || lines.length === 0}>
            {saving ? 'Adding…' : `Add ${lines.length > 0 ? lines.length + ' ' : ''}Link${lines.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
