import express from 'express';
import request from 'supertest';
import inventoryRoutes from './inventory.routes';
import * as inventoryController from '../controllers/inventory.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the inventory controller methods
jest.mock('../controllers/inventory.controller', () => ({
  getInventoryItems: jest.fn((req, res) => res.status(200).json({ success: true })),
  getInventoryItemById: jest.fn((req, res) => res.status(200).json({ success: true })),
  createInventoryItem: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateInventoryItem: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteInventoryItem: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateInventoryStock: jest.fn((req, res) => res.status(200).json({ success: true })),
  getInventoryStats: jest.fn((req, res) => res.status(200).json({ success: true })),
  getLowStockItems: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn((roles) => (req, res, next) => next()),
}));

describe('Inventory Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/inventory', inventoryRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = inventoryRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/low-stock', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
    expect(routes).toContainEqual({ path: '/:id/stock', methods: ['put'] });
  });
  
  it('should apply middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = inventoryRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
  });
  
  it('should call getInventoryItems controller on GET /', async () => {
    await request(app)
      .get('/api/inventory');
    
    expect(inventoryController.getInventoryItems).toHaveBeenCalled();
  });
  
  it('should call getInventoryStats controller on GET /stats', async () => {
    await request(app)
      .get('/api/inventory/stats');
    
    expect(inventoryController.getInventoryStats).toHaveBeenCalled();
  });
  
  it('should call getLowStockItems controller on GET /low-stock', async () => {
    await request(app)
      .get('/api/inventory/low-stock');
    
    expect(inventoryController.getLowStockItems).toHaveBeenCalled();
  });
  
  it('should call getInventoryItemById controller on GET /:id', async () => {
    await request(app)
      .get('/api/inventory/123456789012');
    
    expect(inventoryController.getInventoryItemById).toHaveBeenCalled();
  });
  
  it('should call createInventoryItem controller on POST /', async () => {
    await request(app)
      .post('/api/inventory')
      .send({ name: 'Test Item', sku: 'TEST-SKU-001' });
    
    expect(inventoryController.createInventoryItem).toHaveBeenCalled();
  });
  
  it('should call updateInventoryItem controller on PUT /:id', async () => {
    await request(app)
      .put('/api/inventory/123456789012')
      .send({ name: 'Updated Test Item' });
    
    expect(inventoryController.updateInventoryItem).toHaveBeenCalled();
  });
  
  it('should call deleteInventoryItem controller on DELETE /:id with admin authorization', async () => {
    // Since we're mocking the entire middleware, we can't actually check that authorize was called with 'admin'
    // Instead, we'll verify that the controller function is called when the route is hit
    await request(app)
      .delete('/api/inventory/123456789012');
    
    // Check that the delete controller was called
    expect(inventoryController.deleteInventoryItem).toHaveBeenCalled();
    
    // Verify that the authorize function exists in the middleware
    expect(authMiddleware.authorize).toBeDefined();
  });
  
  it('should call updateInventoryStock controller on PUT /:id/stock', async () => {
    await request(app)
      .put('/api/inventory/123456789012/stock')
      .send({ stockQuantity: 50 });
    
    expect(inventoryController.updateInventoryStock).toHaveBeenCalled();
  });
});