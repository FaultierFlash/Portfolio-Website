// src/i18n/utils.ts
import en from './en.json';
import de from './de.json';

export type Locale = 'en' | 'de';
export type TranslationKey = keyof typeof en; // Assumes 'en' has all keys

const translations = {
  en: en as Record<TranslationKey, string>, // Assert type
  de: de as Record<TranslationKey, string>, // Assert type
};

export function useTranslations(lang: Locale | undefined) {
  const currentLang = lang || 'en'; // Default to 'en' if somehow undefined

  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let translation: string = translations[currentLang][key] || translations['en'][key] || key;

    // Basic parameter replacement (e.g., "Hello {name}")
    if (params) {
       Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
       });
    }

    return translation;
  }
}