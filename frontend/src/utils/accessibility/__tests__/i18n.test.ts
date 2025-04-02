/**
 * Tests for i18n utilities
 */

import {
  getMessage,
  formatLocalizedDate,
  formatRelativeTime,
  formatLocalizedNumber,
  formatCurrency,
  isRTL,
  rtlLanguages,
  supportedLocales,
} from '../i18n';

describe('i18n Utilities', () => {
  describe('getMessage', () => {
    // Sample messages for testing
    const messages = {
      common: {
        hello: 'Hello, {name}!',
        goodbye: 'Goodbye',
        nested: {
          key: 'Nested message',
        },
      },
      errors: {
        required: '{field} is required',
        invalid: '{field} is invalid',
      },
    };

    it('retrieves a simple message', () => {
      const message = getMessage(messages, 'common.goodbye');
      expect(message).toBe('Goodbye');
    });
    
    it('retrieves a message with interpolated values', () => {
      const message = getMessage(messages, 'common.hello', { name: 'John' });
      expect(message).toBe('Hello, John!');
    });
    
    it('retrieves a nested message', () => {
      const message = getMessage(messages, 'common.nested.key');
      expect(message).toBe('Nested message');
    });
    
    it('returns the default message when the key is not found', () => {
      const message = getMessage(messages, 'common.missing', undefined, 'Default message');
      expect(message).toBe('Default message');
    });
    
    it('returns the key as the default message when no default is provided', () => {
      const message = getMessage(messages, 'common.missing');
      expect(message).toBe('common.missing');
    });
    
    it('handles missing interpolation values', () => {
      const message = getMessage(messages, 'common.hello');
      expect(message).toBe('Hello, {name}!');
    });
    
    it('interpolates multiple values', () => {
      const message = getMessage(messages, 'errors.invalid', { field: 'Email' });
      expect(message).toBe('Email is invalid');
    });
  });
  
  describe('formatLocalizedDate', () => {
    // Reference date for testing (June 12, 2023 15:30:45)
    const testDate = new Date(2023, 5, 12, 15, 30, 45);
    
    it('formats a date with the default locale and format', () => {
      // Default locale is 'en', default format is 'PP'
      const formattedDate = formatLocalizedDate(testDate);
      
      // Should be something like "Jun 12, 2023"
      expect(formattedDate).toMatch(/Jun 12, 2023/i);
    });
    
    it('formats a date with a custom format', () => {
      const formattedDate = formatLocalizedDate(testDate, 'MM/dd/yyyy');
      expect(formattedDate).toBe('06/12/2023');
    });
    
    it('formats a date in a different locale', () => {
      // Format in French
      const formattedDate = formatLocalizedDate(testDate, 'P', 'fr');
      
      // French date format is dd/MM/yyyy
      expect(formattedDate).toMatch(/12\/06\/2023/i);
    });
    
    it('falls back to English when an unsupported locale is provided', () => {
      // Format with an unsupported locale
      const formattedDate = formatLocalizedDate(testDate, 'PP', 'unknown');
      
      // Should still use English format
      expect(formattedDate).toMatch(/Jun 12, 2023/i);
    });
  });
  
  describe('formatRelativeTime', () => {
    it('formats relative time in the past', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      
      const relativeTime = formatRelativeTime(pastDate);
      
      // Should be something like "1 hour ago"
      expect(relativeTime).toMatch(/hour ago/i);
    });
    
    it('formats relative time in the future', () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day in the future
      
      const relativeTime = formatRelativeTime(futureDate);
      
      // Should be something like "in 1 day"
      expect(relativeTime).toMatch(/in 1 day/i);
    });
    
    it('formats relative time with a custom base date', () => {
      const baseDate = new Date(2023, 0, 1); // January 1, 2023
      const targetDate = new Date(2023, 0, 2); // January 2, 2023
      
      const relativeTime = formatRelativeTime(targetDate, baseDate);
      
      // Should be "in 1 day" relative to the base date
      expect(relativeTime).toMatch(/in 1 day/i);
    });
    
    it('formats relative time in a different locale', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      
      // Format in French
      const relativeTime = formatRelativeTime(pastDate, now, 'fr');
      
      // Should contain "heure" (French for "hour")
      expect(relativeTime).toContain('heure');
    });
  });
  
  describe('formatLocalizedNumber', () => {
    it('formats a number with the default locale', () => {
      const formattedNumber = formatLocalizedNumber(1234567.89);
      
      // In English: 1,234,567.89
      expect(formattedNumber).toBe('1,234,567.89');
    });
    
    it('formats a number in a different locale', () => {
      // Format in French
      const formattedNumber = formatLocalizedNumber(1234567.89, 'fr');
      
      // In French: 1 234 567,89
      expect(formattedNumber).toMatch(/1.234.567,89/i);
    });
    
    it('formats a number with custom options', () => {
      const formattedNumber = formatLocalizedNumber(1234.56, 'en', {
        maximumFractionDigits: 1,
      });
      
      // Should round to 1 decimal place
      expect(formattedNumber).toBe('1,234.6');
    });
  });
  
  describe('formatCurrency', () => {
    it('formats a currency value with the default locale and currency', () => {
      const formattedCurrency = formatCurrency(1234.56);
      
      // Default is USD in English: $1,234.56
      expect(formattedCurrency).toBe('$1,234.56');
    });
    
    it('formats a currency value with a different currency code', () => {
      const formattedCurrency = formatCurrency(1234.56, 'EUR');
      
      // EUR in English: €1,234.56
      expect(formattedCurrency).toContain('€');
    });
    
    it('formats a currency value in a different locale', () => {
      // Format in French with Euro
      const formattedCurrency = formatCurrency(1234.56, 'EUR', 'fr');
      
      // In French, the Euro symbol usually comes after the number
      expect(formattedCurrency).toMatch(/1.234,56.€/i);
    });
  });
  
  describe('isRTL', () => {
    it('identifies RTL languages correctly', () => {
      // Arabic is RTL
      expect(isRTL('ar')).toBe(true);
      
      // Hebrew is RTL
      expect(isRTL('he')).toBe(true);
      
      // English is not RTL
      expect(isRTL('en')).toBe(false);
      
      // French is not RTL
      expect(isRTL('fr')).toBe(false);
    });
    
    it('returns false for unknown languages', () => {
      expect(isRTL('unknown')).toBe(false);
    });
  });
  
  describe('supportedLocales', () => {
    it('includes the expected locales', () => {
      // Should have English
      expect(supportedLocales).toHaveProperty('en', 'English');
      
      // Should have Spanish
      expect(supportedLocales).toHaveProperty('es', 'Español');
      
      // Should have Arabic
      expect(supportedLocales).toHaveProperty('ar', 'العربية');
    });
  });
  
  describe('rtlLanguages', () => {
    it('includes common RTL languages', () => {
      // Should include Arabic
      expect(rtlLanguages).toContain('ar');
      
      // Should include Hebrew
      expect(rtlLanguages).toContain('he');
      
      // Should include Farsi
      expect(rtlLanguages).toContain('fa');
    });
    
    it('does not include LTR languages', () => {
      // Should not include English
      expect(rtlLanguages).not.toContain('en');
      
      // Should not include French
      expect(rtlLanguages).not.toContain('fr');
      
      // Should not include Japanese
      expect(rtlLanguages).not.toContain('ja');
    });
  });
});