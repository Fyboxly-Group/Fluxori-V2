#!/usr/bin/env node

/**
 * Test Utilities Fixer
 * ====================
 * This script completely fixes the test utility files by replacing them with correct versions.
 * 
 * Usage:
 * node scripts/fix-test-utils.js
 */

const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🔧 Test Utilities Fixer');
console.log('\x1b[36m%s\x1b[0m', '====================');
console.log('Replacing test utility files with fixed versions\n');

// Test utility files content
const fileContents = {
  'src/tests/utils/test-utils.ts': `import { Request, Response } from 'express';
import { createMockRequest, createMockResponse } from './test-app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Setup and teardown for MongoDB memory server in tests
 */
export const setupMongoMemoryServer = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  return {
    mongoServer,
    mongoose,
  };
};

/**
 * Clean up MongoDB memory server after tests
 */
export const teardownMongoMemoryServer = async ({ mongoServer, mongoose }) => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

/**
 * Create a mock controller context for testing
 * @param reqOverrides Override properties for the mock request
 * @param resOverrides Override properties for the mock response
 * @returns Object with mock request, response, and next function
 */
export function createMockContext(
  reqOverrides: Partial<Request> = {}, 
  resOverrides: Partial<Response> = {}
) {
  const req = createMockRequest(reqOverrides);
  const res = createMockResponse();
  const next = jest.fn();

  // Apply any custom response overrides
  Object.assign(res, resOverrides);

  return { req, res, next };
}

/**
 * Mock authenticated user context
 * @param user The user object to set in the request
 * @returns Mock context with authenticated user
 */
export function createAuthenticatedContext(user = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  organizationId: 'test-org-id',
}) {
  return createMockContext({ user });
}

/**
 * Helper to get a random MongoDB ObjectId for testing
 * @returns Random MongoDB ObjectId as string
 */
export function getRandomObjectId() {
  return new mongoose.Types.ObjectId().toString();
}

/**
 * Create an async wrapper for testing Express route handlers
 * @param fn The async route handler function to test
 * @returns A function that catches and forwards errors to next
 */
export function asyncHandler(fn) {
  return async function(req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}`,

  'src/tests/utils/test-app.ts': `import { Express, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../../config/swagger';
import mongoose from 'mongoose';
import logger from '../../config/logger';
import { authRoutes } from '../../routes/auth.route';
import { exampleRoutes } from '../../routes/example.route';
import { customerRoutes } from '../../routes/customer.route';
import { uploadRoutes } from '../../routes/upload.route';
import { dashboardRoutes } from '../../routes/dashboard.route';
import { inventoryRoutes } from '../../routes/inventory.route';
import { projectRoutes } from '../../routes/project.route';
import { taskRoutes } from '../../routes/task.route';
import { milestoneRoutes } from '../../routes/milestone.route';
import { shipmentRoutes } from '../../routes/shipment.route';
import { warehouseRoutes } from '../../routes/warehouse.route';
import webhookRoutes from '../../routes/webhook.route';
import inventoryStockRoutes from '../../routes/inventory-stock.route';
import inventoryAlertRoutes from '../../routes/inventory-alert.route';
import analyticsRoutes from '../../routes/analytics.route';
import appConfig from '../../config';
import { errorHandler } from '../../middleware/error.middleware';
import { requestLogger } from '../../middleware/logging.middleware';
import { setupPassport } from '../../config/passport';

/**
 * Create a test instance of the Express app with all middleware and routes
 * @returns Express application instance
 */
export function createTestApp(options: {
  enableLogging?: boolean,
  enableDatabase?: boolean,
  enableAuth?: boolean,
  enableErrorHandler?: boolean,
} = {}): Express {
  // Apply defaults
  const opts = {
    enableLogging: false,
    enableDatabase: false,
    enableAuth: true,
    enableErrorHandler: true,
    ...options,
  };

  // Create Express instance
  const app = express();

  // Standard middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  // Logging middleware (optional)
  if (opts.enableLogging) {
    app.use(morgan('dev'));
    app.use(requestLogger);
  }

  // Session and auth middleware (optional)
  if (opts.enableAuth) {
    app.use(session({
      secret: appConfig.jwt.secret,
      resave: false,
      saveUninitialized: false,
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    setupPassport(passport);
  }

  // Database connection (optional)
  if (opts.enableDatabase) {
    mongoose.connect(appConfig.mongodb.uri)
      .then(() => {
        logger.info('MongoDB connected successfully');
      })
      .catch((err) => {
        logger.error('MongoDB connection error:', err);
      });
  }

  // API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/examples', exampleRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/milestones', milestoneRoutes);
  app.use('/api/shipments', shipmentRoutes);
  app.use('/api/warehouses', warehouseRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/inventory-stock', inventoryStockRoutes);
  app.use('/api/inventory-alerts', inventoryAlertRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Error handling middleware (optional)
  if (opts.enableErrorHandler) {
    app.use(errorHandler);
  }

  return app;
}

/**
 * Creates a simple mock request object for testing
 * @param overrides Properties to override in the mock request
 * @returns Mock request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    session: {},
    user: null,
    ...overrides,
  } as Request;

  return req;
}

/**
 * Creates a simple mock response object for testing
 * @returns Mock response object with jest mocks for common methods
 */
export function createMockResponse(): Response {
  const res = {} as Response;
  
  // Status method returns this for chaining
  res.status = jest.fn().mockReturnThis();
  
  // Response methods
  res.json = jest.fn();
  res.send = jest.fn();
  res.end = jest.fn();
  res.sendStatus = jest.fn();
  res.redirect = jest.fn();
  res.render = jest.fn();
  res.type = jest.fn().mockReturnThis();
  res.format = jest.fn();
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  res.location = jest.fn().mockReturnThis();
  res.set = jest.fn().mockReturnThis();
  res.get = jest.fn();
  res.append = jest.fn().mockReturnThis();
  res.attachment = jest.fn().mockReturnThis();
  res.download = jest.fn();
  res.links = jest.fn().mockReturnThis();
  res.locals = {};
  res.headersSent = false;
  
  return res;
}

export default {
  createTestApp,
  createMockRequest,
  createMockResponse,
};`,

  'src/tests/setup.ts': `/**
 * Jest Setup
 * This file is automatically loaded by Jest before running tests.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load environment variables from .env file
dotenv.config({ path: '.env.test' });

// Global variables for MongoDB memory server
let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri);
  
  console.log('Connected to in-memory MongoDB instance');
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('Disconnected from in-memory MongoDB instance');
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Set Jest timeout (important for slower CI environments)
jest.setTimeout(30000);

// Suppress console output during tests (optional)
// Comment these out if you need to debug
global.console.log = jest.fn();
global.console.info = jest.fn();
global.console.warn = jest.fn();
global.console.error = jest.fn();`
};

// Replace a file with fixed content
function fixFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return false;
  }
  
  try {
    // Get the fixed content for this file
    const fixedContent = fileContents[filePath];
    
    if (!fixedContent) {
      console.log(`No fixed content available for ${filePath}`);
      return false;
    }
    
    // Write the fixed content
    fs.writeFileSync(fullPath, fixedContent, 'utf-8');
    console.log(`\x1b[32m✓ Fixed ${filePath}\x1b[0m`);
    return true;
  } catch (error) {
    console.error(`\x1b[31m× Error processing ${filePath}: ${error.message}\x1b[0m`);
    return false;
  }
}

// Main execution
function main() {
  let modifiedCount = 0;
  
  Object.keys(fileContents).forEach(file => {
    const modified = fixFile(file);
    if (modified) {
      modifiedCount++;
    }
  });
  
  console.log(`\n\x1b[32m🎉 Fixed ${modifiedCount} test utility files\x1b[0m`);
  console.log('\nRun TypeScript check to verify the changes:');
  console.log('$ npx tsc --skipLibCheck --noEmit');
}

main();