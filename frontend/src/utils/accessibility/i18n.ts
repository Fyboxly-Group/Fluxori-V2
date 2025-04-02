/**
 * Internationalization utilities for supporting multiple languages
 * and localization formats.
 */

import { format as formatDate, formatDistance } from 'date-fns';
import { enUS, es, fr, de, ar, zhCN } from 'date-fns/locale';

// Supported locales
export const supportedLocales = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  zh: '中文',
};

// Map language codes to date-fns locales
const dateLocales: Record<string, Locale> = {
  en: enUS,
  es,
  fr,
  de,
  ar,
  zh: zhCN,
};

// RTL languages
export const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'dv', 'ha', 'ji', 'ps', 'sd', 'ug', 'yi'];

export interface I18nMessages {
  [key: string]: string | I18nMessages;
}

/**
 * Gets a localized message from a nested messages object
 * 
 * @param messages - The messages object containing translations
 * @param key - The dot-notation key to retrieve (e.g., "errors.required")
 * @param values - Values to interpolate into the message
 * @param defaultMessage - Fallback if the key is not found
 */
export function getMessage(
  messages: I18nMessages,
  key: string,
  values?: Record<string, string | number>,
  defaultMessage: string = key
): string {
  // Split the key by dots to navigate nested objects
  const keyParts = key.split('.');
  let current: any = messages;

  // Navigate through the nested messages object
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return interpolateMessage(defaultMessage, values);
    }
  }

  if (typeof current === 'string') {
    return interpolateMessage(current, values);
  }

  return interpolateMessage(defaultMessage, values);
}

/**
 * Interpolates values into a message string
 * 
 * @param message - The message with placeholders like {name}
 * @param values - Values to interpolate into the message
 */
function interpolateMessage(
  message: string,
  values?: Record<string, string | number>
): string {
  if (!values) return message;

  return message.replace(/{([^}]+)}/g, (_, key) => {
    return values[key] !== undefined ? String(values[key]) : `{${key}}`;
  });
}

/**
 * Formats a date according to the specified locale and format
 * 
 * @param date - The date to format
 * @param formatStr - The format string (defaults to "PP" - date with time)
 * @param locale - The locale code (e.g., 'en', 'fr')
 */
export function formatLocalizedDate(
  date: Date | number,
  formatStr: string = 'PP',
  locale: string = 'en'
): string {
  const dateLocale = dateLocales[locale] || dateLocales.en;
  return formatDate(date, formatStr, { locale: dateLocale });
}

/**
 * Formats a relative time (e.g., "2 days ago") according to the locale
 * 
 * @param date - The date to format relative to now
 * @param baseDate - The base date to compare against (defaults to now)
 * @param locale - The locale code (e.g., 'en', 'fr')
 */
export function formatRelativeTime(
  date: Date | number,
  baseDate: Date | number = new Date(),
  locale: string = 'en'
): string {
  const dateLocale = dateLocales[locale] || dateLocales.en;
  return formatDistance(date, baseDate, { locale: dateLocale, addSuffix: true });
}

/**
 * Formats a number according to the specified locale
 * 
 * @param value - The number to format
 * @param locale - The locale code (e.g., 'en', 'fr')
 * @param options - Intl.NumberFormat options
 */
export function formatLocalizedNumber(
  value: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a currency value according to the specified locale and currency
 * 
 * @param value - The number to format
 * @param currencyCode - The ISO currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale code (e.g., 'en', 'fr')
 */
export function formatCurrency(
  value: number,
  currencyCode: string = 'USD',
  locale: string = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

/**
 * Checks if the given language is right-to-left (RTL)
 * 
 * @param lang - The language code
 */
export function isRTL(lang: string): boolean {
  return rtlLanguages.includes(lang);
}