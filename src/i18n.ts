/// <reference types="vite/client" />
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const modules = import.meta.glob('./locales/*/*.json', { eager: true });

const resources: Record<string, any> = {};

for (const path in modules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (match) {
    const lang = match[1];
    
    if (!resources[lang]) {
      resources[lang] = { translation: {} };
    }
    
    const content = (modules[path] as any).default || modules[path];
    resources[lang].translation = {
      ...resources[lang].translation,
      ...content
    };
  }
}

console.log('i18n resources loaded:', Object.keys(resources));

i18n
  // Detects user language from browser
  .use(LanguageDetector)
  // Passes i18n down to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback language if detection fails
    debug: true,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

// Function to update HTML dir and lang attributes
const updateDocumentDirection = (lng: string) => {
  const rtlLanguages = ['ar', 'fa', 'ur'];
  const baseLng = lng.split('-')[0];
  const dir = rtlLanguages.includes(baseLng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

// Update direction on language change
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Set initial direction based on detected language
if (i18n.language) {
  updateDocumentDirection(i18n.language);
}

export default i18n;
