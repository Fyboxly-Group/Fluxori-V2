import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Shipment from '../../models/shipment.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import storageService from '../../services/storage.service';

// Mock the storage service
jest.mock('../../services/storage.service', () => ({
  __esModule: true,
  default: {
    deleteFile: jest.fn().mockImplementation(async (fileUrl) => {
      return true;
    }),
  },
}));

describe('Shipment API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testShipment: any;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Shipment.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-shipment@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-shipment@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    
    // Create a test shipment
    testShipment = await createTestShipment(adminUser._id.toString());
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test shipment
  const createTestShipment = async (userId: string, overrides = {}) => {
    const defaultShipment = {
      shipmentNumber: `SHIP-${Date.now()}`,
      type: 'outbound',
      courier: 'Test Courier',
      trackingNumber: `TRK${Date.now()}`,
      status: 'pending',
      origin: {
        name: 'Warehouse A',
        address: '123 Storage St',
        city: 'Warehouse City',
        state: 'WH',
        postalCode: '12345',
        country: 'USA',
        phone: '555-123-4567',
      },
      destination: {
        name: 'Customer Name',
        address: '456 Customer Ave',
        city: 'Customer City',
        state: 'CS',
        postalCode: '54321',
        country: 'USA',
        phone: '555-987-6543',
      },
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          sku: 'TEST-ITEM-1',
          name: 'Test Product 1',
          quantity: 2,
        },
      ],
      signatureRequired: true,
      createdBy: userId,
    };
    
    const shipmentData = { ...defaultShipment, ...overrides };
    const shipment = new Shipment(shipmentData);
    return await shipment.save();
  };
  
  describe('GET /api/shipments/:id/documents', () => {
    it('should return all documents for a shipment', async () => {
      // Add documents to the test shipment
      testShipment.documents = [
        {
          title: 'Invoice #123',
          fileUrl: 'https://storage.googleapis.com/test-bucket/invoice-123.pdf',
          fileType: 'application/pdf',
          category: 'invoice',
          uploadedBy: adminUser._id,
          uploadedAt: new Date(),
        },
        {
          title: 'Packing Slip',
          fileUrl: 'https://storage.googleapis.com/test-bucket/packing-slip.pdf',
          fileType: 'application/pdf',
          category: 'packing-slip',
          uploadedBy: adminUser._id,
          uploadedAt: new Date(),
        },
      ];
      
      await testShipment.save();
      
      const response = await request(app)
        .get(`/api/shipments/${testShipment._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toBe('Invoice #123');
      expect(response.body.data[1].title).toBe('Packing Slip');
    });
    
    it('should return empty array when shipment has no documents', async () => {
      // Ensure shipment has no documents
      testShipment.documents = [];
      await testShipment.save();
      
      const response = await request(app)
        .get(`/api/shipments/${testShipment._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/shipments/${nonExistentId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Shipment not found');
    });
    
    it('should return 400 for invalid shipment ID', async () => {
      const response = await request(app)
        .get('/api/shipments/invalid-id/documents')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid shipment ID');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/shipments/${testShipment._id}/documents`);
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/shipments/:id/documents', () => {
    it('should add a document to a shipment', async () => {
      const documentData = {
        title: 'Integration Test Invoice',
        fileUrl: 'https://storage.googleapis.com/test-bucket/integration-invoice.pdf',
        fileType: 'application/pdf',
        category: 'invoice',
      };
      
      const response = await request(app)
        .post(`/api/shipments/${testShipment._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(documentData);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.fileUrl).toBe(documentData.fileUrl);
      expect(response.body.data.fileType).toBe(documentData.fileType);
      expect(response.body.data.category).toBe(documentData.category);
      expect(response.body.data.uploadedBy.toString()).toBe(adminUser._id.toString());
      
      // Verify document was added to shipment in the database
      const updatedShipment = await Shipment.findById(testShipment._id);
      expect(updatedShipment!.documents).toBeDefined();
      expect(updatedShipment!.documents!.length).toBe(1);
      expect(updatedShipment!.documents![0].title).toBe(documentData.title);
    });
    
    it('should set default category if not provided', async () => {
      const documentData = {
        title: 'Document Without Category',
        fileUrl: 'https://storage.googleapis.com/test-bucket/no-category.pdf',
        fileType: 'application/pdf',
        // No category provided
      };
      
      const response = await request(app)
        .post(`/api/shipments/${testShipment._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(documentData);
        
      expect(response.status).toBe(201);
      expect(response.body.data.category).toBe('other');
      
      // Verify in database
      const updatedShipment = await Shipment.findById(testShipment._id);
      expect(updatedShipment!.documents![0].category).toBe('other');
    });
    
    it('should validate required fields', async () => {
      // Missing fileType field
      const incompleteData = {
        title: 'Incomplete Document',
        fileUrl: 'https://storage.googleapis.com/test-bucket/incomplete.pdf',
        // Missing fileType
      };
      
      const response = await request(app)
        .post(`/api/shipments/${testShipment._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required fields');
    });
    
    it('should require authentication', async () => {
      const documentData = {
        title: 'Unauthenticated Document',
        fileUrl: 'https://storage.googleapis.com/test-bucket/unauthenticated.pdf',
        fileType: 'application/pdf',
      };
      
      const response = await request(app)
        .post(`/api/shipments/${testShipment._id}/documents`)
        .send(documentData);
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/shipments/:id/documents/:documentId', () => {
    it('should delete a document from a shipment', async () => {
      // Add a document to the test shipment first
      testShipment.documents = [
        {
          title: 'Document to Delete',
          fileUrl: 'https://storage.googleapis.com/test-bucket/delete-doc.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: adminUser._id,
          uploadedAt: new Date(),
        },
      ];
      
      await testShipment.save();
      
      const documentId = testShipment.documents[0]._id;
      
      const response = await request(app)
        .delete(`/api/shipments/${testShipment._id}/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed successfully');
      
      // Verify document was removed from shipment in the database
      const updatedShipment = await Shipment.findById(testShipment._id);
      expect(updatedShipment!.documents!.length).toBe(0);
      
      // Verify storage service was called to delete the file
      expect(storageService.deleteFile).toHaveBeenCalledTimes(1);
      expect(storageService.deleteFile).toHaveBeenCalledWith('https://storage.googleapis.com/test-bucket/delete-doc.pdf');
    });
    
    it('should continue with document removal even if file deletion fails', async () => {
      // Mock deleteFile to throw an error
      (storageService.deleteFile as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      
      // Add a document to the test shipment
      testShipment.documents = [
        {
          title: 'Document with File Deletion Error',
          fileUrl: 'https://storage.googleapis.com/test-bucket/error-file.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: adminUser._id,
          uploadedAt: new Date(),
        },
      ];
      
      await testShipment.save();
      
      const documentId = testShipment.documents[0]._id;
      
      const response = await request(app)
        .delete(`/api/shipments/${testShipment._id}/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed successfully');
      
      // Verify document was still removed from shipment despite file deletion error
      const updatedShipment = await Shipment.findById(testShipment._id);
      expect(updatedShipment!.documents!.length).toBe(0);
    });
    
    it('should return 404 for non-existent document', async () => {
      const nonExistentDocId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/shipments/${testShipment._id}/documents/${nonExistentDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/No documents found|Document not found/);
    });
    
    it('should require authentication', async () => {
      // Add a document to the test shipment
      testShipment.documents = [
        {
          title: 'Authenticated Document',
          fileUrl: 'https://storage.googleapis.com/test-bucket/auth-required.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: adminUser._id,
          uploadedAt: new Date(),
        },
      ];
      
      await testShipment.save();
      
      const documentId = testShipment.documents[0]._id;
      
      const response = await request(app)
        .delete(`/api/shipments/${testShipment._id}/documents/${documentId}`);
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});