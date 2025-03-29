import express from 'express';
import request from 'supertest';
import customerRoutes from './customer.routes';
import * as customerController from '../controllers/customer.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the customer controller methods
jest.mock('../controllers/customer.controller', () => ({
  getCustomers: jest.fn((req, res) => res.status(200).json({ success: true })),
  getCustomerById: jest.fn((req, res) => res.status(200).json({ success: true })),
  createCustomer: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateCustomer: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteCustomer: jest.fn((req, res) => res.status(200).json({ success: true })),
  getCustomerStats: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn(roles => (req, res, next) => next()),
}));

describe('Customer Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/customers', customerRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = customerRoutes.stack
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
  });
  
  it('should apply authentication middleware to the router', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const middlewareStack = customerRoutes.stack;
    expect(middlewareStack.length).toBeGreaterThan(0);
    
    // Check that the first middleware is the authenticate middleware
    const authMiddlewareLayer = middlewareStack.find(
      (layer: any) => layer.name === 'authenticate' || layer.handle.name === 'authenticate'
    );
    expect(authMiddlewareLayer).toBeDefined();
  });
  
  it('should apply authorization middleware to delete route', () => {
    // Check that the authorize middleware exists
    expect(authMiddleware.authorize).toBeDefined();
    
    // Verify that authorize is called with the correct role
    expect(authMiddleware.authorize).toHaveBeenCalledWith('admin');
  });
  
  it('should call getCustomers controller on GET /', async () => {
    await request(app)
      .get('/api/customers');
    
    expect(customerController.getCustomers).toHaveBeenCalled();
  });
  
  it('should call getCustomerStats controller on GET /stats', async () => {
    await request(app)
      .get('/api/customers/stats');
    
    expect(customerController.getCustomerStats).toHaveBeenCalled();
  });
  
  it('should call getCustomerById controller on GET /:id', async () => {
    await request(app)
      .get('/api/customers/123456789012');
    
    expect(customerController.getCustomerById).toHaveBeenCalled();
    expect(customerController.getCustomerById.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call createCustomer controller on POST /', async () => {
    const customerData = {
      companyName: 'Test Company',
      industry: 'Technology',
      size: 'medium',
      primaryContact: {
        name: 'John Smith',
        title: 'CEO',
        email: 'john@testcompany.com',
        phone: '123-456-7890'
      },
      accountManager: '234567890123'
    };
    
    await request(app)
      .post('/api/customers')
      .send(customerData);
    
    expect(customerController.createCustomer).toHaveBeenCalled();
    expect(customerController.createCustomer.mock.calls[0][0].body).toEqual(customerData);
  });
  
  it('should call updateCustomer controller on PUT /:id', async () => {
    const updateData = {
      companyName: 'Updated Company Name',
      status: 'inactive',
      nps: 8
    };
    
    await request(app)
      .put('/api/customers/123456789012')
      .send(updateData);
    
    expect(customerController.updateCustomer).toHaveBeenCalled();
    expect(customerController.updateCustomer.mock.calls[0][0].params.id).toBe('123456789012');
    expect(customerController.updateCustomer.mock.calls[0][0].body).toEqual(updateData);
  });
  
  it('should call deleteCustomer controller on DELETE /:id with admin authorization', async () => {
    await request(app)
      .delete('/api/customers/123456789012');
    
    expect(customerController.deleteCustomer).toHaveBeenCalled();
    expect(customerController.deleteCustomer.mock.calls[0][0].params.id).toBe('123456789012');
    
    // Verify that the authorize function exists and was called with admin role
    expect(authMiddleware.authorize).toBeDefined();
    expect(authMiddleware.authorize).toHaveBeenCalledWith('admin');
  });
  
  it('should pass query parameters to getCustomers controller', async () => {
    await request(app)
      .get('/api/customers?status=active&industry=Technology&size=medium');
    
    expect(customerController.getCustomers).toHaveBeenCalled();
    expect(customerController.getCustomers.mock.calls[0][0].query.status).toBe('active');
    expect(customerController.getCustomers.mock.calls[0][0].query.industry).toBe('Technology');
    expect(customerController.getCustomers.mock.calls[0][0].query.size).toBe('medium');
  });
});