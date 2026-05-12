import axios from 'axios'
import type {
  AnalyticsData,
  Program,
  ProgramFormData,
  ProgramTrend,
  PublicProgram,
  ReferralLink,
} from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  // withCredentials: false,
})

// Attach Sanctum token from env (set after php artisan db:seed)
api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? (localStorage.getItem('api_token') ?? process.env.NEXT_PUBLIC_API_TOKEN)
      : process.env.NEXT_PUBLIC_API_TOKEN

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string } }> {
  const res = await api.post('/api/login', { email, password })
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/api/logout')
}

// ── Programs ──────────────────────────────────────────────────────────────────

export async function getPrograms(): Promise<Program[]> {
  const res = await api.get<{ data: Program[] }>('/api/programs')
  return res.data.data
}

export async function getProgram(
  id: number,
): Promise<{ data: Program; recent_clicks: import('@/types').ClickEvent[] }> {
  const res = await api.get(`/api/programs/${id}`)
  return res.data
}

export async function createProgram(data: ProgramFormData): Promise<Program> {
  const payload = {
    ...data,
    initial_links: data.initial_links
      ? data.initial_links.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : undefined,
  }
  const res = await api.post<{ data: Program }>('/api/programs', payload)
  return res.data.data
}

export async function updateProgram(
  id: number,
  data: Partial<ProgramFormData>,
): Promise<Program> {
  const res = await api.put<{ data: Program }>(`/api/programs/${id}`, data)
  return res.data.data
}

export async function deleteProgram(id: number): Promise<void> {
  await api.delete(`/api/programs/${id}`)
}

// ── Links ─────────────────────────────────────────────────────────────────────

export async function getLinks(programId: number): Promise<ReferralLink[]> {
  const res = await api.get<{ data: ReferralLink[] }>(`/api/programs/${programId}/links`)
  return res.data.data
}

export async function addLinks(
  programId: number,
  links: string[],
): Promise<{ message: string; queue_count: number; active_link: string | null }> {
  const res = await api.post(`/api/programs/${programId}/links`, { links })
  return res.data
}

export async function removeLink(
  programId: number,
  linkId: number,
): Promise<{ message: string; queue_count: number }> {
  const res = await api.delete(`/api/programs/${programId}/links/${linkId}`)
  return res.data
}

export async function requeueLink(
  programId: number,
  linkId: number,
): Promise<{ message: string; queue_count: number }> {
  const res = await api.patch(`/api/programs/${programId}/links/${linkId}/requeue`)
  return res.data
}

// ── All links (paginated) ─────────────────────────────────────────────────────

interface LinksFilter {
  program_id?: number
  status?: string
  health?: string
  search?: string
  page?: number
  per_page?: number
  sort?: string
  dir?: 'asc' | 'desc'
}

export async function getAllLinks(
  filters: LinksFilter = {},
): Promise<{ data: import('@/types').ReferralLink[]; meta: import('@/types').PaginatedMeta }> {
  const res = await api.get('/api/links', { params: filters })
  return res.data
}

// ── Program click trends (sparklines) ─────────────────────────────────────────

export async function getProgramTrends(days = 7): Promise<ProgramTrend[]> {
  const res = await api.get<{ data: ProgramTrend[] }>('/api/program-trends', { params: { days } })
  return res.data.data
}

// ── Public (no auth) ──────────────────────────────────────────────────────────

export async function getPublicPrograms(): Promise<PublicProgram[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const res = await fetch(`${base}/api/public/programs`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to load programs')
  const json = await res.json()
  return json.data
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getAnalytics(days = 30): Promise<AnalyticsData> {
  const res = await api.get<AnalyticsData>('/api/analytics', { params: { days } })
  return res.data
}

export default api
