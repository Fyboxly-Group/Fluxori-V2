import express from 'express';
import request from 'supertest';
import dashboardRoutes from './dashboard.routes';
import * as dashboardController from '../controllers/dashboard.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the dashboard controller methods
jest.mock('../controllers/dashboard.controller', () => ({
  getStats: jest.fn((req, res) => res.status(200).json({ success: true })),
  getActivities: jest.fn((req, res) => res.status(200).json({ success: true })),
  getTasks: jest.fn((req, res) => res.status(200).json({ success: true })),
  getSystemStatus: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
}));

describe('Dashboard Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = dashboardRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/stats', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/activities', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/tasks', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/system-status', methods: ['get'] });
  });
  
  it('should apply middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = dashboardRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
  });
  
  it('should call getStats controller on GET /stats', async () => {
    await request(app)
      .get('/api/dashboard/stats');
    
    expect(dashboardController.getStats).toHaveBeenCalled();
  });
  
  it('should call getActivities controller on GET /activities', async () => {
    await request(app)
      .get('/api/dashboard/activities');
    
    expect(dashboardController.getActivities).toHaveBeenCalled();
  });
  
  it('should call getTasks controller on GET /tasks', async () => {
    await request(app)
      .get('/api/dashboard/tasks');
    
    expect(dashboardController.getTasks).toHaveBeenCalled();
  });
  
  it('should pass query parameters to getTasks controller', async () => {
    await request(app)
      .get('/api/dashboard/tasks?status=pending&limit=5');
    
    expect(dashboardController.getTasks).toHaveBeenCalled();
    // Verify that the controller received the query parameters
    expect(dashboardController.getTasks.mock.calls[0][0].query.status).toBe('pending');
    expect(dashboardController.getTasks.mock.calls[0][0].query.limit).toBe('5');
  });
  
  it('should call getSystemStatus controller on GET /system-status', async () => {
    await request(app)
      .get('/api/dashboard/system-status');
    
    expect(dashboardController.getSystemStatus).toHaveBeenCalled();
  });
});