#!/bin/bash
# Script to apply comprehensive fixes to authentication tests

echo "Creating backup folder..."
mkdir -p backup/src/{middleware,tests/utils,models}

echo "Backing up original files..."
cp src/middleware/auth.middleware.ts backup/src/middleware/
cp src/tests/utils/test-app.ts backup/src/tests/utils/
cp src/tests/utils/test-utils.ts backup/src/tests/utils/
cp src/tests/setup.ts backup/src/tests/
cp src/models/user.model.ts backup/src/models/

echo "Applying fixes to authentication middleware and tests..."

# Create a .env file for tests
echo "JWT_SECRET=test-secret" > .env.test
echo "NODE_ENV=test" >> .env.test

# Fix 1: Update the test-app.ts file to use a consistent JWT verification
cat > src/tests/utils/test-app.ts << 'EOL'
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound, errorHandler } from '../../middleware/error.middleware';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';

// Import controllers directly
import * as inventoryController from '../../controllers/inventory.controller';
import * as authController from '../../controllers/auth.controller';
import * as dashboardController from '../../controllers/dashboard.controller';
import * as shipmentController from '../../controllers/shipment.controller';

// For debugging
console.log('Test app loaded - JWT_SECRET:', process.env.JWT_SECRET || 'test-secret');

// Mock authentication middleware for tests - aligned with the production middleware
export const testAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or not Bearer token');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Use the same JWT_SECRET as in the real middleware
    const secret = process.env.JWT_SECRET || 'test-secret';
    console.log(`Verifying token using secret: ${secret.substr(0, 3)}...`);
    
    try {
      // Decode and verify token
      const decoded = jwt.verify(token, secret) as { id?: string; role?: string };
      
      if (!decoded || !decoded.id) {
        console.log('Invalid token payload:', decoded);
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Invalid token payload.',
        });
      }
      
      // Find user by id
      const userId = decoded.id;
      console.log('Looking for user with ID:', userId);
      
      const user = await User.findById(userId);
      
      if (!user) {
        console.log('User not found for ID:', userId);
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. User not found.',
        });
      }
      
      // Add isActive check to match production middleware
      if (user.isActive === false) {
        console.log('User account is deactivated');
        return res.status(403).json({
          success: false,
          message: 'Access denied. Your account has been deactivated.',
        });
      }
      
      // Attach user to request object
      req.user = user;
      console.log('User authenticated successfully');
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token.',
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/**
 * Creates an Express application for testing
 * This app is separate from the main app to avoid side effects during testing
 */
export const createTestApp = (): Express => {
  // Initialize express app
  const app: Express = express();
  
  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for testing
  }));
  app.use(cors());
  app.use(express.json());
  
  // Debug middleware for tests
  app.use((req, res, next) => {
    console.log('TEST REQUEST:', {
      method: req.method,
      url: req.url,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [redacted]' : undefined
      }
    });
    
    // Capture and log response for debugging
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode >= 400) {
        console.log('ERROR RESPONSE:', {
          statusCode: res.statusCode,
          body: typeof body === 'object' ? body : JSON.parse(body)
        });
      }
      
      return originalSend.apply(res, arguments as any);
    };
    
    next();
  });
  
  // Set up routes directly with the controllers
  
  // Auth routes don't need authentication for login/register
  const authRouter = express.Router();
  authRouter.post('/register', authController.register);
  authRouter.post('/login', authController.login);
  authRouter.post('/forgot-password', authController.forgotPassword);
  authRouter.post('/reset-password', authController.resetPassword);
  authRouter.get('/me', testAuthenticate, authController.getCurrentUser);
  
  // Inventory routes
  const inventoryRouter = express.Router();
  // Apply authentication to all inventory routes
  inventoryRouter.use(testAuthenticate);
  inventoryRouter.get('/', inventoryController.getInventoryItems);
  inventoryRouter.get('/stats', inventoryController.getInventoryStats);
  inventoryRouter.get('/low-stock', inventoryController.getLowStockItems);
  inventoryRouter.get('/:id', inventoryController.getInventoryItemById);
  inventoryRouter.post('/', inventoryController.createInventoryItem);
  inventoryRouter.put('/:id', inventoryController.updateInventoryItem);
  inventoryRouter.delete('/:id', inventoryController.deleteInventoryItem);
  inventoryRouter.put('/:id/stock', inventoryController.updateInventoryStock);
  
  // Dashboard routes
  const dashboardRouter = express.Router();
  dashboardRouter.use(testAuthenticate);
  dashboardRouter.get('/stats', dashboardController.getStats);
  dashboardRouter.get('/activities', dashboardController.getActivities);
  dashboardRouter.get('/tasks', dashboardController.getTasks);
  dashboardRouter.get('/system-status', dashboardController.getSystemStatus);
  
  // Shipment document routes
  const shipmentRouter = express.Router();
  shipmentRouter.use(testAuthenticate);
  shipmentRouter.get('/:id/documents', shipmentController.getShipmentDocuments);
  shipmentRouter.post('/:id/documents', shipmentController.addShipmentDocument);
  shipmentRouter.delete('/:id/documents/:documentId', shipmentController.removeShipmentDocument);
  
  // Register routes
  app.use('/api/auth', authRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/shipments', shipmentRouter);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });
  
  // Basic root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({ 
      message: 'Test API',
      version: '1.0.0',
      env: 'test'
    });
  });
  
  // Custom error handling for tests
  app.use(notFound);
  
  // Add custom error handler to capture errors in tests
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('TEST APP ERROR:', {
      message: err.message,
      stack: err.stack,
      status: err.status || 500
    });
    
    // Pass to the regular error handler
    errorHandler(err, req, res, next);
  });
  
  return app;
};
EOL

