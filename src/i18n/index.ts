import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import enTranslations from './locales/en.json'
import arTranslations from './locales/ar.json'
import urTranslations from './locales/ur.json'


const rtlLanguages = ['ar', 'ur']

export function applyLanguageUI(lang: string) {
  const isRTL = rtlLanguages.includes(lang)

  const root = document.documentElement

  root.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  root.setAttribute('lang', lang)

  root.style.fontFamily = isRTL
    ? 'var(--font-arabic)'
    : 'var(--font-latin)'
}

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  },
  ur: {
    translation: urTranslations
  }
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Default language
    fallbackLng: 'en',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'tammat-language',
    },
    
    // Options
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // Debugging
    debug: import.meta.env.DEV,
    
    // React options
    react: {
      useSuspense: false,
    },
  })
  .then(() => {

    applyLanguageUI(i18n.language)

  })


  i18n.on('languageChanged', (lng) => {
    applyLanguageUI(lng)
  })
  
export default i18n

// Helper functions
export const getCurrentLanguage = () => i18n.language || 'en'
export const changeLanguage = (lng: string) => i18n.changeLanguage(lng)
export const isRTL = () => {
  const lang = getCurrentLanguage()
  return lang === 'ar' || lang === 'ur'
}

// Language options
export const languages = [
  {
    code: 'en',
    name: 'EN',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  {
    code: 'ar',
    name: 'AR',
    nativeName: 'العربية',
    flag: '🇦🇪',
    dir: 'rtl'
  },
  {
    code: 'ur',
    name: 'UR',
    nativeName: 'اردو',
    flag: '',
    dir: 'rtl'
  }
] as const

export type LanguageCode = typeof languages[number]['code']
