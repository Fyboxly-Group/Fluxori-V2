import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from '../config';

// Mock models if needed
jest.mock('../models/resource.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

describe('Resource Routes', () => {
  let authToken: string;
  let userId: string;
  let resourceId: string;

  beforeAll(async () => {
    // Setup test user and authentication
    userId = new mongoose.Types.ObjectId().toString();
    authToken = jwt.sign({ id: userId }, config.jwtSecret as string, { expiresIn: '1d' });
    
    // Create test resource ID
    resourceId = new mongoose.Types.ObjectId().toString();
  });

  describe('GET /api/resources', () => {
    it('should get all resources', async () => {
      const response = await request(app)
        .get('/api/resources')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/resources');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should get a resource by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 404 for non-existent resource', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(`/api/resources/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/resources', () => {
    it('should create a new resource', async () => {
      const newResource = {
        name: 'Test Resource',
        description: 'This is a test',
        // Add other required fields
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newResource);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(newResource);
    });

    it('should validate request body', async () => {
      const invalidResource = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidResource);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Add test blocks for other routes (PUT, DELETE, etc.)
});