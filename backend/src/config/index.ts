/**
 * Application configuration constants and settings
 */
export interface AppConfig {
  // Server configuration
  port: string | number;
  nodeEnv: string;

  // MongoDB configuration
  mongoUri: string;
  
  // JWT configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Storage configuration
  storageProvider: string;
  storageBaseUrl: string;
  localStoragePath: string;
  
  // Email configuration
  emailFrom: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  
  // Logging configuration
  logging: {
    level: string;
  };
  
  // Environment
  env: string;
  
  // Development flag
  isDev?: boolean;
  
  // API rate limiting
  rateLimit: {
    windowMs: number;
    max: number;
  };
  
  // CORS settings
  corsOrigin: string;
  
  // API version
  apiVersion: string;
}

const config: AppConfig = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/fluxori',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fluxori-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  
  // Storage configuration
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  storageBaseUrl: process.env.STORAGE_BASE_URL || 'http://localhost:5000/uploads/',
  localStoragePath: process.env.LOCAL_STORAGE_PATH || 'uploads',
  
  // Email configuration
  emailFrom: process.env.EMAIL_FROM || 'noreply@fluxori.com',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Environment - ensure it matches nodeEnv for backwards compatibility
  env: process.env.NODE_ENV || 'development',
  
  // Development flag
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  
  // API rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // API version
  apiVersion: 'v1'
};

export default config;