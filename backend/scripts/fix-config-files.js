/**
 * Specialized fix script for config files with unterminated strings
 */

const fs = require('fs');
const path = require('path');

// Fix config.ts - has an unterminated string at the end
const CONFIG_FILE_PATH = path.join(__dirname, '../src/config/config.ts');
let configContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
configContent = configContent.replace(/';$/, '');
fs.writeFileSync(CONFIG_FILE_PATH, configContent);
console.log(`Fixed unterminated string in ${CONFIG_FILE_PATH}`);

// Fix index.ts in config directory
const INDEX_FILE_PATH = path.join(__dirname, '../src/config/index.ts');

const fixedIndexContent = `/**
 * Configuration Module
 * 
 * Exports environment-specific configuration values
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Environment detection
const env = process.env.NODE_ENV || 'development';

// Base configuration 
const baseConfig = {
  env,
  isDev: env === 'development',
  isTest: env === 'test',
  isProd: env === 'production',
  name: process.env.APP_NAME || 'Fluxori API',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fluxori',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Export configuration
export default baseConfig;`;

fs.writeFileSync(INDEX_FILE_PATH, fixedIndexContent);
console.log(`Fixed config index file: ${INDEX_FILE_PATH}`);