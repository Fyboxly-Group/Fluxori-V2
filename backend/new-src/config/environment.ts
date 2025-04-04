/**
 * Environment configuration with strong typing
 * Loads and validates environment variables
 */
import dotenv from 'dotenv';
import { ValidationError } from '../types/error.types';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable configuration interface
 */
export interface IEnvironmentConfig {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_VERSION: string;
  HOST: string;
  CORS_ORIGINS: string[];
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Database
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug' | 'silly';
  
  // Cloud storage
  STORAGE_BUCKET: string;
  STORAGE_PROVIDER: 'gcs' | 'aws' | 'azure' | 'local';
  
  // Feature flags
  ENABLE_SWAGGER: boolean;
  ENABLE_RATE_LIMITING: boolean;
  ENABLE_REQUEST_LOGGING: boolean;
}

/**
 * Gets a required environment variable
 * @param key - Environment variable name
 * @throws {ValidationError} If the environment variable is not set
 * @returns The environment variable value
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ValidationError(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value || defaultValue;
}

/**
 * Gets an environment variable as a boolean
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Boolean representation of the environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Gets an environment variable as a number
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Number representation of the environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Gets an environment variable as an array
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 * @param separator - Separator character (default: comma)
 * @returns Array representation of the environment variable
 */
function getArrayEnv(key: string, defaultValue: string[], separator = ','): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(separator).map(item => item.trim());
}

/**
 * Environment configuration with validation
 */
export const env: IEnvironmentConfig = {
  // Server
  NODE_ENV: getOptionalEnv('NODE_ENV', 'development') as IEnvironmentConfig['NODE_ENV'],
  PORT: getNumberEnv('PORT', 3000),
  API_VERSION: getOptionalEnv('API_VERSION', 'v1'),
  HOST: getOptionalEnv('HOST', 'localhost'),
  CORS_ORIGINS: getArrayEnv('CORS_ORIGINS', ['http://localhost:3000']),
  
  // Authentication
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getOptionalEnv('JWT_EXPIRES_IN', '1h'),
  JWT_REFRESH_SECRET: getRequiredEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getOptionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  
  // Database
  MONGODB_URI: getRequiredEnv('MONGODB_URI'),
  MONGODB_DB_NAME: getOptionalEnv('MONGODB_DB_NAME', 'fluxori'),
  
  // Logging
  LOG_LEVEL: getOptionalEnv('LOG_LEVEL', 'info') as IEnvironmentConfig['LOG_LEVEL'],
  
  // Cloud storage
  STORAGE_BUCKET: getOptionalEnv('STORAGE_BUCKET', 'fluxori-storage'),
  STORAGE_PROVIDER: getOptionalEnv('STORAGE_PROVIDER', 'local') as IEnvironmentConfig['STORAGE_PROVIDER'],
  
  // Feature flags
  ENABLE_SWAGGER: getBooleanEnv('ENABLE_SWAGGER', true),
  ENABLE_RATE_LIMITING: getBooleanEnv('ENABLE_RATE_LIMITING', true),
  ENABLE_REQUEST_LOGGING: getBooleanEnv('ENABLE_REQUEST_LOGGING', true),
};

/**
 * Validates that all required environment variables are set
 * @throws {ValidationError} If any required environment variable is missing
 */
export function validateEnvironment(): void {
  try {
    // Verify critical environment variables
    getRequiredEnv('JWT_SECRET');
    getRequiredEnv('JWT_REFRESH_SECRET');
    getRequiredEnv('MONGODB_URI');
    
    // Database connection string check
    if (!env.MONGODB_URI.startsWith('mongodb')) {
      throw new ValidationError('MONGODB_URI must be a valid MongoDB connection string');
    }
    
    // Log environment mode
    console.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}