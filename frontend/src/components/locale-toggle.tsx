'use client'

import { useLocale } from '@/lib/locale'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const toAr = locale === 'en'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setLocale(toAr ? 'ar' : 'en')}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          aria-label={toAr ? 'Switch to Arabic' : 'Switch to English'}
        >
          <span className="text-sm leading-none">{toAr ? '🇦🇪' : '🇬🇧'}</span>
          {toAr ? 'العربية' : 'English'}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {toAr ? 'Switch to Arabic / التبديل إلى العربية' : 'Switch to English'}
      </TooltipContent>
    </Tooltip>
  )
}
