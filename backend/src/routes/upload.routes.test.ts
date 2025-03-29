import express from 'express';
import request from 'supertest';
import uploadRoutes from './upload.routes';
import * as uploadController from '../controllers/upload.controller';
import * as authMiddleware from '../middleware/auth.middleware';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock multer
jest.mock('multer', () => {
  return () => ({
    storage: {},
    single: () => (req: any, res: any, next: any) => next()
  });
});

// Mock the upload controller methods
jest.mock('../controllers/upload.controller', () => ({
  getSignedUploadUrl: jest.fn((req, res) => res.status(200).json({ success: true })),
  uploadFile: jest.fn((req, res) => res.status(201).json({ success: true })),
  deleteFile: jest.fn((req, res) => res.status(200).json({ success: true })),
  handleTempUpload: jest.fn((req, res) => res.status(201).json({ success: true })),
  getInventoryImageUploadUrls: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateInventoryImages: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteInventoryImage: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn(roles => (req, res, next) => next()),
}));

describe('Upload Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Set up the express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/upload', uploadRoutes);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should define all required routes', () => {
    // Check that the router has the correct routes defined
    const routes = uploadRoutes.stack
      .filter((layer: any) => layer.route) // Filter middleware that's not a route
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    // Verify all required routes exist
    expect(routes).toContainEqual({ path: '/signed-url', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/', methods: ['delete'] });
    expect(routes).toContainEqual({ path: '/temp', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/inventory-images', methods: ['get'] });
    expect(routes).toContainEqual({ path: '/inventory/:id/images', methods: ['post'] });
    expect(routes).toContainEqual({ path: '/inventory/:id/images', methods: ['delete'] });
  });
  
  it('should apply authentication middleware to all routes', () => {
    // Check that the authenticate middleware exists
    expect(authMiddleware.authenticate).toBeDefined();
    
    // Check that the router has routes
    const routes = uploadRoutes.stack.filter((layer: any) => layer.route);
    expect(routes.length).toBeGreaterThan(0);
    
    // Each route should have the authenticate middleware
    expect(authMiddleware.authenticate).toHaveBeenCalledTimes(routes.length);
  });
  
  it('should call getSignedUploadUrl controller on GET /signed-url', async () => {
    await request(app)
      .get('/api/upload/signed-url')
      .query({ fileName: 'test.jpg', contentType: 'image/jpeg' });
    
    expect(uploadController.getSignedUploadUrl).toHaveBeenCalled();
  });
  
  it('should call uploadFile controller on POST /', async () => {
    await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test file content'), 'test.jpg');
    
    expect(uploadController.uploadFile).toHaveBeenCalled();
  });
  
  it('should call deleteFile controller on DELETE /', async () => {
    await request(app)
      .delete('/api/upload')
      .send({ fileUrl: 'https://storage.example.com/test.jpg' });
    
    expect(uploadController.deleteFile).toHaveBeenCalled();
  });
  
  it('should call handleTempUpload controller on POST /temp', async () => {
    await request(app)
      .post('/api/upload/temp')
      .attach('file', Buffer.from('test file content'), 'test.jpg');
    
    expect(uploadController.handleTempUpload).toHaveBeenCalled();
  });
  
  it('should call getInventoryImageUploadUrls controller on GET /inventory-images', async () => {
    await request(app)
      .get('/api/upload/inventory-images')
      .query({ count: '3' });
    
    expect(uploadController.getInventoryImageUploadUrls).toHaveBeenCalled();
  });
  
  it('should call updateInventoryImages controller on POST /inventory/:id/images', async () => {
    const imageData = {
      images: [
        'https://storage.example.com/image1.jpg',
        'https://storage.example.com/image2.jpg'
      ]
    };
    
    await request(app)
      .post('/api/upload/inventory/123456789012/images')
      .send(imageData);
    
    expect(uploadController.updateInventoryImages).toHaveBeenCalled();
    expect(uploadController.updateInventoryImages.mock.calls[0][0].params.id).toBe('123456789012');
    expect(uploadController.updateInventoryImages.mock.calls[0][0].body).toEqual(imageData);
  });
  
  it('should call deleteInventoryImage controller on DELETE /inventory/:id/images', async () => {
    await request(app)
      .delete('/api/upload/inventory/123456789012/images')
      .send({ imageUrl: 'https://storage.example.com/image1.jpg' });
    
    expect(uploadController.deleteInventoryImage).toHaveBeenCalled();
    expect(uploadController.deleteInventoryImage.mock.calls[0][0].params.id).toBe('123456789012');
  });
  
  it('should pass query parameters to getSignedUploadUrl controller', async () => {
    await request(app)
      .get('/api/upload/signed-url')
      .query({ 
        fileName: 'test.jpg', 
        contentType: 'image/jpeg',
        folder: 'inventory'
      });
    
    expect(uploadController.getSignedUploadUrl).toHaveBeenCalled();
    expect(uploadController.getSignedUploadUrl.mock.calls[0][0].query.fileName).toBe('test.jpg');
    expect(uploadController.getSignedUploadUrl.mock.calls[0][0].query.contentType).toBe('image/jpeg');
    expect(uploadController.getSignedUploadUrl.mock.calls[0][0].query.folder).toBe('inventory');
  });
});