# Fix 2: Update test-utils.ts to ensure token generation is consistent
cat > src/tests/utils/test-utils.ts << 'EOL'
import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../models/user.model';

// Helper function to create a new test user
export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123',
  role: string = 'user',
  isActive: boolean = true
) => {
  const user = new User({
    email,
    password,
    firstName: 'Test',
    lastName: 'User',
    role,
    isActive,
  });
  
  const savedUser = await user.save();
  console.log(`Created test user: ${savedUser._id} (${email}, ${role})`);
  return savedUser;
};

// Helper function to generate an authentication token for tests
export const generateAuthToken = (userId: string, role: string = 'user'): string => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  console.log(`Generating token for user ${userId} with role ${role} using secret: ${secret.substr(0, 3)}...`);
  
  const token = jwt.sign(
    { id: userId, role }, // Use 'id' for compatibility with auth middleware
    secret,
    { expiresIn: '1h' }
  );
  
  return token;
};

// Helper to perform authenticated requests
export const authenticatedRequest = (app: Express, token: string) => {
  console.log('Creating authenticated request helper with token:', token.substring(0, 15) + '...');
  
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body?: any) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body?: any) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string, body?: any) => request(app).patch(url).set('Authorization', `Bearer ${token}`).send(body),
  };
};

// Helper function to create a MongoDB ObjectId
export const createObjectId = (): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId();
};

// Helper function to create a test inventory item
export const createTestInventoryItem = async (userId: string, data: any = {}) => {
  // Import like this to avoid issues with default exports
  const InventoryItem = require('../../models/inventory.model').default;
  
  const defaultData = {
    sku: `TEST-${Date.now()}`,
    name: 'Test Product',
    description: 'Test product description',
    category: 'Test Category',
    price: 99.99,
    costPrice: 49.99,
    stockQuantity: 100,
    reorderPoint: 10,
    reorderQuantity: 50,
    supplier: createObjectId(),
    location: 'Warehouse A',
    isActive: true,
    createdBy: userId,
  };
  
  const itemData = { ...defaultData, ...data };
  const item = new InventoryItem(itemData);
  
  const savedItem = await item.save();
  console.log(`Created test inventory item: ${savedItem._id} (${itemData.sku})`);
  return savedItem;
};

// Helper to clean up test data
export const cleanupTestData = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
EOL

# Fix 3: Update the setup.ts file to ensure JWT_SECRET is set consistently
cat > src/tests/setup.ts << 'EOL'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

console.log('Test setup - JWT_SECRET:', process.env.JWT_SECRET);
console.log('Test setup - NODE_ENV:', process.env.NODE_ENV);

// MongoDB memory server instance
let mongoServer: MongoMemoryServer;

// Setup before tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect Mongoose to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log(`MongoDB Memory Server running at ${mongoUri}`);
});

// Cleanup after tests
afterAll(async () => {
  // Disconnect Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clear all collections after each test
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
EOL

echo "Fixes applied successfully!"
echo "Run tests with: NODE_ENV=test npm test"