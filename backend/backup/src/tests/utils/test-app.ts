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
console.log('Loading test-app.ts');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'test-secret');

// Mock authentication middleware for tests
export const testAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token in test mode (using same secret from test-utils)
    const secret = process.env.JWT_SECRET || 'test-secret';
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as any;
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token.',
      });
    }
    
    if (!decoded || (!decoded.id && !decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token payload.',
      });
    }
    
    // Find user by id (support both id and userId for tests)
    const userId = decoded.id || decoded.userId;
    
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.',
      });
    }
    
    // Add isActive check to match production auth middleware
    if (!user.isActive && user.isActive !== undefined) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Your account has been deactivated.',
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
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
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  
  // Debug middleware for tests
  app.use((req, res, next) => {
    console.log('TEST APP REQUEST:', {
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
      return originalSend.apply(res, arguments);
    };
    
    next();
  });
  
  // Set up routes directly with the controllers
  
  // Auth routes don't need authentication
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
  app.use((err, req, res, next) => {
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