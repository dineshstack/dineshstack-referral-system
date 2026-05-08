import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n)
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function buildRedirectUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8000'
  return `${base}/go/${slug}`
}

export function buildEmbedUrl(slug: string, prefix: import('@/types').ProgramPrefix): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:8000'
  return prefix === 'root' ? `${base}/${slug}` : `${base}/${prefix}/${slug}`
}
