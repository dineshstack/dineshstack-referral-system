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

  'deals.badge':           'Handpicked Deals',
  'deals.title':           'Tools & Resources I Recommend',
  'deals.hero_greeting':   "Hi, I'm Dinesh Wijethunga 👋",
  'deals.hero_role':       'Senior Full-Stack Developer · Laravel & React · Building production apps since 2014',
  'deals.subtitle':        'Every tool on this page is something I personally pay for and use in real projects. Clicking through gives you an exclusive discount — and supports my blog.',
  'deals.stat_years':      'Years in Tech',
  'deals.stat_role':       'Current Role',
  'deals.stat_role_value': 'Full-Stack Dev',
  'deals.stat_tools':      'Tools Curated',
  'deals.featured':        'Top Pick',
  'deals.featured_title':  'My Top Picks',
  'deals.search':          'Search deals…',
  'deals.all':             'All',
  'deals.cta':             'Get Deal →',
  'deals.no_results':      'No deals match your search.',
  'deals.footer':          'Links on this page are affiliate referral links. I earn a small commission if you purchase — at no extra cost to you.',
  'deals.rights':          'All rights reserved.',
  'deals.you_get':         'You get:',
  'deals.verified':        'Verified',
  'deals.this_month':      'this month',
  'deals.total_clicks':    'total',
  'deals.sort_trending':   'Trending',
  'deals.sort_default':    'Default',
  'deals.count_suffix':    'deal',
  'deals.count_suffix_plural': 'deals',
  'deals.whatsapp_share':   'Share on WhatsApp',
  'deals.promo_code_label': 'Promo Code — click to copy',
  'deals.my_pick':          'my rating',
  'deals.using_since':      'Using since',
  'deals.review_score':     '/ 5 on G2',
  'deals.disclosure':       'Affiliate disclosure: some links on this page earn me a commission if you purchase.',
  'deals.editorial_note':   'Affiliate links never change my recommendations — I only list tools I personally use and pay for.',
  'deals.pricing_free':     'Free',
  'deals.pricing_freemium': 'Freemium',
  'deals.works_with':       'Works with',
  'deals.back_to_top':      'Back to top',

  /* ── Portfolio ──────────────────────────────────────────────────────── */
  'portfolio.toggle_ar':      'العربية',
  'portfolio.toggle_en':      'English',
  'portfolio.nav_about':      'About',
  'portfolio.nav_skills':     'Skills',
  'portfolio.nav_experience': 'Experience',
  'portfolio.nav_projects':   'Projects',
  'portfolio.nav_tools':      'Tools',
  'portfolio.nav_contact':    'Contact',
  'portfolio.hire_me':        "Let's Talk",
  'portfolio.blog_link':      'Blog',
  'portfolio.available':      'Available for consulting & collaboration',
  'portfolio.view_projects':  'View Projects',
  'portfolio.read_blog':      'Read Blog',
  'portfolio.scroll':         'scroll',

  'portfolio.about_label':    'About me',
  'portfolio.about_title':    'A decade of shipping real products',
  'portfolio.about_sub':      'From PHP freelancer to senior engineer and SaaS builder — 10+ years of shipping production-grade systems across the full stack.',
  'portfolio.about_p1':       "I started writing PHP in 2014 during university and never stopped. Over the years I've worked across every layer of the stack — database design, API architecture, React frontends, DevOps pipelines, and payment gateway integrations.",
  'portfolio.about_p2_pre':   "I'm currently a Senior Software Engineer based in Dubai, UAE, while also running",
  'portfolio.about_p2_orion': 'Orion360',
  'portfolio.about_p2_mid':   '— a web development agency — and building',
  'portfolio.about_p2_ds':    'Dinesh Stack',
  'portfolio.about_p2_post':  ', where I share in-depth tutorials on Laravel, React, and modern web development.',
  'portfolio.about_p3':       'I believe great software is built through clean architecture, industry best practices, and quality-first thinking — not clever tricks.',
  'portfolio.tag_opensource':  'Open Source',
  'portfolio.tag_writing':     'Technical Writing',
  'portfolio.tag_mentoring':   'Team Mentoring',
  'portfolio.tag_design':      'System Design',
  'portfolio.tag_api':         'API Architecture',

  'portfolio.skills_label':   'Tech stack',
  'portfolio.skills_title':   'Tools I build with',
  'portfolio.skills_sub':     'A curated set of technologies I use daily to ship production-grade systems.',

  'portfolio.exp_label':      'Experience',
  'portfolio.exp_title':      'Career timeline',
  'portfolio.exp_sub':        '10+ years of building, shipping, and leading across the full stack.',
  'portfolio.current':        'Current',

  'portfolio.projects_label': 'Work',
  'portfolio.projects_title': 'Selected projects',
  'portfolio.projects_sub':   'A mix of products I\'ve built, launched, or contributed to.',

  'portfolio.testimonials_label': 'Testimonials',
  'portfolio.testimonials_title': 'What clients say',
  'portfolio.testimonials_sub':   'A few words from people I\'ve shipped code with.',

  'portfolio.tools_label':    'Favorite tools',
  'portfolio.tools_title':    'What I actually use',
  'portfolio.tools_sub':      'Every tool here is something I pay for and use in real projects. Click any to get an exclusive deal.',
  'portfolio.tools_all':      'See all deals + exclusive discounts',

  'portfolio.edu_label':           'Education',
  'portfolio.edu_title':           'Academic background',
  'portfolio.edu_continuous_title': 'Continuous Learning',
  'portfolio.edu_continuous_school': 'Self-directed',
  'portfolio.edu_continuous_note':  "I believe in staying sharp through building real projects, reading technical RFCs, and sharing knowledge on dineshstack.com. Learning never stops.",

  'portfolio.contact_label':  'Contact',
  'portfolio.contact_title':  "Let's build something",
  'portfolio.contact_sub':    'Available for consulting, freelance projects, technical advisory, and full-time senior roles. Drop me a message.',
  'portfolio.send_email':     'Send an email',
  'portfolio.whatsapp':       'Chat on WhatsApp',

  'portfolio.form_name':      'Your name',
  'portfolio.form_email':     'Your email',
  'portfolio.form_message':   'Your message',
  'portfolio.form_send':      'Send Message',
  'portfolio.form_sending':   'Sending…',
  'portfolio.form_sent':      "Sent! I'll reply soon.",
  'portfolio.form_error':     'Something went wrong. Try emailing directly.',

  'portfolio.stat_years':     'Years Experience',
  'portfolio.stat_projects':  'Projects Delivered',
  'portfolio.stat_readers':   'Blog Readers / mo',
  'portfolio.stat_lead':      'Years Building SaaS',

  'portfolio.footer_built':   'Built with Next.js + Tailwind CSS',

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

  'deals.badge':           'عروض مختارة بعناية',
  'deals.title':           'أدوات وموارد أنصح بها',
  'deals.hero_greeting':   'مرحباً، أنا دينيش ويجيتونجا 👋',
  'deals.hero_role':       'مطوّر متكامل أول · Laravel وReact · أبني تطبيقات إنتاجية منذ 2014',
  'deals.subtitle':        'كل أداة في هذه الصفحة أدفع ثمنها وأستخدمها في مشاريع حقيقية. النقر عبر روابطي يمنحك خصماً حصرياً — ويدعم مدونتي.',
  'deals.stat_years':      'سنوات في التقنية',
  'deals.stat_role':       'المسمى الوظيفي',
  'deals.stat_role_value': 'مطوّر متكامل',
  'deals.stat_tools':      'أداة موصى بها',
  'deals.featured':        'اختيار مميز',
  'deals.featured_title':  'اختياراتي المميزة',
  'deals.search':          'ابحث في العروض…',
  'deals.all':             'الكل',
  'deals.cta':             'احصل على العرض',
  'deals.no_results':      'لا توجد عروض مطابقة لبحثك.',
  'deals.footer':          'الروابط في هذه الصفحة روابط إحالة. أحصل على عمولة بسيطة عند الشراء دون أي تكلفة إضافية عليك.',
  'deals.rights':          'جميع الحقوق محفوظة.',
  'deals.you_get':         'ستحصل على:',
  'deals.verified':        'موثّق',
  'deals.this_month':      'هذا الشهر',
  'deals.total_clicks':    'إجمالي',
  'deals.sort_trending':   'الأكثر رواجاً',
  'deals.sort_default':    'الافتراضي',
  'deals.count_suffix':    'عرض',
  'deals.count_suffix_plural': 'عرض',
  'deals.whatsapp_share':   'شارك عبر واتساب',
  'deals.promo_code_label': 'كود الخصم — انقر للنسخ',
  'deals.my_pick':          'تقييمي',
  'deals.using_since':      'أستخدمه منذ',
  'deals.review_score':     '/ 5 على G2',
  'deals.disclosure':       'إفصاح: بعض الروابط في هذه الصفحة روابط إحالة أحصل على عمولة عبرها.',
  'deals.editorial_note':   'روابط الإحالة لا تؤثر أبداً على توصياتي — أدرج فقط الأدوات التي أستخدمها وأدفع ثمنها شخصياً.',
  'deals.pricing_free':     'مجاني',
  'deals.pricing_freemium': 'مجاني جزئياً',
  'deals.works_with':       'يعمل مع',
  'deals.back_to_top':      'العودة للأعلى',

  /* ── Portfolio ──────────────────────────────────────────────────────── */
  'portfolio.toggle_ar':      'العربية',
  'portfolio.toggle_en':      'English',
  'portfolio.nav_about':      'عني',
  'portfolio.nav_skills':     'المهارات',
  'portfolio.nav_experience': 'الخبرة',
  'portfolio.nav_projects':   'المشاريع',
  'portfolio.nav_tools':      'الأدوات',
  'portfolio.nav_contact':    'تواصل',
  'portfolio.hire_me':        'لنتحدث',
  'portfolio.blog_link':      'المدونة',
  'portfolio.available':      'متاح للاستشارات والتعاون',
  'portfolio.view_projects':  'عرض المشاريع',
  'portfolio.read_blog':      'قراءة المدونة',
  'portfolio.scroll':         'اسحب',

  'portfolio.about_label':    'من أنا',
  'portfolio.about_title':    'عقد من بناء منتجات حقيقية',
  'portfolio.about_sub':      'من مطوّر PHP مستقل إلى مهندس أول وصانع SaaS — أكثر من ١٠ سنوات في بناء أنظمة إنتاجية عبر تطوير الويب الكامل.',
  'portfolio.about_p1':       'بدأت الكتابة بـ PHP عام 2014 خلال دراستي الجامعية ولم أتوقف. على مر السنين عملت في كل طبقة من طبقات التطوير — تصميم قواعد البيانات، هندسة الـ API، واجهات React، مسارات DevOps، وتكاملات بوابات الدفع.',
  'portfolio.about_p2_pre':   'أعمل حالياً كمطوّر برمجيات أول في دبي، الإمارات العربية المتحدة، إلى جانب إدارة',
  'portfolio.about_p2_orion': 'Orion360',
  'portfolio.about_p2_mid':   '— وكالة لتطوير الويب — وبناء',
  'portfolio.about_p2_ds':    'Dinesh Stack',
  'portfolio.about_p2_post':  '، حيث أشارك دروساً معمّقة حول Laravel وReact وتطوير الويب الحديث.',
  'portfolio.about_p3':       'أؤمن بأن البرمجيات العظيمة تُبنى من خلال هندسة نظيفة، وأفضل ممارسات الصناعة، والتفكير الذي يضع الجودة في المقدمة — لا الحيل الذكية.',
  'portfolio.tag_opensource':  'مصدر مفتوح',
  'portfolio.tag_writing':     'الكتابة التقنية',
  'portfolio.tag_mentoring':   'تطوير الفرق',
  'portfolio.tag_design':      'تصميم الأنظمة',
  'portfolio.tag_api':         'هندسة الـ API',

  'portfolio.skills_label':   'تقنياتي',
  'portfolio.skills_title':   'الأدوات التي أبني بها',
  'portfolio.skills_sub':     'مجموعة مختارة من التقنيات التي أستخدمها يومياً لبناء أنظمة إنتاجية.',

  'portfolio.exp_label':      'الخبرة',
  'portfolio.exp_title':      'المسيرة المهنية',
  'portfolio.exp_sub':        'أكثر من ١٠ سنوات من البناء والإطلاق والقيادة عبر جميع طبقات التطوير.',
  'portfolio.current':        'حالياً',

  'portfolio.projects_label': 'أعمالي',
  'portfolio.projects_title': 'مشاريع مختارة',
  'portfolio.projects_sub':   'مزيج من المنتجات التي بنيتها أو أطلقتها أو ساهمت فيها.',

  'portfolio.testimonials_label': 'شهادات',
  'portfolio.testimonials_title': 'ما يقوله العملاء',
  'portfolio.testimonials_sub':   'كلمات من أشخاص شاركتهم بناء منتجات حقيقية.',

  'portfolio.tools_label':    'أدواتي المفضلة',
  'portfolio.tools_title':    'ما أستخدمه فعلاً',
  'portfolio.tools_sub':      'كل أداة هنا أدفع ثمنها وأستخدمها في مشاريع حقيقية. اضغط على أي أداة للحصول على خصم حصري.',
  'portfolio.tools_all':      'شاهد جميع العروض والخصومات الحصرية',

  'portfolio.edu_label':           'التعليم',
  'portfolio.edu_title':           'الخلفية الأكاديمية',
  'portfolio.edu_continuous_title': 'التعلّم المستمر',
  'portfolio.edu_continuous_school': 'تعلّم ذاتي',
  'portfolio.edu_continuous_note':  'أؤمن بالبقاء على المستوى من خلال بناء مشاريع حقيقية، وقراءة مواصفات RFC التقنية، ومشاركة المعرفة على dineshstack.com. التعلّم لا ينتهي.',

  'portfolio.contact_label':  'تواصل',
  'portfolio.contact_title':  'لنبني شيئاً معاً',
  'portfolio.contact_sub':    'متاح للاستشارات والمشاريع المستقلة والدور الكاملة. أرسل لي رسالة.',
  'portfolio.send_email':     'أرسل بريداً إلكترونياً',
  'portfolio.whatsapp':       'تواصل عبر واتساب',

  'portfolio.form_name':      'اسمك',
  'portfolio.form_email':     'بريدك الإلكتروني',
  'portfolio.form_message':   'رسالتك',
  'portfolio.form_send':      'أرسل الرسالة',
  'portfolio.form_sending':   'جارٍ الإرسال…',
  'portfolio.form_sent':      'تم الإرسال! سأرد قريباً.',
  'portfolio.form_error':     'حدث خطأ. جرّب الإرسال مباشرة.',

  'portfolio.stat_years':     'سنوات خبرة',
  'portfolio.stat_projects':  'مشروع منجز',
  'portfolio.stat_readers':   'قارئ شهرياً',
  'portfolio.stat_lead':      'سنوات بناء SaaS',

  'portfolio.footer_built':   'مبني بـ Next.js + Tailwind CSS',

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
