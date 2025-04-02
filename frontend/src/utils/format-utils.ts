/**
 * Formatting utility functions
 */

/**
 * Formats a number as currency
 * @param value The value to format
 * @param currency The ISO currency code (default: USD)
 * @param locale The locale (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number with commas as thousands separators
 * @param value The value to format
 * @returns Formatted string with thousand separators
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Formats a date to a readable string
 * @param date The date to format
 * @param format The format type ('short', 'medium', 'long', 'full')
 * @param locale The locale (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium', locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, { dateStyle: format });
}

/**
 * Formats a time to a readable string
 * @param date The date to format
 * @param format The format type ('short', 'medium', 'long', 'full')
 * @param locale The locale (default: en-US)
 * @returns Formatted time string
 */
export function formatTime(date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'short', locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString(locale, { timeStyle: format });
}

/**
 * Formats a date and time to a readable string
 * @param date The date to format
 * @param format The format type ('short', 'medium', 'long', 'full')
 * @param locale The locale (default: en-US)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium', locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString(locale, { dateStyle: format, timeStyle: format });
}

/**
 * Formats a percentage value
 * @param value The value to format as percentage (0.1 = 10%)
 * @param decimals Number of decimal places
 * @param locale The locale (default: en-US)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
