import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../models/user.model';

// Helper function to create a new test user
export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123',
  role: string = 'user',
  isActive: boolean = true
) => {
  const user = new User({
    email,
    password,
    firstName: 'Test',
    lastName: 'User',
    role,
    isActive,
  });
  
  return await user.save();
};

// Helper function to generate an authentication token for tests
export const generateAuthToken = (userId: string, role: string = 'user'): string => {
  const token = jwt.sign(
    { id: userId, role }, // Use 'id' to match what auth middleware expects
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  
  return token;
};

// Helper to perform authenticated requests
export const authenticatedRequest = (app: Express, token: string) => {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body?: any) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body?: any) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string, body?: any) => request(app).patch(url).set('Authorization', `Bearer ${token}`).send(body),
  };
};

// Helper function to create a MongoDB ObjectId
export const createObjectId = (): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId();
};

// Helper function to create a test inventory item
export const createTestInventoryItem = async (userId: string, data: any = {}) => {
  // Import like this to avoid issues with default exports
  const InventoryItem = require('../../models/inventory.model').default;
  
  const defaultData = {
    sku: `TEST-${Date.now()}`,
    name: 'Test Product',
    description: 'Test product description',
    category: 'Test Category',
    price: 99.99,
    costPrice: 49.99,
    stockQuantity: 100,
    reorderPoint: 10,
    reorderQuantity: 50,
    supplier: createObjectId(),
    location: 'Warehouse A',
    isActive: true,
    createdBy: userId,
  };
  
  const itemData = { ...defaultData, ...data };
  const item = new InventoryItem(itemData);
  
  return await item.save();
};

// Helper to clean up test data
export const cleanupTestData = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};