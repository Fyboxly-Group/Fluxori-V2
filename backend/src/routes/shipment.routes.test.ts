import express from 'express';
import request from 'supertest';
import shipmentRoutes from './shipment.routes';
import * as shipmentController from '../controllers/shipment.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the shipment controller methods
jest.mock('../controllers/shipment.controller', () => ({
  getShipmentDocuments: jest.fn((req, res) => res.status(200).json({ success: true })),
  addShipmentDocument: jest.fn((req, res) => res.status(201).json({ success: true })),
  removeShipmentDocument: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn(roles => (req, res, next) => next()),
}));

describe('Shipment Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/shipments', shipmentRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = shipmentRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/:id/documents', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/:id/documents', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/:id/documents/:documentId', methods: ['delete'] });
  });
  
  it('should apply authentication middleware to all routes', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Verify authenticate is used on all routes
    const routes = shipmentRoutes.stack.filter((layer: any) => layer.route);
    
    // Each route should have the authenticate middleware
    expect(authMiddleware.authenticate).toHaveBeenCalledTimes(routes.length);
  });
  
  it('should call getShipmentDocuments controller on GET /:id/documents', async () => {
    await request(app)
      .get('/api/shipments/123456789012/documents');
    
    expect(shipmentController.getShipmentDocuments).toHaveBeenCalled();
    expect(shipmentController.getShipmentDocuments.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should call addShipmentDocument controller on POST /:id/documents', async () => {
    const documentData = {
      title: 'Test Document',
      fileUrl: 'https://storage.example.com/shipment-document.pdf',
      fileType: 'application/pdf',
      category: 'packing-slip'
    };
    
    await request(app)
      .post('/api/shipments/123456789012/documents')
      .send(documentData);
    
    expect(shipmentController.addShipmentDocument).toHaveBeenCalled();
    expect(shipmentController.addShipmentDocument.mock.calls[0][0].params.id).toBe('123456789012');
    expect(shipmentController.addShipmentDocument.mock.calls[0][0].body).toEqual(documentData);
  });
  
  it('should call removeShipmentDocument controller on DELETE /:id/documents/:documentId', async () => {
    await request(app)
      .delete('/api/shipments/123456789012/documents/abc123');
    
    expect(shipmentController.removeShipmentDocument).toHaveBeenCalled();
    expect(shipmentController.removeShipmentDocument.mock.calls[0][0].params.id).toBe('123456789012');
    expect(shipmentController.removeShipmentDocument.mock.calls[0][0].params.documentId).toBe('abc123');
  });
});