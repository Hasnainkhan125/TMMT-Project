import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/languageSlice';
import { languages } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode === 'en' || languageCode === 'ar' || languageCode === 'ur') {
      dispatch(setLanguage(languageCode));
    }
  };

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="md:w-24 w-18 rounded-full transition-all duration-200 border-none hover:shadow-md">
        <SelectValue placeholder={t('language.select', 'Language')} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;



