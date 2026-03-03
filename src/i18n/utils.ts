// src/i18n/utils.ts
import en from './en.json';
import de from './de.json';

export type Locale = 'en' | 'de';

// Remove the restrictive TranslationKey type based only on top-level keys
// const translations object will hold the imported JSON structures
const translations = {
  en: en,
  de: de,
};

// Helper function to safely access nested properties using a key path array
// Example: getNestedValue(en, ['terminal', 'title']) -> "Contact Terminal"
function getNestedValue(obj: any, path: string[]): string | undefined {
  // Use reduce to walk through the object according to the path parts
  // 'o' is the current object level, 'p' is the current path part (key)
  const value = path.reduce((o, p) => (o && typeof o === 'object' && o[p] !== undefined) ? o[p] : undefined, obj);

  // Ensure the final value retrieved is actually a string
  return typeof value === 'string' ? value : undefined;
}

export function useTranslations(lang: Locale | undefined, overrides?: Record<string, string>) {
  const currentLang = lang || 'en'; // Default to 'en' if somehow undefined
  const currentTranslations = translations[currentLang];
  const fallbackTranslations = translations['en']; // Always use 'en' as the fallback language

  // Modify the 't' function to handle nested keys and overrides
  return function t(key: string, params?: Record<string, string | number>): string {
    // 1. Check for Override first
    let translation: string | undefined;
    if (overrides && overrides[key]) {
      translation = overrides[key];
    }

    if (translation === undefined) {
      // Split the key string by '.' e.g., "terminal.title" becomes ["terminal", "title"]
      const keyParts = key.split('.');

      // Try to get the translation from the current language object using the nested path
      translation = getNestedValue(currentTranslations, keyParts);

      // If the translation wasn't found in the current language, try the fallback language ('en')
      if (translation === undefined && currentLang !== 'en') {
        console.warn(`Translation key "${key}" not found for locale "${currentLang}". Trying fallback "en".`);
        translation = getNestedValue(fallbackTranslations, keyParts);
      }
    }

    // If the translation is still not found (neither in overrides, current lang nor fallback),
    // use the key itself as the result and log a warning.
    if (translation === undefined) {
      console.warn(`Translation key "${key}" not found in locale "${currentLang}" or fallback "en". Using key as fallback.`);
      translation = key; // Return the key string itself
    }

    let finalTranslation = translation; // Use the found translation or the key

    // Perform parameter replacement if params are provided and we have a translation string
    if (params && finalTranslation) {
      Object.keys(params).forEach((paramKey) => {
        // Use a global regex to replace all occurrences of {paramKey}
        const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
        finalTranslation = finalTranslation.replace(regex, String(params[paramKey]));
      });
    }

    return finalTranslation;
  }
}