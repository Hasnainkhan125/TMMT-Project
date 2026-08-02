import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Check } from 'lucide-react'
import { languages, type LanguageCode, changeLanguage, getCurrentLanguage, isRTL } from '@/i18n'

interface LanguageSelectorProps {
  compact?: boolean
  showFlag?: boolean
  variant?: 'default' | 'card' | 'inline'
  className?: string
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  showFlag = true,
  variant = 'default',
  className = ''
}) => {
  const { t } = useTranslation()
  const currentLang = getCurrentLanguage()

  const handleLanguageChange = (langCode: LanguageCode) => {
    changeLanguage(langCode)
    
    // Update document direction for RTL support
    const newIsRTL = langCode === 'ar'
    document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = langCode
    
    // Update body class for styling
    document.body.classList.toggle('rtl', newIsRTL)
    document.body.classList.toggle('ltr', !newIsRTL)
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  if (variant === 'card') {
    return (
      <Card className={`bg-surface border-border ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Globe className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-foreground">
                {t('common.language')}
              </span>
            </div>
            <div className="space-y-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    currentLang === language.code
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-foreground hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {showFlag && (
                      <span className="text-lg">{language.flag}</span>
                    )}
                    <div className="text-left rtl:text-right">
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs text-text-muted">{language.nativeName}</div>
                    </div>
                  </div>
                  {currentLang === language.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentLang === language.code
                ? 'bg-primary text-primary-foreground'
                : 'text-text-muted hover:text-foreground hover:bg-surface'
            }`}
          >
            {showFlag && <span className="mr-1 rtl:mr-0 rtl:ml-1">{language.flag}</span>}
            {compact ? language.code.toUpperCase() : language.name}
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={`gap-2 ${className}`}
        >
          {showFlag && <span>{currentLanguage.flag}</span>}
          <Globe className="w-4 h-4" />
          {!compact && (
            <span className="hidden sm:inline">
              {currentLanguage.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {showFlag && <span>{language.flag}</span>}
              <div>
                <div className="font-medium">{language.name}</div>
                <div className="text-xs text-text-muted">{language.nativeName}</div>
              </div>
            </div>
            {currentLang === language.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// RTL Support Hook
export const useRTL = () => {
  const { i18n } = useTranslation()
  return i18n.language === 'ar'
}

// Direction classes helper
export const directionClasses = (ltrClass: string, rtlClass: string) => {
  return isRTL() ? rtlClass : ltrClass
}

// Spacing classes for RTL support
export const rtlSpacing = {
  'ml-2': 'ml-2 rtl:ml-0 rtl:mr-2',
  'mr-2': 'mr-2 rtl:mr-0 rtl:ml-2',
  'ml-4': 'ml-4 rtl:ml-0 rtl:mr-4',
  'mr-4': 'mr-4 rtl:mr-0 rtl:ml-4',
  'pl-4': 'pl-4 rtl:pl-0 rtl:pr-4',
  'pr-4': 'pr-4 rtl:pr-0 rtl:pl-4',
  'space-x-2': 'space-x-2 rtl:space-x-reverse',
  'space-x-3': 'space-x-3 rtl:space-x-reverse',
  'space-x-4': 'space-x-4 rtl:space-x-reverse',
  'text-left': 'text-left rtl:text-right',
  'text-right': 'text-right rtl:text-left',
} as const

export type RTLSpacingKey = keyof typeof rtlSpacing
