'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Gift, Coins } from 'lucide-react'
import { type Program } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Channel {
  id: string
  label: string
  emoji: string
  utm_source: string
  utm_medium: string
  shareUrl?: (url: string, msg: string) => string
}

const CHANNELS: Channel[] = [
  {
    id: 'blog',
    label: 'Blog / SEO',
    emoji: '✍️',
    utm_source: 'blog',
    utm_medium: 'article',
  },
  {
    id: 'email',
    label: 'Email',
    emoji: '📧',
    utm_source: 'newsletter',
    utm_medium: 'email',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    emoji: '▶️',
    utm_source: 'youtube',
    utm_medium: 'video',
  },
  {
    id: 'discord',
    label: 'Discord',
    emoji: '💬',
    utm_source: 'discord',
    utm_medium: 'community',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    emoji: '𝕏',
    utm_source: 'twitter',
    utm_medium: 'social',
    shareUrl: (url, msg) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    emoji: '📱',
    utm_source: 'whatsapp',
    utm_medium: 'messaging',
    shareUrl: (url, msg) =>
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    emoji: '💼',
    utm_source: 'linkedin',
    utm_medium: 'social',
    shareUrl: (url, _msg) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
]

function buildUtmUrl(baseUrl: string, source: string, medium: string, campaign: string, content: string): string {
  const u = new URL(baseUrl)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', medium)
  u.searchParams.set('utm_campaign', campaign)
  if (content) u.searchParams.set('utm_content', content)
  return u.toString()
}

function buildMessage(channelId: string, program: Program, url: string): string {
  const name    = program.name
  const benefit = program.referral_benefit ?? ''
  const comm    = program.commission ? `Commission: ${program.commission}` : ''

  switch (channelId) {
    case 'blog':
      return `[Get ${name} →](${url})${benefit ? ` — ${benefit}` : ''}`

    case 'email':
      return [
        `Subject: ${name} — exclusive deal`,
        '',
        `Hey,`,
        '',
        `I wanted to share a deal I use: **${name}**.`,
        benefit ? `\nYou'll get: ${benefit}` : '',
        '',
        `Get it here: ${url}`,
        '',
        'Cheers,',
        'Dinesh',
      ].filter(l => l !== undefined).join('\n')

    case 'youtube':
      return [
        `🔗 ${name}: ${url}`,
        benefit ? `Visitor gets: ${benefit}` : '',
        comm,
      ].filter(Boolean).join('\n')

    case 'discord':
      return [
        `🔗 **${name}**`,
        benefit,
        comm,
        '',
        url,
      ].filter(Boolean).join('\n')

    case 'twitter':
      const tweet = [benefit ? `${benefit} →` : name, url].join(' ')
      return tweet.length > 270 ? `${name} ${url}` : tweet

    case 'whatsapp':
      return [
        `Hey! Check out this deal — ${name}`,
        benefit ? `You'll get: ${benefit}` : '',
        url,
      ].filter(Boolean).join('\n')

    case 'linkedin':
      return [
        `I've been using ${name} and highly recommend it.`,
        benefit ? `Signing up gives you: ${benefit}` : '',
        '',
        url,
      ].filter(Boolean).join('\n')

    default:
      return url
  }
}

interface Props {
  open: boolean
  program: Program
  onClose: () => void
}

export function UtmShareModal({ open, program, onClose }: Props) {
  const [channel, setChannel]   = useState<Channel>(CHANNELS[0])
  const [campaign, setCampaign] = useState(program.slug)
  const [content, setContent]   = useState('')
  const [copiedUrl, setCopiedUrl]   = useState(false)
  const [copiedMsg, setCopiedMsg]   = useState(false)

  const utmUrl = buildUtmUrl(
    program.embed_url,
    channel.utm_source,
    channel.utm_medium,
    campaign || program.slug,
    content,
  )
  const message = buildMessage(channel.id, program, utmUrl)

  function copy(text: string, which: 'url' | 'msg') {
    navigator.clipboard.writeText(text)
    if (which === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 1500) }
    else                 { setCopiedMsg(true); setTimeout(() => setCopiedMsg(false), 1500) }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{program.icon}</span> Share {program.name}
          </DialogTitle>
        </DialogHeader>

        {/* Double-sided reward summary */}
        {(program.commission || program.referral_benefit) && (
          <div className="grid gap-2" style={{ gridTemplateColumns: program.commission && program.referral_benefit ? '1fr 1fr' : '1fr' }}>
            {program.commission && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                style={{ background: (program.color ?? '#f97316') + '15' }}
              >
                <Coins className="h-4 w-4 mt-0.5 shrink-0" style={{ color: program.color ?? '#f97316' }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: program.color ?? '#f97316' }}>
                    You earn
                  </p>
                  <p className="text-sm font-bold leading-tight mt-0.5 truncate">{program.commission}</p>
                </div>
              </div>
            )}
            {program.referral_benefit && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                style={{ background: (program.color ?? '#f97316') + '10' }}
              >
                <Gift className="h-4 w-4 mt-0.5 shrink-0" style={{ color: program.color ?? '#f97316' }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: program.color ?? '#f97316' }}>
                    They get
                  </p>
                  <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">{program.referral_benefit}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Channel picker */}
        <div className="space-y-2">
          <Label>Channel</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setChannel(ch)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                  channel.id === ch.id
                    ? 'border-primary bg-primary/8 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className="text-lg leading-none">{ch.emoji}</span>
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* UTM params */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="utm-campaign">Campaign</Label>
            <Input
              id="utm-campaign"
              value={campaign}
              onChange={e => setCampaign(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder={program.slug}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="utm-content">Content <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="utm-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="e.g. sidebar-link"
            />
          </div>
        </div>

        {/* Generated URL */}
        <div className="space-y-1.5">
          <Label>Your link with UTM</Label>
          <div className="flex gap-2">
            <Input readOnly value={utmUrl} className="font-mono text-xs" />
            <Button variant="outline" size="icon" className="shrink-0" onClick={() => copy(utmUrl, 'url')}>
              {copiedUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {channel.shareUrl && (
            <a
              href={channel.shareUrl(utmUrl, message)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              Open {channel.label} share
            </a>
          )}
        </div>

        {/* Message template */}
        <div className="space-y-1.5">
          <Label>
            {channel.label} message template{' '}
            <span className="text-muted-foreground font-normal">(edit freely)</span>
          </Label>
          <Textarea
            rows={6}
            value={message}
            readOnly
            className="font-mono text-xs resize-none"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => copy(message, 'msg')}
          >
            {copiedMsg ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedMsg ? 'Copied!' : 'Copy message'}
          </Button>
        </div>

        {/* UTM hint */}
        <p className="text-[11px] text-muted-foreground rounded-lg border bg-muted/30 px-3 py-2">
          UTM parameters let you see in your analytics which channel drove each click — so you know where to double down.
        </p>
      </DialogContent>
    </Dialog>
  )
}
