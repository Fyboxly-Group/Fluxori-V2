import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound, errorHandler } from '../../middleware/error.middleware';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import multer from 'multer';

// Import controllers directly
import * as inventoryController from '../../controllers/inventory.controller';
import * as authController from '../../controllers/auth.controller';
import * as dashboardController from '../../controllers/dashboard.controller';
import * as shipmentController from '../../controllers/shipment.controller';
import * as uploadController from '../../controllers/upload.controller';
import * as inventoryAlertController from '../../controllers/inventory-alert.controller';
import * as customerController from '../../controllers/customer.controller';
import * as projectController from '../../controllers/project.controller';
import * as milestoneController from '../../controllers/milestone.controller';
import * as taskController from '../../controllers/task.controller';

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
      path: req.path,
      query: req.query,
      params: req.params,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [redacted]' : undefined
      }
    });
    
    // Capture and log response for debugging
    const originalSend = res.send;
    res.send = function(body) {
      console.log('TEST RESPONSE:', {
        statusCode: res.statusCode,
        headers: res._headers,
        body: typeof body === 'string' ? JSON.parse(body) : body
      });
      
      return originalSend.apply(res, arguments as any);
    };
    
    next();
  });
  
  // Add error logging middleware before the routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('TEST MIDDLEWARE ERROR:', {
      message: err.message,
      stack: err.stack
    });
    next(err);
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
  
  // Configure multer for memory storage for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });

  // Upload routes
  const uploadRouter = express.Router();
  uploadRouter.use(testAuthenticate);
  // Get a signed URL for direct upload to GCS
  uploadRouter.get('/signed-url', uploadController.getSignedUploadUrl);
  // Upload file to GCS
  uploadRouter.post('/', upload.single('file'), uploadController.uploadFile);
  // Delete file from GCS
  uploadRouter.delete('/', uploadController.deleteFile);
  // Temporary upload with fallback to server
  uploadRouter.post('/temp', upload.single('file'), uploadController.handleTempUpload);
  // Inventory image management routes
  uploadRouter.get('/inventory-images', uploadController.getInventoryImageUploadUrls);
  uploadRouter.post('/inventory/:id/images', uploadController.updateInventoryImages);
  uploadRouter.delete('/inventory/:id/images', uploadController.deleteInventoryImage);

  // Inventory Alert routes
  const inventoryAlertRouter = express.Router();
  inventoryAlertRouter.use(testAuthenticate);
  inventoryAlertRouter.get('/', inventoryAlertController.getInventoryAlerts);
  inventoryAlertRouter.get('/stats', inventoryAlertController.getAlertStats);
  inventoryAlertRouter.get('/:id', inventoryAlertController.getInventoryAlertById);
  inventoryAlertRouter.post('/', inventoryAlertController.createInventoryAlert);
  inventoryAlertRouter.put('/:id', inventoryAlertController.updateInventoryAlert);
  inventoryAlertRouter.delete('/:id', inventoryAlertController.deleteInventoryAlert);
  inventoryAlertRouter.put('/:id/assign', inventoryAlertController.assignInventoryAlert);
  inventoryAlertRouter.put('/:id/resolve', inventoryAlertController.resolveInventoryAlert);

  // Customer routes
  const customerRouter = express.Router();
  customerRouter.use(testAuthenticate);
  customerRouter.get('/', customerController.getCustomers);
  customerRouter.get('/stats', customerController.getCustomerStats);
  customerRouter.get('/:id', customerController.getCustomerById);
  customerRouter.post('/', customerController.createCustomer);
  customerRouter.put('/:id', customerController.updateCustomer);
  customerRouter.delete('/:id', customerController.deleteCustomer);

  // Project routes
  const projectRouter = express.Router();
  projectRouter.use(testAuthenticate);
  projectRouter.get('/', projectController.getProjects);
  projectRouter.get('/:id', projectController.getProjectById);
  projectRouter.post('/', projectController.createProject);
  projectRouter.put('/:id', projectController.updateProject);
  projectRouter.delete('/:id', projectController.deleteProject);
  projectRouter.post('/:id/documents', projectController.addProjectDocument);
  projectRouter.delete('/:id/documents/:documentId', projectController.removeProjectDocument);

  // Milestone routes
  const milestoneRouter = express.Router();
  milestoneRouter.use(testAuthenticate);
  milestoneRouter.get('/', milestoneController.getMilestones);
  milestoneRouter.get('/:id', milestoneController.getMilestoneById);
  milestoneRouter.post('/', milestoneController.createMilestone);
  milestoneRouter.put('/:id', milestoneController.updateMilestone);
  milestoneRouter.delete('/:id', milestoneController.deleteMilestone);
  milestoneRouter.put('/:id/approve', milestoneController.updateMilestoneApproval);

  // Task routes
  const taskRouter = express.Router();
  taskRouter.use(testAuthenticate);
  taskRouter.get('/', taskController.getTasks);
  taskRouter.get('/:id', taskController.getTaskById);
  taskRouter.post('/', taskController.createTask);
  taskRouter.put('/:id', taskController.updateTask);
  taskRouter.delete('/:id', taskController.deleteTask);
  taskRouter.put('/:id/status', taskController.updateTaskStatus);
  taskRouter.post('/:id/comments', taskController.addTaskComment);
  taskRouter.delete('/:id/comments/:commentId', taskController.removeTaskComment);

  // Register routes
  app.use('/api/auth', authRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/shipments', shipmentRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/inventory-alerts', inventoryAlertRouter);
  app.use('/api/customers', customerRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/milestones', milestoneRouter);
  app.use('/api/tasks', taskRouter);
  
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
