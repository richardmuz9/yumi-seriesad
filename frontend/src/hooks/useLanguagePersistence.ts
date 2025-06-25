import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useLanguagePersistence = () => {
  const { language, setLanguage } = useLanguage();

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'ja', 'zh', 'ko'].includes(savedLanguage)) {
      setLanguage(savedLanguage as 'en' | 'ja' | 'zh' | 'ko');
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return { language, setLanguage };
}; 