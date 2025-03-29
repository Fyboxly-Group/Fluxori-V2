import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import User from '../models/user.model';
import storageService from '../services/storage.service';
import * as testUtils from '../tests/utils/test-utils';
import InventoryItem from '../models/inventory.model';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';

// Mock the storage service methods
jest.mock('../services/storage.service', () => ({
  getSignedUploadUrl: jest.fn().mockImplementation(async (filename, contentType, folder) => {
    return `https://storage.example.com/${folder || 'uploads'}/${filename}?signature=mocksignature`;
  }),
  uploadFile: jest.fn().mockImplementation(async (buffer, filename, contentType, folder) => {
    return `https://storage.example.com/${folder || 'uploads'}/${filename}`;
  }),
  deleteFile: jest.fn().mockResolvedValue(true),
}));

describe('Upload Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let inventoryItemId: string;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Create a test user
    user = await testUtils.createTestUser('upload-test@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');
    
    // Create a test inventory item
    const inventoryItem = new InventoryItem({
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
      createdBy: user._id,
      images: []
    });
    
    const savedItem = await inventoryItem.save();
    inventoryItemId = savedItem._id.toString();
  });
  
  afterEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await InventoryItem.deleteMany({});
    
    // Clear storage service mocks
    jest.clearAllMocks();
  });
  
  describe('GET /api/upload/signed-url', () => {
    it('should return a signed URL for direct upload', async () => {
      const response = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${token}`)
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
      
      // Verify storage service was called with correct parameters
      expect(storageService.getSignedUploadUrl).toHaveBeenCalledWith(
        'test-file.jpg',
        'image/jpeg',
        'test-folder'
      );
    });
    
    it('should return an error if filename or contentType is missing', async () => {
      // Missing filename
      let response = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${token}`)
        .query({
          contentType: 'image/jpeg'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      
      // Missing contentType
      response = await request(app)
        .get('/api/upload/signed-url')
        .set('Authorization', `Bearer ${token}`)
        .query({
          filename: 'test-file.jpg'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should return an error if not authenticated', async () => {
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
  
  describe('GET /api/upload/inventory-images', () => {
    it('should return multiple signed URLs for inventory images', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${token}`)
        .query({
          count: '3',
          inventoryId: inventoryItemId
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.signedUrls).toBeDefined();
      expect(response.body.data.fileUrls).toBeDefined();
      expect(response.body.data.signedUrls.length).toBe(3);
      expect(response.body.data.fileUrls.length).toBe(3);
      
      // Verify each URL contains the inventory ID
      response.body.data.signedUrls.forEach((url: string) => {
        expect(url).toContain(inventoryItemId);
        expect(url).toContain('inventory');
      });
      
      // Verify storage service was called multiple times
      expect(storageService.getSignedUploadUrl).toHaveBeenCalledTimes(3);
    });
    
    it('should limit the number of URLs to 10', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${token}`)
        .query({
          count: '20', // Request 20, but should get max 10
          inventoryId: inventoryItemId
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.signedUrls.length).toBe(10);
      expect(response.body.data.fileUrls.length).toBe(10);
    });
    
    it('should require inventoryId parameter', async () => {
      const response = await request(app)
        .get('/api/upload/inventory-images')
        .set('Authorization', `Bearer ${token}`)
        .query({
          count: '3'
        });
      
      expect(response.status).toBe(400);
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
        .post(`/api/upload/inventory/${inventoryItemId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          images,
          primaryImage: images[1] // Set second image as primary
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toBeDefined();
      expect(response.body.data.images.length).toBe(3);
      
      // Verify primary image is first in the array
      expect(response.body.data.images[0]).toBe(images[1]);
      
      // Verify the inventory item was updated in the database
      const updatedItem = await InventoryItem.findById(inventoryItemId);
      expect(updatedItem?.images).toBeDefined();
      expect(updatedItem?.images?.length).toBe(3);
      expect(updatedItem?.images?.[0]).toBe(images[1]);
    });
    
    it('should return an error if images array is not provided', async () => {
      const response = await request(app)
        .post(`/api/upload/inventory/${inventoryItemId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing images array
          primaryImage: 'https://storage.example.com/inventory/image1.jpg'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should return an error if inventory item does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .post(`/api/upload/inventory/${nonExistentId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          images: ['https://storage.example.com/inventory/image1.jpg']
        });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/upload/inventory/:id/images', () => {
    beforeEach(async () => {
      // Add images to the inventory item
      const item = await InventoryItem.findById(inventoryItemId);
      if (item) {
        item.images = [
          'https://storage.example.com/inventory/image1.jpg',
          'https://storage.example.com/inventory/image2.jpg'
        ];
        await item.save();
      }
    });
    
    it('should delete an image from inventory item', async () => {
      const imageUrl = 'https://storage.example.com/inventory/image1.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/inventory/${inventoryItemId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageUrl
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Image deleted successfully');
      
      // Verify the image was removed from the inventory item
      const updatedItem = await InventoryItem.findById(inventoryItemId);
      expect(updatedItem?.images).toBeDefined();
      expect(updatedItem?.images?.length).toBe(1);
      expect(updatedItem?.images?.[0]).toBe('https://storage.example.com/inventory/image2.jpg');
      
      // Verify the storage service was called to delete the file
      expect(storageService.deleteFile).toHaveBeenCalledWith(imageUrl);
    });
    
    it('should return an error if imageUrl is not provided', async () => {
      const response = await request(app)
        .delete(`/api/upload/inventory/${inventoryItemId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should return an error if image does not exist in inventory item', async () => {
      const imageUrl = 'https://storage.example.com/inventory/nonexistent.jpg';
      
      const response = await request(app)
        .delete(`/api/upload/inventory/${inventoryItemId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageUrl
        });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    it('should return an error if inventory item does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/upload/inventory/${nonExistentId}/images`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageUrl: 'https://storage.example.com/inventory/image1.jpg'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});