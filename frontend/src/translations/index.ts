import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Select Writing Mode': 'Select Writing Mode',
      'Writing Helper': 'Writing Helper',
      'Report Writer': 'Report Writer',
      'AI-powered writing assistant for creative content': 'AI-powered writing assistant for creative content',
      'Professional report writing and formatting': 'Professional report writing and formatting',
      'Content optimization': 'Content optimization',
      'Style suggestions': 'Style suggestions',
      'Grammar checking': 'Grammar checking',
      'Readability analysis': 'Readability analysis',
      'Report templates': 'Report templates',
      'Citation management': 'Citation management',
      'Data visualization': 'Data visualization',
      'Export to multiple formats': 'Export to multiple formats',
      'Customize': 'Customize',
      'Done': 'Done',
      'Change Background': 'Change Background',
      'Reset Layout': 'Reset Layout'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Helper function to get translations for a specific language
export const getTranslation = (language: string) => {
  const translations = resources[language as keyof typeof resources]?.translation || resources.en.translation;
  return {
    title: translations['Writing Helper'] || 'Writing Helper',
    ...translations
  };
};

export default i18n;
