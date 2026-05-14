'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowUp, ArrowRight, ExternalLink, X,
  Mail, MapPin, Calendar, Server, Wrench, Layers,
  ChevronRight, Globe, Moon, Sun, Terminal, Zap,
  Users, BookOpen, Copy, Check, Coffee, Award,
  Home, Quote, MessageCircle,
} from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { getPublicPrograms } from '@/lib/api'
import { type PublicProgram } from '@/types'
import { Badge } from '@/components/ui/badge'

/* Inline SVG icons not in this lucide-react version */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PROFILE DATA                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const PROFILE = {
  name:     'Dinesh',
  initials: 'D',
  title:    'Tech Lead & Full-Stack Developer',
  tagline:  'Building production-grade systems since 2014',
  bio:      "I'm a Tech Lead and Full-Stack Developer with 10+ years of experience architecting scalable web applications, leading engineering teams, and shipping products used by thousands of users. I specialize in Laravel and Next.js, and I share what I learn at dineshstack.com.",
  location: 'United Arab Emirates',
  email:    'info@dineshstack.com',
  blog:     'https://dineshstack.com',
  github:   'https://github.com/dineshstack',
  linkedin: 'https://linkedin.com/in/dineshstack',
  twitter:  'https://twitter.com/dineshstack',
  whatsapp: 'https://wa.me/971000000000?text=Hi+Dinesh%2C+I%27d+like+to+discuss+a+project',
}

const ROLES = [
  'Tech Lead',
  'Full-Stack Developer',
  'Laravel Architect',
  'Next.js Builder',
  'API Designer',
  'Team Mentor',
]

const STATS = [
  { value: 10, suffix: '+',  labelKey: 'portfolio.stat_years',    icon: Coffee },
  { value: 50, suffix: '+',  labelKey: 'portfolio.stat_projects',  icon: Award  },
  { value: 15, suffix: 'K+', labelKey: 'portfolio.stat_readers',   icon: BookOpen },
  { value: 5,  suffix: '+',  labelKey: 'portfolio.stat_lead',      icon: Users  },
]

const SKILLS: Record<string, { items: string[]; icon: React.ElementType; color: string }> = {
  Backend: {
    icon: Server,
    color: 'from-violet-500/20 to-indigo-500/10',
    items: ['Laravel 11', 'PHP 8.3', 'Node.js', 'REST API', 'MySQL', 'PostgreSQL', 'Redis', 'Sanctum', 'Queue/Jobs'],
  },
  Frontend: {
    icon: Layers,
    color: 'from-blue-500/20 to-cyan-500/10',
    items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'shadcn/ui', 'Zustand', 'React Query'],
  },
  DevOps: {
    icon: Terminal,
    color: 'from-emerald-500/20 to-teal-500/10',
    items: ['Docker', 'Linux', 'Nginx', 'GitHub Actions', 'CI/CD', 'VPS Hosting', 'Cloudflare'],
  },
  Tools: {
    icon: Wrench,
    color: 'from-amber-500/20 to-orange-500/10',
    items: ['Git', 'Postman', 'Figma', 'VS Code', 'TablePlus', 'Slack', 'Linear', 'Sentry'],
  },
}

const EXPERIENCE = [
  {
    company:     'Kief Studio',
    role:        'Tech Lead',
    period:      '2020 – Present',
    location:    'UAE',
    current:     true,
    description: 'Lead a cross-functional engineering team building enterprise web applications. Define architecture, run code reviews, establish engineering standards, and mentor junior developers. Reduced deployment time by 70% by introducing Docker + GitHub Actions CI/CD pipelines.',
    stack:       ['Laravel', 'Next.js', 'TypeScript', 'Docker', 'MySQL', 'Redis'],
    color:       '#4f46e5',
  },
  {
    company:     'Orions360',
    role:        'Senior Full-Stack Developer',
    period:      '2017 – 2020',
    location:    'UAE',
    current:     false,
    description: 'Developed and maintained multiple client-facing web platforms across fintech and e-commerce domains. Built REST APIs consumed by 3rd-party mobile apps and integrated multiple payment gateways.',
    stack:       ['Laravel', 'Vue.js', 'MySQL', 'AWS S3'],
    color:       '#0ea5e9',
  },
  {
    company:     'Freelance',
    role:        'Full-Stack Web Developer',
    period:      '2014 – 2017',
    location:    'Remote',
    current:     false,
    description: 'Built custom CMS platforms, e-commerce sites, and business dashboards for clients across the Middle East and South Asia. Delivered 30+ projects end-to-end as a solo developer.',
    stack:       ['PHP', 'Laravel', 'jQuery', 'Bootstrap', 'MySQL'],
    color:       '#8b5cf6',
  },
]

