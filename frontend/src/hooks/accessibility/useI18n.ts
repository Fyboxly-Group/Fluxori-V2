import { useCallback, useEffect, useState } from 'react';

type I18nMessages = Record<string, Record<string, string>>;
type MessageValues = Record<string, string | number>;

interface I18nHookResult {
  t: (key: string, values?: MessageValues) => string;
  changeLanguage: (lang: string) => void;
  currentLanguage: string;
  dir: 'ltr' | 'rtl';
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
}

/**
 * Hook to handle internationalization
 * 
 * @param initialMessages - Initial messages object
 * @param initialLang - Initial language code
 * @returns Object with i18n utilities
 */
export function useI18n(
  initialMessages: I18nMessages,
  initialLang: string = navigator.language.split('-')[0] || 'en'
): I18nHookResult {
  const [messages, setMessages] = useState<I18nMessages>(initialMessages);
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLang);
  
  // RTL languages
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  const dir = rtlLanguages.includes(currentLanguage) ? 'rtl' : 'ltr';
  
  // Update document language and direction when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
    document.body.setAttribute('dir', dir);
  }, [currentLanguage, dir]);
  
  /**
   * Change the current language
   * 
   * @param lang - Language code to change to
   */
  const changeLanguage = useCallback((lang: string) => {
    if (messages[lang]) {
      setCurrentLanguage(lang);
      // Save language preference
      localStorage.setItem('preferred-language', lang);
    } else {
      console.warn(`Language "${lang}" is not available`);
    }
  }, [messages]);
  
  /**
   * Load language from localStorage on mount
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && messages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, [messages]);
  
  /**
   * Translate a key with optional interpolation values
   * 
   * @param key - Translation key to look up
   * @param values - Values to interpolate into the translation
   * @returns Translated string
   */
  const t = useCallback((key: string, values?: MessageValues): string => {
    // Get the message for the current language or fall back to English
    const message = 
      (messages[currentLanguage] && messages[currentLanguage][key]) || 
      (messages['en'] && messages['en'][key]) || 
      key;
    
    // If there are no values to interpolate, return the message as is
    if (!values) {
      return message;
    }
    
    // Interpolate values using {{value}} syntax
    return message.replace(/{{(\w+)}}/g, (_, name) => {
      return values[name]?.toString() || `{{${name}}}`;
    });
  }, [messages, currentLanguage]);
  
  /**
   * Format a number according to the current locale
   * 
   * @param value - Number to format
   * @param options - Intl.NumberFormat options
   * @returns Formatted number string
   */
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLanguage, options).format(value);
  }, [currentLanguage]);
  
  /**
   * Format a date according to the current locale
   * 
   * @param value - Date to format
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted date string
   */
  const formatDate = useCallback((value: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(value);
  }, [currentLanguage]);
  
  /**
   * Format a currency value according to the current locale
   * 
   * @param value - Number to format as currency
   * @param currency - Currency code (e.g. "USD")
   * @returns Formatted currency string
   */
  const formatCurrency = useCallback((value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat(currentLanguage, { 
      style: 'currency', 
      currency
    }).format(value);
  }, [currentLanguage]);
  
  /**
   * Format a relative time (e.g. "2 days ago") according to the current locale
   * 
   * @param value - Number of units
   * @param unit - Time unit (e.g. "day", "hour")
   * @returns Formatted relative time string
   */
  const formatRelativeTime = useCallback((value: number, unit: Intl.RelativeTimeFormatUnit): string => {
    return new Intl.RelativeTimeFormat(currentLanguage, { 
      numeric: 'auto'
    }).format(value, unit);
  }, [currentLanguage]);
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    dir,
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime
  };
}