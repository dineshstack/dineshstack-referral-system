export type LinkType      = 'onetime' | 'permanent'
export type LinkStatus    = 'active' | 'queued' | 'used' | 'expired'
export type ProgramPrefix = 'tools' | 'deals' | 'get' | 'start' | 'root'

export interface Program {
  id: number
  parent_id: number | null
  name: string
  slug: string
  category: string
  icon: string
  color: string
  commission: string | null
  link_type: LinkType
  prefix: ProgramPrefix
  embed_url: string
  affiliate_dashboard_url: string | null
  low_queue_threshold: number
  critical_queue_threshold: number
  is_active: boolean
  is_public: boolean
  total_clicks: number
  total_conversions: number
  total_earnings: number
  // Computed
  queue_count: number
  active_link_url: string | null
  is_queue_low: boolean
  is_empty: boolean
  queued_links_count?: number
  created_at: string
  updated_at: string
}

export type HealthStatus = 'unchecked' | 'ok' | 'dead'

export interface LinkedProgram {
  id: number
  name: string
  icon: string
  color: string
  slug: string
}

export interface ReferralLink {
  id: number
  program_id: number
  program?: LinkedProgram
  url: string
  status: LinkStatus
  position: number
  activated_at: string | null
  used_at: string | null
  expires_at: string | null
  notes: string | null
  health_status: HealthStatus
  health_checked_at: string | null
  created_at: string
}

export interface ClickEvent {
  id: number
  ip_address: string | null
  referer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country: string | null
  link_was_rotated: boolean
  is_bot: boolean
  created_at: string
}

export interface ClicksPerDay {
  date: string
  clicks: number
  bot_clicks: number
}

export interface TopReferer {
  referer: string | null
  count: number
}

export interface UtmSource {
  source: string
  count: number
}

export interface TopCountry {
  country: string
  count: number
}

export interface AnalyticsTotals {
  clicks: number
  bot_clicks: number
  real_clicks: number
  conversions: number
  queue_total: number
  earnings: number
}

export interface AnalyticsData {
  programs: Program[]
  clicks_per_day: ClicksPerDay[]
  top_referers: TopReferer[]
  utm_sources: UtmSource[]
  top_countries: TopCountry[]
  totals: AnalyticsTotals
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PostbackEvent {
  id: number
  program_id: number
  event_type: string
  amount: number | null
  currency: string
  transaction_id: string | null
  created_at: string
}

export interface ProgramFormData {
  name: string
  slug: string
  category: string
  icon: string
  color: string
  commission: string
  link_type: LinkType
  prefix: ProgramPrefix
  affiliate_dashboard_url: string
  low_queue_threshold: number
  critical_queue_threshold: number
  initial_links?: string
  parent_id?: number | null
  // Flags — not shown in the create/edit form but sent via patch
  is_active?: boolean
  is_public?: boolean
}