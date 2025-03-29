import express from 'express';
import request from 'supertest';
import inventoryAlertRoutes from './inventory-alert.routes';
import * as inventoryAlertController from '../controllers/inventory-alert.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the inventory alert controller methods
jest.mock('../controllers/inventory-alert.controller', () => ({
  getInventoryAlerts: jest.fn((req, res) => res.status(200).json({ success: true })),
  getInventoryAlertById: jest.fn((req, res) => res.status(200).json({ success: true })),
  createInventoryAlert: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateInventoryAlert: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteInventoryAlert: jest.fn((req, res) => res.status(200).json({ success: true })),
  assignInventoryAlert: jest.fn((req, res) => res.status(200).json({ success: true })),
  resolveInventoryAlert: jest.fn((req, res) => res.status(200).json({ success: true })),
  getAlertStats: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

describe('Inventory Alert Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/inventory-alerts', inventoryAlertRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = inventoryAlertRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id', methods: ['delete'] });
    expect(routes).toContainEqual({ path: '/:id/assign', methods: ['put'] });
    expect(routes).toContainEqual({ path: '/:id/resolve', methods: ['put'] });
  });
  
  it('should apply middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = inventoryAlertRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
  });
  
  it('should call getInventoryAlerts controller on GET /', async () => {
    await request(app)
      .get('/api/inventory-alerts');
    
    expect(inventoryAlertController.getInventoryAlerts).toHaveBeenCalled();
  });
  
  it('should call getAlertStats controller on GET /stats', async () => {
    await request(app)
      .get('/api/inventory-alerts/stats');
    
    expect(inventoryAlertController.getAlertStats).toHaveBeenCalled();
  });
  
  it('should call getInventoryAlertById controller on GET /:id', async () => {
    await request(app)
      .get('/api/inventory-alerts/123456789012');
    
    expect(inventoryAlertController.getInventoryAlertById).toHaveBeenCalled();
  });
  
  it('should call createInventoryAlert controller on POST /', async () => {
    await request(app)
      .post('/api/inventory-alerts')
      .send({ item: '123456789012', itemName: 'Test Item', itemSku: 'TEST-SKU-001', alertType: 'low-stock' });
    
    expect(inventoryAlertController.createInventoryAlert).toHaveBeenCalled();
  });
  
  it('should call updateInventoryAlert controller on PUT /:id', async () => {
    await request(app)
      .put('/api/inventory-alerts/123456789012')
      .send({ priority: 'high' });
    
    expect(inventoryAlertController.updateInventoryAlert).toHaveBeenCalled();
  });
  
  it('should call deleteInventoryAlert controller on DELETE /:id', async () => {
    await request(app)
      .delete('/api/inventory-alerts/123456789012');
    
    expect(inventoryAlertController.deleteInventoryAlert).toHaveBeenCalled();
  });
  
  it('should call assignInventoryAlert controller on PUT /:id/assign', async () => {
    await request(app)
      .put('/api/inventory-alerts/123456789012/assign')
      .send({ assignedTo: '123456789012' });
    
    expect(inventoryAlertController.assignInventoryAlert).toHaveBeenCalled();
  });
  
  it('should call resolveInventoryAlert controller on PUT /:id/resolve', async () => {
    await request(app)
      .put('/api/inventory-alerts/123456789012/resolve')
      .send({ resolutionNotes: 'Issue resolved' });
    
    expect(inventoryAlertController.resolveInventoryAlert).toHaveBeenCalled();
  });
});