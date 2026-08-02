import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/languageSlice';
import { languages } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);

  const handleLanguageChange = (languageCode: 'en' | 'ar' | 'ur') => {
    dispatch(setLanguage(languageCode));
  };

  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-primary bg-background text-foreground hover:bg-accent h-9 rounded-full px-3 transition-all duration-200 hover:scale-[1.02]"
          aria-label={t('language.select', 'Select language')}
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="text-xs font-medium">
            {currentLang?.flag} {currentLang?.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${
              currentLanguage === lang.code
                ? 'bg-accent text-accent-foreground'
                : ''
            }`}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

