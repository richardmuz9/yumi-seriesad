/// <reference types="jest" />
import i18n from '../i18n';
import { formatters } from '../utils/i18n-formatters';

describe('i18n configuration', () => {
  beforeAll(() => {
    i18n.init();
  });

  it('should load English translations by default', () => {
    expect(i18n.language).toBe('en');
  });

  it('should change language', () => {
    i18n.changeLanguage('ja');
    expect(i18n.language).toBe('ja');
  });

  it('should fallback to English for missing translations', () => {
    i18n.changeLanguage('xx'); // Non-existent language
    expect(i18n.language).toBe('en');
  });
});

describe('i18n formatters', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('should format numbers correctly', () => {
    expect(formatters.number(1234.56)).toBe('1,234.56');
  });

  it('should format currency correctly', () => {
    expect(formatters.currency(1234.56)).toBe('$1,234.56');
  });

  it('should format dates correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatters.date(date, { year: 'numeric' })).toBe('2024');
  });

  it('should format relative time correctly', () => {
    expect(formatters.relativeTime(-5, 'minute')).toBe('5 minutes ago');
  });

  it('should format compact numbers correctly', () => {
    expect(formatters.compact(1234567)).toBe('1.2M');
  });
});

describe('i18n token usage', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  it('should handle token interpolation', () => {
    const translated = i18n.t('writing:editor.wordCount', { count: 5 });
    expect(translated).toBe('5 words');
  });

  it('should handle singular/plural forms', () => {
    expect(i18n.t('writing:editor.wordCount', { count: 1 })).toBe('1 word');
    expect(i18n.t('writing:editor.wordCount', { count: 2 })).toBe('2 words');
  });

  it('should handle nested keys', () => {
    const translated = i18n.t('billing.payment.methods.stripe');
    expect(translated).toBe('Credit Card (Stripe)');
  });
}); 