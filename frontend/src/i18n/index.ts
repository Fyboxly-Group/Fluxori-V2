import enTranslations from './locales/en.json'

// Define supported languages
export const SUPPORTED_LANGUAGES = ['en'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

// Interface for translation handling
export interface I18n {
  t: (key: string, params?: Record<string, string | number>) => string
  locale: SupportedLanguage
  changeLanguage: (lang: SupportedLanguage) => void
}

// Translation resources
const resources = {
  en: enTranslations,
}

// Interpolate parameters in translation strings
const interpolate = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text
  
  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    return result.replace(regex, String(value))
  }, text)
}

// Get nested translation value by key path
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.')
  return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj)
}

// Create i18n instance
export const createI18n = (initialLocale: SupportedLanguage = 'en'): I18n => {
  // State
  let currentLocale: SupportedLanguage = initialLocale
  
  // Translate function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(resources[currentLocale], key)
    
    if (translation === undefined) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    
    return interpolate(translation, params)
  }
  
  // Change language function
  const changeLanguage = (lang: SupportedLanguage): void => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language not supported: ${lang}`)
      return
    }
    
    currentLocale = lang
    
    // Store language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang)
    }
  }
  
  return {
    t,
    get locale() {
      return currentLocale
    },
    changeLanguage,
  }
}

// Get user's preferred language
export const getUserPreferredLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en'
  
  // Check localStorage
  const storedLang = localStorage.getItem('preferred-language') as SupportedLanguage | null
  if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
    return storedLang
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang
  }
  
  // Default to English
  return 'en'
}

// Export default i18n instance
export const i18n = createI18n(
  typeof window !== 'undefined' ? getUserPreferredLanguage() : 'en'
)