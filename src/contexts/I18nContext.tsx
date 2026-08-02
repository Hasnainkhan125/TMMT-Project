import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SupportedLanguage = 'en' | 'ar' | 'ur' | 'hi' | 'tl';

type Dictionary = Record<string, string>;

const DICTIONARIES: Record<SupportedLanguage, Dictionary> = {
  en: {
    'app.title': 'TAMMAT Smart Services',
    'nav.notifications': 'Notifications',
    'nav.family': 'Family',
    'nav.payments': 'Payments',
    'nav.admin': 'Admin',
    'nav.officer': 'Officer',
    'nav.knowledge': 'Knowledge Hub',
  },
  ar: {
    'app.title': 'تمّت للخدمات الذكية',
    'nav.notifications': 'التنبيهات',
    'nav.family': 'العائلة',
    'nav.payments': 'المدفوعات',
    'nav.admin': 'الإدارة',
    'nav.officer': 'الضابط',
    'nav.knowledge': 'مركز المعرفة',
  },
  ur: {
    'app.title': 'ٹمات سمارٹ سروسز',
    'nav.notifications': 'اطلاعات',
    'nav.family': 'خاندان',
    'nav.payments': 'ادائیگیاں',
    'nav.admin': 'ایڈمن',
    'nav.officer': 'افسر',
    'nav.knowledge': 'نالج ہب',
  },
  hi: {
    'app.title': 'टम्मत स्मार्ट सेवाएँ',
    'nav.notifications': 'सूचनाएँ',
    'nav.family': 'परिवार',
    'nav.payments': 'भुगतान',
    'nav.admin': 'प्रशासन',
    'nav.officer': 'अधिकारी',
    'nav.knowledge': 'नॉलेज हब',
  },
  tl: {
    'app.title': 'TAMMAT Smart Services',
    'nav.notifications': 'Mga Abiso',
    'nav.family': 'Pamilya',
    'nav.payments': 'Mga Bayad',
    'nav.admin': 'Admin',
    'nav.officer': 'Opisyal',
    'nav.knowledge': 'Knowledge Hub',
  },
};

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') as SupportedLanguage | null : null;
    return saved || 'en';
  });

  const changeLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguage(lang);
    try { localStorage.setItem('lang', lang); } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback((key: string) => {
    const dict = DICTIONARIES[language];
    return dict[key] || DICTIONARIES.en[key] || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage: changeLanguage, t }), [language, changeLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};


