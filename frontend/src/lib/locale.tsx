'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Locale = 'en' | 'ar'

/* ── English strings ─────────────────────────────────────────────────────── */
const EN: Record<string, string> = {
  'nav.programs':    'Programs',
  'nav.all_links':   'All Links',
  'nav.analytics':   'Analytics',
  'nav.deals':       'Public deals page',
  'nav.test':        'Test redirect',
  'nav.sign_out':    'Sign out',
  'nav.signing_out': 'Signing out…',

  'dashboard.title':           'Programs',
  'dashboard.subtitle':        'Manage your referral programs and link queues',
  'dashboard.new_program':     'New Program',
  'dashboard.add_program':     'Add Program',
  'dashboard.no_programs':     'No programs yet',
  'dashboard.no_programs_sub': 'Add your first referral program to get started',
  'dashboard.other_programs':  'Other Programs',

  'stat.total_programs': 'Total Programs',
  'stat.total_clicks':   'Total Clicks',
  'stat.links_used':     'Links Used',
  'stat.queue_total':    'Queue Total',

  'card.embed_link':  'Your embed link',
  'card.active_link': 'Active affiliate link',
  'card.no_link':     '— No active link —',
  'card.clicks':      'Clicks',
  'card.used':        'Used',
  'card.queue':       'Queue',
  'card.rate':        'Rate',
  'card.queue_btn':   'Queue',
  'card.add_links':   'Links',

  'alert.queue_empty': 'Queue EMPTY',
  'alert.queue_low':   'Only {{count}} link(s) left',
  'alert.empty_msg':   'Visitors are not getting referral links — you are losing commissions!',
  'alert.low_msg':     'Add more links now before the queue runs out.',
  'alert.add_links':   '+ Add Links',

  'deals.badge':         'Handpicked Deals',
  'deals.title':         'Tools & Resources I Recommend',
  'deals.subtitle':      'Every tool here is something I personally use. Clicking through gives you an exclusive discount and supports my work.',
  'deals.search':        'Search deals…',
  'deals.all':           'All',
  'deals.cta':           'Get Deal →',
  'deals.no_results':    'No deals match your search.',
  'deals.footer':        'Links on this page are affiliate referral links. I earn a commission if you purchase — at no extra cost to you.',
  'deals.you_get':       'You get:',
  'deals.verified':      'Verified',
  'deals.this_month':    'this month',
  'deals.total_clicks':  'total',
  'deals.sort_trending': 'Trending',
  'deals.sort_default':  'Default',
  'deals.count_suffix':  'deal',
  'deals.count_suffix_plural': 'deals',
  'deals.whatsapp_share': 'Share on WhatsApp',
  'deals.disclosure':    'Affiliate disclosure: links on this page earn me a commission if you purchase — at no extra cost to you.',

  'common.edit':    'Edit',
  'common.delete':  'Delete',
  'common.save':    'Save',
  'common.cancel':  'Cancel',
  'common.close':   'Close',
  'common.loading': 'Loading…',
  'common.share':   'Share',
  'common.copy':    'Copy',
  'common.copied':  'Copied!',
  'common.add':     'Add',
  'common.search':  'Search',
}

/* ── Arabic strings ──────────────────────────────────────────────────────── */
const AR: Record<string, string> = {
  'nav.programs':    'البرامج',
  'nav.all_links':   'كل الروابط',
  'nav.analytics':   'التحليلات',
  'nav.deals':       'صفحة العروض العامة',
  'nav.test':        'اختبار التحويل',
  'nav.sign_out':    'تسجيل الخروج',
  'nav.signing_out': 'جارٍ الخروج…',

  'dashboard.title':           'البرامج',
  'dashboard.subtitle':        'إدارة برامج الإحالة وقوائم الروابط',
  'dashboard.new_program':     'برنامج جديد',
  'dashboard.add_program':     'إضافة برنامج',
  'dashboard.no_programs':     'لا توجد برامج بعد',
  'dashboard.no_programs_sub': 'أضف أول برنامج إحالة للبدء',
  'dashboard.other_programs':  'برامج أخرى',

  'stat.total_programs': 'إجمالي البرامج',
  'stat.total_clicks':   'إجمالي النقرات',
  'stat.links_used':     'الروابط المستخدمة',
  'stat.queue_total':    'إجمالي القائمة',

  'card.embed_link':  'رابط التضمين',
  'card.active_link': 'الرابط النشط',
  'card.no_link':     '— لا يوجد رابط نشط —',
  'card.clicks':      'نقرات',
  'card.used':        'مستخدم',
  'card.queue':       'قائمة',
  'card.rate':        'عمولة',
  'card.queue_btn':   'القائمة',
  'card.add_links':   'روابط',

  'alert.queue_empty': 'القائمة فارغة',
  'alert.queue_low':   'لم يتبقَّ سوى {{count}} رابط',
  'alert.empty_msg':   'الزوار لا يحصلون على روابط إحالة — أنت تخسر عمولات!',
  'alert.low_msg':     'أضف روابط الآن قبل أن تنفد القائمة.',
  'alert.add_links':   '+ إضافة روابط',

  'deals.badge':         'عروض مختارة بعناية',
  'deals.title':         'أدوات وموارد أنصح بها',
  'deals.subtitle':      'كل أداة هنا أستخدمها شخصياً. النقر عبر هذه الروابط يمنحك خصماً حصرياً ويدعم عملي.',
  'deals.search':        'ابحث في العروض…',
  'deals.all':           'الكل',
  'deals.cta':           'احصل على العرض',
  'deals.no_results':    'لا توجد عروض مطابقة لبحثك.',
  'deals.footer':        'الروابط في هذه الصفحة روابط إحالة. أحصل على عمولة عند الشراء دون أي تكلفة إضافية عليك.',
  'deals.you_get':       'ستحصل على:',
  'deals.verified':      'موثّق',
  'deals.this_month':    'هذا الشهر',
  'deals.total_clicks':  'إجمالي',
  'deals.sort_trending': 'الأكثر رواجاً',
  'deals.sort_default':  'الافتراضي',
  'deals.count_suffix':  'عرض',
  'deals.count_suffix_plural': 'عرض',
  'deals.whatsapp_share': 'شارك عبر واتساب',
  'deals.disclosure':    'إفصاح: روابط هذه الصفحة روابط إحالة — أحصل على عمولة إذا اشتريت عبرها، دون تكلفة إضافية عليك.',

  'common.edit':    'تعديل',
  'common.delete':  'حذف',
  'common.save':    'حفظ',
  'common.cancel':  'إلغاء',
  'common.close':   'إغلاق',
  'common.loading': 'جارٍ التحميل…',
  'common.share':   'مشاركة',
  'common.copy':    'نسخ',
  'common.copied':  'تم النسخ!',
  'common.add':     'إضافة',
  'common.search':  'بحث',
}

/* ── Context ─────────────────────────────────────────────────────────────── */
interface LocaleContextValue {
  locale: Locale
  isRTL: boolean
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  isRTL: false,
  setLocale: () => {},
  t: k => EN[k] ?? k,
})

function applyLocale(l: Locale) {
  document.documentElement.lang = l
  document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = (localStorage.getItem('locale') ?? 'en') as Locale
    applyLocale(saved)
    setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    localStorage.setItem('locale', l)
    applyLocale(l)
    setLocaleState(l)
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const dict = locale === 'ar' ? AR : EN
    let str = dict[key] ?? EN[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{{${k}}}`, String(v))
      }
    }
    return str
  }

  return (
    <LocaleContext.Provider value={{ locale, isRTL: locale === 'ar', setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
