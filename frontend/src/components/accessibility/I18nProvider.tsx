import React, { createContext, useContext, ReactNode } from 'react';
import { useI18n } from '@/hooks/accessibility/useI18n';

// Define the shape of the I18n context
interface I18nContextType {
  t: (key: string, values?: Record<string, string | number>) => string;
  changeLanguage: (lang: string) => void;
  currentLanguage: string;
  dir: 'ltr' | 'rtl';
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
}

// Create context with a default value
const I18nContext = createContext<I18nContextType | null>(null);

// Type for the I18n provider props
interface I18nProviderProps {
  children: ReactNode;
  messages: Record<string, Record<string, string>>;
  initialLang?: string;
}

/**
 * Provider component for internationalization
 */
export function I18nProvider({ children, messages, initialLang }: I18nProviderProps) {
  const i18n = useI18n(messages, initialLang);
  
  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use the I18n context
 */
export function useI18nContext() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  
  return context;
}