const PROJECTS = [
  {
    name:        'DineshStack Referral System',
    tag:         'SaaS',
    description: 'A full-stack affiliate link management platform with real-time analytics, smart queue rotation, payout tracking, public deals landing page, and multi-language support (EN/AR).',
    stack:       ['Laravel 11', 'Next.js 16', 'TypeScript', 'MySQL', 'Tailwind CSS v4'],
    url:         'https://dineshstack.com/deals',
    github:      'https://github.com/dineshstack',
    featured:    true,
    year:        2024,
    color:       '#4f46e5',
  },
  {
    name:        'DineshStack Blog',
    tag:         'Content',
    description: 'A technical blog reaching 15K+ monthly readers. Covers Laravel, Next.js, DevOps, and software architecture. Full SEO optimization, dark mode, and Arabic RTL support.',
    stack:       ['Next.js', 'MDX', 'Tailwind CSS', 'Vercel'],
    url:         'https://dineshstack.com',
    featured:    true,
    year:        2021,
    color:       '#0ea5e9',
  },
  {
    name:        'Multi-Tenant SaaS Platform',
    tag:         'Enterprise',
    description: 'White-label SaaS platform serving multiple clients from a single codebase. Team-based permissions, custom domain support, and per-tenant configuration.',
    stack:       ['Laravel', 'Vue.js', 'MySQL', 'Redis', 'Docker'],
    featured:    false,
    year:        2022,
    color:       '#8b5cf6',
  },
  {
    name:        'E-Commerce API Platform',
    tag:         'API',
    description: 'RESTful API platform powering multiple mobile and web storefronts. Handles 50K+ daily requests with Redis caching, job queues, and webhook delivery.',
    stack:       ['Laravel', 'MySQL', 'Redis', 'Sanctum', 'Stripe'],
    featured:    false,
    year:        2021,
    color:       '#22c55e',
  },
  {
    name:        'Real-Time Analytics Dashboard',
    tag:         'Dashboard',
    description: 'Internal analytics platform for tracking user behaviour, revenue trends, and system health across multiple client applications in real time.',
    stack:       ['Next.js', 'Recharts', 'Laravel', 'WebSockets'],
    featured:    false,
    year:        2023,
    color:       '#f59e0b',
  },
]

const EDUCATION = [
  {
    degree:   'Bachelor of Computer Science & Engineering',
    school:   'University',
    period:   '2010 – 2014',
    location: 'India',
    icon:     '🎓',
    note:     'Foundation in algorithms, data structures, and software engineering principles.',
  },
]

const TESTIMONIALS = [
  {
    quote:   'Dinesh consistently delivers high-quality solutions on time. His technical depth in Laravel and Next.js, combined with strong communication skills, made him invaluable on our project.',
    author:  'Project Manager',
    company: 'UAE Enterprise Client',
    initials: 'PM',
    color:   '#4f46e5',
  },
  {
    quote:   'Working with Dinesh elevated our entire engineering team. He introduced solid CI/CD practices, improved code review quality, and shipped complex features on a tight deadline.',
    author:  'CTO',
    company: 'Tech Startup, MENA',
    initials: 'CT',
    color:   '#0ea5e9',
  },
  {
    quote:   'The referral system Dinesh built for us handles thousands of daily visits without a hiccup. Clean architecture, well-documented, easy to maintain. Highly recommended.',
    author:  'Founder',
    company: 'SaaS Company, UAE',
    initials: 'FD',
    color:   '#8b5cf6',
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function toEasternArabic(n: number): string {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d])
}

/* Safe: always false on SSR, read from matchMedia on client after mount */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return reduced
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Hooks                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const sys   = window.matchMedia('(prefers-color-scheme: dark)').matches
    const on    = saved === 'dark' || (!saved && sys)
    document.documentElement.classList.toggle('dark', on)
    setDark(on)
  }, [])
  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }
  return { dark, toggle }
}

