import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { changeLanguage as i18nChangeLanguage } from '@/i18n';

export type LanguageCode = 'en' | 'ar' | 'ur';

interface LanguageState {
  currentLanguage: LanguageCode;
  isRTL: boolean;
}

const getStoredLanguage = (): LanguageCode => {
  const stored = localStorage.getItem('tammat-language');
  if (stored === 'en' || stored === 'ar' || stored === 'ur') {
    return stored;
  }
  return 'en';
};

const initialState: LanguageState = {
  currentLanguage: getStoredLanguage(),
  isRTL: getStoredLanguage() === 'ar' || getStoredLanguage() === 'ur',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.currentLanguage = action.payload;
      state.isRTL = action.payload === 'ar' || action.payload === 'ur';
      localStorage.setItem('tammat-language', action.payload);
      i18nChangeLanguage(action.payload);
      
      // Update document direction
      if (typeof document !== 'undefined') {
        document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = action.payload;
      }
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

