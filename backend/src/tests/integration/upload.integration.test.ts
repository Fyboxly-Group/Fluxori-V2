import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import InventoryItem from '../../models/inventory.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import storageService from '../../services/storage.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock the storage service
jest.mock('../../services/storage.service', () => ({
  __esModule: true,
  default: {
    getSignedUploadUrl: jest.fn().mockImplementation(async (filename, contentType, folder) => {
      return `https://storage.example.com/${folder || 'uploads'}/${filename}?signature=mocksignature`;
    }),
    uploadFile: jest.fn().mockImplementation(async (buffer, filename, contentType, folder) => {
      return `https://storage.example.com/${folder || 'uploads'}/${filename}`;
    }),
    deleteFile: jest.fn().mockResolvedValue(true),
  },
}));

// Mock fs.writeFileSync, fs.readFileSync, fs.unlinkSync, and fs.existsSync
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock file content')),
  unlinkSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

describe('Upload API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testInventoryItem: any;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-upload@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-upload@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    
    // Create a test inventory item
    testInventoryItem = await createTestInventoryItem(adminUser._id.toString());
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test inventory item
  const createTestInventoryItem = async (userId: string, overrides = {}) => {
    const defaultItem = {
      sku: `TEST-${Date.now()}`,
      name: 'Test Product',
      description: 'Test product description',
      category: 'Test Category',
      price: 99.99,
      costPrice: 49.99,
      stockQuantity: 100,
      reorderPoint: 10,
      reorderQuantity: 50,
      supplier: new mongoose.Types.ObjectId(),
      location: 'Warehouse A',
      isActive: true,
      createdBy: userId,
      images: []
    };
    
    const itemData = { ...defaultItem, ...overrides };
    const item = new InventoryItem(itemData);
    return await item.save();
  };
  
  describe('GET /api/upload/signed-url', () => {
    it('should return a signed URL for file upload', async () => {
      const response = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          filename: 'test-file.jpg',
          contentType: 'image/jpeg',
          folder: 'test-folder'
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
      expect(response.body.data.fileUrl).toBeDefined();
      expect(response.body.data.url).toContain('test-file.jpg');
      expect(response.body.data.url).toContain('test-folder');
      
      // Verify storage service was called correctly
      expect(storageService.getSignedUploadUrl).toHaveBeenCalledWith(
        'test-file.jpg',
        'image/jpeg',
        'test-folder'
      );
    });
    
    it('should validate required query parameters', async () => {
      // Missing filename
      const response1 = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          contentType: 'image/jpeg'
        });
        
      expect(response1.status).toBe(400);
      expect(response1.body.success).toBe(false);
      expect(response1.body.message).toContain('required');
      
      // Missing contentType
      const response2 = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          filename: 'test-file.jpg'
        });
        
      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toContain('required');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/upload/signed-url')
        .query({
          filename: 'test-file.jpg',
          contentType: 'image/jpeg'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/upload', () => {
    it('should upload a file to storage', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('mock image data'), {
          filename: 'test-upload.jpg',
          contentType: 'image/jpeg',
        })
        .field('folder', 'test-uploads');
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fileUrl).toBeDefined();
      expect(response.body.data.filename).toBe('test-upload.jpg');
      expect(response.body.data.contentType).toBe('image/jpeg');
      expect(response.body.data.size).toBeDefined();
      
      // Verify storage service was called correctly
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test-upload.jpg',
        'image/jpeg',
        'test-uploads'
      );
    });
    
    it('should return an error if no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('folder', 'test-uploads');
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No file uploaded');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('mock image data'), {
          filename: 'test-upload.jpg',
          contentType: 'image/jpeg',
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/upload/temp', () => {
    it('should handle temporary file upload', async () => {
      const response = await request(app)
        .post('/api/upload/temp')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('mock temp file data'), {
          filename: 'temp-upload.jpg',
          contentType: 'image/jpeg',
        })
        .field('folder', 'temp-uploads');
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fileUrl).toBeDefined();
      expect(response.body.data.filename).toBe('temp-upload.jpg');
      expect(response.body.data.contentType).toBe('image/jpeg');
      
      // Verify that the temp file operations were called
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      
      // Verify storage service was called correctly
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'temp-upload.jpg',
        'image/jpeg',
        'temp-uploads'
      );
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload/temp')
        .attach('file', Buffer.from('mock temp file data'), {
          filename: 'temp-upload.jpg',
          contentType: 'image/jpeg',
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/upload', () => {
    it('should delete a file from storage', async () => {
      const fileUrl = 'https://storage.example.com/uploads/file-to-delete.jpg';
      
      const response = await request(app)
        .delete('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileUrl
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify storage service was called correctly
      expect(storageService.deleteFile).toHaveBeenCalledWith(fileUrl);
    });
    
    it('should validate fileUrl parameter', async () => {
      const response = await request(app)
        .delete('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing fileUrl
        });
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
    
    it('should return an error if file deletion fails', async () => {
      // Mock the deleteFile method to return false (failure)
      (storageService.deleteFile as jest.Mock).mockResolvedValueOnce(false);
      
      const response = await request(app)
        .delete('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileUrl: 'https://storage.example.com/uploads/failure-file.jpg'
        });
        
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to delete file');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/upload')
        .send({
          fileUrl: 'https://storage.example.com/uploads/file-to-delete.jpg'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/upload/inventory-images', () => {
    it('should generate signed URLs for inventory images', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          count: '3',
          inventoryId: testInventoryItem._id.toString()
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.signedUrls).toHaveLength(3);
      expect(response.body.data.fileUrls).toHaveLength(3);
      
      // Verify URLs contain the inventory ID
      response.body.data.signedUrls.forEach((url: string) => {
        expect(url).toContain(testInventoryItem._id.toString());
      });
      
      // Verify storage service was called for each URL
      expect(storageService.getSignedUploadUrl).toHaveBeenCalledTimes(3);
      expect(storageService.getSignedUploadUrl).toHaveBeenCalledWith(
        expect.stringContaining(testInventoryItem._id.toString()),
        'image/jpeg',
        'inventory'
      );
    });
    
    it('should require inventoryId parameter', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          count: '3'
        });
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
    
    it('should limit the number of URLs to 10', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          count: '15', // Request more than limit
          inventoryId: testInventoryItem._id.toString()
        });
        
      expect(response.status).toBe(200);
      expect(response.body.data.signedUrls).toHaveLength(10); // Max is 10
      expect(response.body.data.fileUrls).toHaveLength(10);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .query({
          count: '3',
          inventoryId: testInventoryItem._id.toString()
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/upload/inventory/:id/images', () => {
    it('should update inventory item images', async () => {
      const images = [
        'https://storage.example.com/inventory/image1.jpg',
        'https://storage.example.com/inventory/image2.jpg',
        'https://storage.example.com/inventory/image3.jpg'
      ];
      
      const response = await request(app)
        .post(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images,
          primaryImage: images[1] // Make the second image primary
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(3);
      
      // Primary image should be first in the array
      expect(response.body.data.images[0]).toBe(images[1]);
      
      // Verify database was updated
      const updatedItem = await InventoryItem.findById(testInventoryItem._id);
      expect(updatedItem!.images).toHaveLength(3);
      expect(updatedItem!.images![0]).toBe(images[1]);
    });
    
    it('should validate images array', async () => {
      const response = await request(app)
        .post(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing images array
          primaryImage: 'https://storage.example.com/inventory/image1.jpg'
        });
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
    
    it('should return 404 for non-existent inventory item', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/upload/inventory/${nonExistentId}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: ['https://storage.example.com/inventory/image1.jpg']
        });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Inventory item not found');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .send({
          images: ['https://storage.example.com/inventory/image1.jpg']
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/upload/inventory/:id/images', () => {
    beforeEach(async () => {
      // Add test images to the inventory item
      testInventoryItem.images = [
        'https://storage.example.com/inventory/image1.jpg',
        'https://storage.example.com/inventory/image2.jpg'
      ];
      await testInventoryItem.save();
    });
    
    it('should delete an image from an inventory item', async () => {
      const imageUrl = 'https://storage.example.com/inventory/image1.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl
        });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Image deleted successfully');
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.images[0]).toBe('https://storage.example.com/inventory/image2.jpg');
      
      // Verify database was updated
      const updatedItem = await InventoryItem.findById(testInventoryItem._id);
      expect(updatedItem!.images).toHaveLength(1);
      expect(updatedItem!.images![0]).toBe('https://storage.example.com/inventory/image2.jpg');
      
      // Verify storage service was called
      expect(storageService.deleteFile).toHaveBeenCalledWith(imageUrl);
    });
    
    it('should return 404 if image not found in inventory item', async () => {
      const response = await request(app)
        .delete(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl: 'https://storage.example.com/inventory/nonexistent.jpg'
        });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Image not found in inventory item');
    });
    
    it('should continue if file deletion from storage fails', async () => {
      // Mock storage service to throw an error
      (storageService.deleteFile as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      
      const imageUrl = 'https://storage.example.com/inventory/image1.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageUrl
        });
        
      // Should still succeed even if storage deletion fails
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify image was removed from database
      const updatedItem = await InventoryItem.findById(testInventoryItem._id);
      expect(updatedItem!.images).toHaveLength(1);
      expect(updatedItem!.images![0]).toBe('https://storage.example.com/inventory/image2.jpg');
    });
    
    it('should validate imageUrl parameter', async () => {
      const response = await request(app)
        .delete(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing imageUrl
        });
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/upload/inventory/${testInventoryItem._id}/images`)
        .send({
          imageUrl: 'https://storage.example.com/inventory/image1.jpg'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});