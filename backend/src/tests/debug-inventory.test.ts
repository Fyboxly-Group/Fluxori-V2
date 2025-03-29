import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from './utils/test-app';
import InventoryItem from '../models/inventory.model';
import * as testUtils from './utils/test-utils';
import { beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';

// Mock the populate function on mongoose queries
const mockPopulate = jest.fn().mockImplementation(function() {
  return this;
});

// Apply the mock to the mongoose Query prototype
mongoose.Query.prototype.populate = mockPopulate;

describe('Debug Inventory Controller', () => {
  let app: Express;
  let user: any;
  let token: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clear collection before each test
    await InventoryItem.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('inventory-debug@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');

    // Debug info
    console.log('Test user ID:', user._id.toString());
    console.log('Generated token:', token);
  });

  afterEach(async () => {
    // Clean up
    await InventoryItem.deleteMany({});
  });

  describe('GET /api/inventory', () => {
    it('should return inventory items - simple test', async () => {
      // First, make a direct request to the root to check if the app is working
      const rootResponse = await request(app).get('/');
      console.log('Root response:', rootResponse.status, rootResponse.body);

      // Create a mock supplier id
      const mockSupplier = new mongoose.Types.ObjectId();

      // Create test inventory item with the mock supplier
      const item = await testUtils.createTestInventoryItem(user._id.toString(), { 
        name: 'Debug Item', 
        sku: 'DEBUG-001',
        supplier: mockSupplier
      });
      console.log('Created test item:', item._id.toString(), 'with supplier:', mockSupplier);

      // Try to fetch by ID first to see if that works
      const idResponse = await request(app)
        .get(`/api/inventory/${item._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      console.log('GET by ID response:', idResponse.status, idResponse.body);

      // Now try the list endpoint with debug tracing
      try {
        console.log('About to make GET request to /api/inventory');
        const response = await request(app)
          .get('/api/inventory')
          .set('Authorization', `Bearer ${token}`);
        
        console.log('GET all response status:', response.status);
        console.log('GET all response body:', response.body);
        
        if (response.status === 500) {
          console.log('Error details:', response.body.message);
          console.log('Error stack:', response.body.stack);
        }
        
        // Let's try a more basic assertion for debugging
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('Error during GET inventory request:', error);
        throw error;
      }
    });
  });
});