function useTypewriter(words: string[], speed = 75, pause = 2200, del = 38) {
  const reduced = useReducedMotion()
  const [idx,  setIdx]  = useState(0)
  const [text, setText] = useState(words[0])
  const [deleting, setDel] = useState(false)

  useEffect(() => {
    if (reduced) { setText(words[0]); return }
    const word = words[idx]
    if (!deleting && text === word) {
      const t = setTimeout(() => setDel(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && text === '') {
      setDel(false)
      setIdx(i => (i + 1) % words.length)
      return
    }
    const t = setTimeout(
      () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
      deleting ? del : speed,
    )
    return () => clearTimeout(t)
  }, [text, deleting, idx, words, speed, pause, del, reduced])

  return text
}

function useCounter(end: number, duration = 1600) {
  const reduced         = useReducedMotion()
  const [val, setVal]   = useState(0)
  const [on, setOn]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) { setVal(end); return }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduced, end])

  useEffect(() => {
    if (reduced || !on) return
    const step = end / (duration / 16)
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + step, end)
      setVal(Math.floor(cur))
      if (cur >= end) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [on, end, duration, reduced])

  return { val, ref }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Small shared components                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

/* CSS scroll-driven reveal — zero JS, off main thread, fixes INP.
   `animation-delay` provides stagger; `animation-timeline: view()` fires
   as the element enters the viewport. See globals.css .scroll-reveal. */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="scroll-reveal"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function SectionHeading({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-10">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
        <span className="inline-block h-px w-5 bg-primary" />
        {label}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
      {sub && <p className="mt-2 text-muted-foreground max-w-2xl">{sub}</p>}
    </div>
  )
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const announceRef = useRef<HTMLSpanElement>(null)

  function copy() {
    navigator.clipboard.writeText(PROFILE.email).then(() => {
      setCopied(true)
      if (announceRef.current) announceRef.current.textContent = 'Email copied!'
      setTimeout(() => {
        setCopied(false)
        if (announceRef.current) announceRef.current.textContent = ''
      }, 2000)
    })
  }

  return (
    <>
      <span ref={announceRef} role="status" aria-live="polite" className="sr-only" />
      <button
        onClick={copy}
        className="group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95"
      >
        <Mail className="h-4 w-4 text-primary" />
        {PROFILE.email}
        {copied
          ? <Check className="h-3.5 w-3.5 text-emerald-500" />
          : <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />}
      </button>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Stat counter card                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function StatCard({ value, suffix, labelKey, Icon }: {
  value: number; suffix: string; labelKey: string; Icon: React.ElementType
}) {
  const { val, ref }  = useCounter(value)
  const { t, locale } = useLocale()
  const label         = t(labelKey)
  const display       = locale === 'ar' ? toEasternArabic(val) : String(val)

  return (
    <div
      ref={ref}
      aria-label={`${value}${suffix} ${label}`}
      className="flex flex-col items-center sm:items-start gap-1 p-5 rounded-2xl border bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all"
    >
      <Icon className="h-4 w-4 text-primary mb-1" />
      <span className="text-3xl font-bold tabular-nums text-foreground" aria-hidden="true">
        {display}{suffix}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Nav                                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const NAV_IDS = ['about', 'skills', 'experience', 'projects', 'tools', 'contact'] as const

function PortfolioNav({ dark, toggleDark, activeId }: {
  dark: boolean; toggleDark: () => void; activeId: string
}) {
  const { t, locale, setLocale } = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const { scrollY, innerHeight } = window
      setScrolled(scrollY > 20)
      const total = document.documentElement.scrollHeight - innerHeight
      setProgress(total > 0 ? (scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-lg border-b shadow-sm' : 'bg-transparent'}`}
    >
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 shrink-0"
          aria-label="Back to top"
        >
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {PROFILE.initials}
          </div>
          <span className="font-semibold text-sm hidden sm:block">{PROFILE.name}</span>
        </button>

        <div className="hidden md:flex items-center gap-0.5">
          {NAV_IDS.map(id => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`px-3 py-1.5 text-xs font-medium capitalize rounded-lg transition-colors ${
                activeId === id
                  ? 'text-foreground bg-accent font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {t(`portfolio.nav_${id as string}`) || id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href={PROFILE.blog}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {t('portfolio.blog_link')}
          </a>
          <a
            href={`mailto:${PROFILE.email}`}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('portfolio.hire_me')}
          </a>
          {/* EN ↔ AR toggle */}
          <button
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={locale === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
          >
            {locale === 'ar' ? t('portfolio.toggle_en') : t('portfolio.toggle_ar')}
          </button>
          <button
            onClick={toggleDark}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Mobile bottom tab bar                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function MobileBottomNav({ activeId }: { activeId: string }) {
  const { t } = useLocale()
  const tabs = [
    { id: '',         label: 'Home',     icon: Home    },
    { id: 'about',    label: 'About',    icon: Users   },
    { id: 'projects', label: 'Projects', icon: Layers  },
    { id: 'tools',    label: 'Tools',    icon: Zap     },
    { id: 'contact',  label: 'Contact',  icon: Mail    },
  ]

  function scrollTo(id: string) {
    if (!id) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-lg"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === '' ? activeId === '' : activeId === id
          return (
            <button
              key={id || 'home'}
              onClick={() => scrollTo(id)}
              aria-label={label}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Hero                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  const { t } = useLocale()
  const reduced = useReducedMotion()
  const role    = useTypewriter(ROLES)
  const heroRef = useRef<HTMLElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  /* Cursor-following parallax — direct DOM, no React re-renders */
  useEffect(() => {
    if (reduced) return
    const hero = heroRef.current
    if (!hero) return
    function onMove(e: MouseEvent) {
      const { left, top, width, height } = hero!.getBoundingClientRect()
      const x = ((e.clientX - left) / width  - 0.5) * -60
      const y = ((e.clientY - top)  / height - 0.5) * -40
      if (dotsRef.current) dotsRef.current.style.transform = `translate(${x}px, ${y}px)`
    }
    function onLeave() {
      if (dotsRef.current) dotsRef.current.style.transform = 'translate(0, 0)'
    }
    hero.addEventListener('mousemove', onMove, { passive: true })
    hero.addEventListener('mouseleave', onLeave)
    return () => {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-14">
      {/* Animated background — aria-hidden so screen readers skip it */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-background" />
        <div className="portfolio-blob portfolio-blob-1" />
        <div className="portfolio-blob portfolio-blob-2" />
        <div className="portfolio-blob portfolio-blob-3" />
        <div ref={dotsRef} className="portfolio-hero-dots absolute inset-0" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="max-w-3xl">

          {/* Availability badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-8">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t('portfolio.available')}
          </div>

          {/* Name with shimmer */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
            <span className="hero-name-shimmer">
              Hi, I&apos;m {PROFILE.name}
            </span>
          </h1>

          {/* Typewriter role */}
          <div className="flex items-center gap-3 mb-6 h-10">
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-xl sm:text-2xl font-semibold text-primary"
            >
              {role}
            </span>
            <span className="inline-block h-6 w-0.5 bg-primary animate-pulse" aria-hidden="true" />
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
            {PROFILE.bio}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-14">
            <a
              href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95"
            >
              {t('portfolio.hire_me')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#projects"
              onClick={e => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:border-primary/30 transition-all"
            >
              {t('portfolio.view_projects')}
            </a>
            <a
              href={PROFILE.blog}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:border-primary/30 transition-all"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              {t('portfolio.read_blog')}
            </a>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {[
              { href: PROFILE.github,   icon: GithubIcon,   label: 'GitHub'      },
              { href: PROFILE.linkedin, icon: LinkedinIcon, label: 'LinkedIn'    },
              { href: PROFILE.twitter,  icon: X,            label: 'Twitter / X' },
              { href: PROFILE.blog,     icon: Globe,        label: 'Blog'        },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 hover:scale-110 transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
            <span className="text-xs text-muted-foreground/50 ms-1">· {PROFILE.location}</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/40" aria-hidden="true">
        <span className="text-[10px] uppercase tracking-widest">{t('portfolio.scroll')}</span>
        <div className="h-8 w-0.5 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  About                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function AboutSection() {
  const { t } = useLocale()

  return (
    <section id="about" className="py-20 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <SectionHeading
              label={t('portfolio.about_label')}
              title={t('portfolio.about_title')}
              sub={t('portfolio.about_sub')}
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>I started writing PHP in 2014 during university and never stopped. Over the years I've worked across every layer of the stack — database design, API architecture, React frontends, DevOps pipelines, and team leadership.</p>
              <p>Today I lead engineering at Kief Studio, where I architect enterprise web platforms, set coding standards, and mentor engineers. Outside work I write technical deep-dives on <a href={PROFILE.blog} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">dineshstack.com</a>.</p>
              <p>I believe great software is built through clear thinking, ruthless simplicity, and consistent iteration — not clever tricks.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Open Source', 'Technical Writing', 'Team Mentoring', 'System Design', 'API Architecture'].map(tag => (
                <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(({ value, suffix, labelKey, icon: Icon }) => (
                <StatCard key={labelKey} value={value} suffix={suffix} labelKey={labelKey} Icon={Icon} />
              ))}
            </div>
            {/* Terminal card */}
            <div className="mt-4 rounded-2xl border bg-[#0d1117] text-sm font-mono overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                <span className="ms-2 text-[11px] text-white/30">dinesh.config.ts</span>
              </div>
              <div className="px-4 py-4 text-[13px] leading-relaxed" role="img" aria-label="Dinesh configuration: role Tech Lead, location UAE, experience 10+ years, stack Laravel and Next.js, available true">
                <span className="text-blue-400">const</span>{' '}
                <span className="text-green-400">dinesh</span>{' '}
                <span className="text-white/60">= {'{'}</span>
                {[
                  ['role',       '"Tech Lead"'],
                  ['location',   '"UAE"'],
                  ['experience', '"10+ years"'],
                  ['stack',      '["Laravel", "Next.js"]'],
                  ['available',  'true'],
                ].map(([k, v]) => (
                  <div key={k} className="ps-4">
                    <span className="text-purple-400">{k}</span>
                    <span className="text-white/60">: </span>
                    <span className={v === 'true' ? 'text-yellow-400' : v.startsWith('[') ? 'text-orange-300' : 'text-emerald-400'}>{v}</span>
                    <span className="text-white/40">,</span>
                  </div>
                ))}
                <span className="text-white/60">{'}'}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Skills                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function SkillsSection() {
  const { t } = useLocale()

  return (
    <section id="skills" className="py-20 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label={t('portfolio.skills_label')}
            title={t('portfolio.skills_title')}
            sub={t('portfolio.skills_sub')}
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(SKILLS).map(([cat, { icon: Icon, color, items }], i) => (
            <Reveal key={cat} delay={i * 70}>
              <div
                className={`skill-card group h-full rounded-2xl border bg-gradient-to-br ${color} bg-card p-5 hover:border-primary/30 transition-all`}
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
                  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{cat}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(skill => (
                    <span
                      key={skill}
                      className="rounded-full border bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Experience                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function ExperienceSection() {
  const { t } = useLocale()

  return (
    <section id="experience" className="py-20 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label={t('portfolio.exp_label')}
            title={t('portfolio.exp_title')}
            sub={t('portfolio.exp_sub')}
          />
        </Reveal>

        <div className="relative">
          {/* Vertical timeline line — logical start */}
          <div className="absolute start-4 sm:start-6 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-8 ps-12 sm:ps-16">
            {EXPERIENCE.map((job, i) => (
              <Reveal key={job.company} delay={i * 80}>
                <div className="group relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -start-8 sm:-start-10 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background"
                    style={{ background: job.color }}
                    aria-hidden="true"
                  >
                    {job.current && (
                      <span className="absolute h-full w-full animate-ping rounded-full opacity-30" style={{ background: job.color }} />
                    )}
                  </div>

                  <div className="rounded-2xl border bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base">{job.role}</h3>
                          {job.current && (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5">
                              {t('portfolio.current')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-primary mt-0.5">{job.company}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {job.period}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {job.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.stack.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] h-5 px-2">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Projects                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function ProjectCard({ p }: { p: typeof PROJECTS[0] }) {
  return (
    <article
      className="group flex flex-col h-full rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{ borderTopColor: p.color, borderTopWidth: 3 }}
    >
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-2"
              style={{ background: p.color + '20', color: p.color }}
            >
              {p.tag}
            </span>
            <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
              {p.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-1" role="group" aria-label={`Links for ${p.name}`}>
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer noopener" aria-label={`${p.name} on GitHub`}
                className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-accent hover:scale-110 transition-all">
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer noopener" aria-label={`${p.name} live site`}
                className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {p.stack.map(s => (
            <Badge key={s} variant="outline" className="text-[10px] h-5 px-2">{s}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 pt-1 border-t border-border/40">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden="true" />{p.year}</span>
          {p.url && (
            <a href={p.url} target="_blank" rel="noreferrer noopener"
              className="flex items-center gap-0.5 hover:text-primary transition-colors">
              Live <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function ProjectsSection() {
  const { t } = useLocale()
  const featured  = PROJECTS.filter(p => p.featured)
  const secondary = PROJECTS.filter(p => !p.featured)

  return (
    <section id="projects" className="py-20 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label={t('portfolio.projects_label')}
            title={t('portfolio.projects_title')}
            sub={t('portfolio.projects_sub')}
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {featured.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}><ProjectCard p={p} /></Reveal>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {secondary.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}><ProjectCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Testimonials                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function TestimonialsSection() {
  const { t } = useLocale()

  return (
    <section id="testimonials" className="py-20 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label={t('portfolio.testimonials_label')}
            title={t('portfolio.testimonials_title')}
            sub={t('portfolio.testimonials_sub')}
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.author} delay={i * 80}>
              <figure className="flex flex-col h-full rounded-2xl border bg-card p-6 hover:border-primary/30 hover:shadow-sm transition-all">
                <Quote className="h-6 w-6 text-primary/30 mb-4 shrink-0" aria-hidden="true" />
                <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: item.color }}
                    aria-hidden="true"
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.author}</p>
                    <p className="text-xs text-muted-foreground">{item.company}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Favorite Tools (live from API)                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function ToolsSection() {
  const { t } = useLocale()
  const [tools, setTools]     = useState<PublicProgram[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { setTools(await getPublicPrograms()) } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <section id="tools" className="py-20 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label={t('portfolio.tools_label')}
            title={t('portfolio.tools_title')}
            sub={t('portfolio.tools_sub')}
          />
        </Reveal>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" aria-label="Loading tools" aria-busy="true">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-4 h-28 animate-pulse opacity-60" />
            ))}
          </div>
        )}

        {!loading && tools.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tools.map((tool, i) => {
              const accent = tool.color ?? '#4f46e5'
              return (
                <Reveal key={tool.id} delay={i * 40}>
                  <a
                    href={tool.embed_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${tool.name}${tool.commission ? ` — ${tool.commission}` : ''}`}
                    className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl border"
                      style={{ background: accent + '14', borderColor: accent + '30' }}
                      aria-hidden="true"
                    >
                      {tool.icon || '🔗'}
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="text-xs font-semibold leading-snug truncate group-hover:text-primary transition-colors">
                        {tool.name}
                      </p>
                      {tool.category && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{tool.category}</p>
                      )}
                    </div>
                    {tool.commission && (
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: accent + '15', color: accent }}>
                        {tool.commission}
                      </span>
                    )}
                  </a>
                </Reveal>
              )
            })}
          </div>
        )}

        {!loading && (
          <Reveal delay={200}>
            <div className="mt-8 text-center">
              <a
                href="/deals"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                {t('portfolio.tools_all')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Education                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
function EducationSection() {
  const { t } = useLocale()

  return (
    <section id="education" className="py-20 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <SectionHeading label={t('portfolio.edu_label')} title={t('portfolio.edu_title')} />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EDUCATION.map((ed, i) => (
            <Reveal key={ed.degree} delay={i * 80}>
              <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 hover:border-primary/30 transition-all">
                <div className="text-3xl" aria-hidden="true">{ed.icon}</div>
                <div>
                  <h3 className="font-bold text-sm leading-snug">{ed.degree}</h3>
                  <p className="text-primary text-sm font-medium mt-0.5">{ed.school}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" aria-hidden="true" />{ed.period}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{ed.location}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ed.note}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={80}>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
              <div className="text-3xl" aria-hidden="true">📚</div>
              <div>
                <h3 className="font-bold text-sm">Continuous Learning</h3>
                <p className="text-primary text-sm font-medium mt-0.5">Self-directed</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I believe in staying sharp through building real projects, reading technical RFCs, and sharing knowledge on dineshstack.com. Learning never stops.
              </p>
              <a
                href={PROFILE.blog}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline underline-offset-4"
              >
                {t('portfolio.read_blog')} <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Contact form                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function ContactForm() {
  const { t } = useLocale()
  const [form, setForm]   = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')

    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID
    if (!formspreeId) {
      const body = encodeURIComponent(`Name: ${form.name}\n\n${form.message}`)
      window.location.href = `mailto:${PROFILE.email}?subject=Project Inquiry from ${form.name}&body=${body}`
      setStatus('sent')
      return
    }

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
        <p className="font-semibold text-foreground">{t('portfolio.form_sent')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="block text-xs font-medium text-muted-foreground mb-1.5">
            {t('portfolio.form_name')}
          </label>
          <input
            id="cf-name"
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('portfolio.form_name')}
            className="w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-xs font-medium text-muted-foreground mb-1.5">
            {t('portfolio.form_email')}
          </label>
          <input
            id="cf-email"
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder={t('portfolio.form_email')}
            className="w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t('portfolio.form_message')}
        </label>
        <textarea
          id="cf-message"
          required
          rows={4}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder={t('portfolio.form_message')}
          className="w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
        />
      </div>
      {status === 'error' && (
        <p role="alert" className="text-xs text-destructive">{t('portfolio.form_error')}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-[0.99]"
      >
        {status === 'sending' ? t('portfolio.form_sending') : t('portfolio.form_send')}
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Contact                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function ContactSection() {
  const { t } = useLocale()

  return (
    <section id="contact" className="py-20 border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — CTA copy */}
          <Reveal>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
              <span className="inline-block h-px w-5 bg-primary" aria-hidden="true" />
              {t('portfolio.contact_label')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('portfolio.contact_title')}</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">{t('portfolio.contact_sub')}</p>

            {/* Quick-contact buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {t('portfolio.send_email')}
              </a>
              <a
                href={PROFILE.whatsapp}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 transition-all active:scale-95"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t('portfolio.whatsapp')}
              </a>
            </div>

            <CopyEmail />

            <div className="flex items-center gap-3 mt-6">
              {[
                { href: PROFILE.github,   icon: GithubIcon,   label: 'GitHub'      },
                { href: PROFILE.linkedin, icon: LinkedinIcon, label: 'LinkedIn'    },
                { href: PROFILE.twitter,  icon: X,            label: 'Twitter / X' },
                { href: PROFILE.blog,     icon: Globe,        label: 'Blog'        },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 hover:scale-110 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Right — Contact form */}
          <Reveal delay={80}>
            <div className="rounded-2xl border bg-card p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Footer                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function Footer() {
  const { t } = useLocale()

  return (
    <footer className="border-t py-8 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold" aria-hidden="true">
            {PROFILE.initials}
          </div>
          <span className="text-sm font-semibold">{PROFILE.name} · DineshStack</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} DineshStack · {t('portfolio.footer_built')}
        </p>
        <div className="flex items-center gap-3">
          <a href="/deals" className="text-xs text-muted-foreground hover:text-primary transition-colors">Deals</a>
          <a href={PROFILE.blog} target="_blank" rel="noreferrer noopener" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('portfolio.blog_link')}</a>
          <a href={`mailto:${PROFILE.email}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('portfolio.contact_label')}</a>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main export                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
export function PortfolioPage() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const [showTop,   setShowTop]   = useState(false)
  const [activeId,  setActiveId]  = useState<string>('')

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Shared active-section tracker for mobile bottom nav */
  useEffect(() => {
    const ids = ['about', 'skills', 'experience', 'projects', 'tools', 'contact']
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortfolioNav dark={dark} toggleDark={toggleDark} activeId={activeId} />

      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ToolsSection />
      <EducationSection />
      <ContactSection />
      <Footer />

      <MobileBottomNav activeId={activeId} />

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-20 end-6 md:bottom-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-110 transition-all"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
