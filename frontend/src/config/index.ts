// Configuration module for accessing environment variables

// Define the configuration type
interface AppConfig {
  // API
  api: {
    url: string
    timeout: number
  }
  
  // Auth
  auth: {
    enabled: boolean
  }
  
  // App
  app: {
    name: string
    version: string
    description: string
    contactEmail: string
  }
  
  // Features
  features: {
    analytics: boolean
    notifications: boolean
  }
}

// Get boolean value from environment variable
const getBooleanValue = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true'
}

// Get number value from environment variable
const getNumberValue = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

// Get string value from environment variable
const getStringValue = (value: string | undefined, defaultValue: string): string => {
  return value || defaultValue
}

// Create and export the configuration object
export const config: AppConfig = {
  api: {
    url: getStringValue(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:3001/api'),
    timeout: getNumberValue(process.env.NEXT_PUBLIC_API_TIMEOUT, 10000),
  },
  
  auth: {
    enabled: getBooleanValue(process.env.NEXT_PUBLIC_AUTH_ENABLED, true),
  },
  
  app: {
    name: getStringValue(process.env.NEXT_PUBLIC_APP_NAME, 'Fluxori'),
    version: getStringValue(process.env.NEXT_PUBLIC_APP_VERSION, '2.0.0'),
    description: getStringValue(
      process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      'Modern SaaS platform'
    ),
    contactEmail: getStringValue(
      process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      'support@fluxori.com'
    ),
  },
  
  features: {
    analytics: getBooleanValue(process.env.NEXT_PUBLIC_FEATURE_ANALYTICS, false),
    notifications: getBooleanValue(process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS, false),
  },
}