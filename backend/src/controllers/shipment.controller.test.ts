import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import Shipment from '../models/shipment.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import storageService from '../services/storage.service';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  __esModule: true,
  default: {
    deleteFile: jest.fn().mockImplementation(async (fileUrl) => {
      return true;
    }),
  },
}));

describe('Shipment Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  let shipment: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await Shipment.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('shipment-test@example.com', 'password123');
    token = testUtils.generateAuthToken(user._id.toString());
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Create a test shipment
    shipment = new Shipment({
      shipmentNumber: `SHIP-${Date.now()}`,
      type: 'outbound',
      courier: 'Test Courier',
      trackingNumber: 'TRK123456',
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
      createdBy: user._id,
    });
    
    await shipment.save();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('POST /api/shipments/:id/documents', () => {
    it('should add a document to a shipment', async () => {
      const documentData = {
        title: 'Test Invoice',
        fileUrl: 'https://storage.googleapis.com/test-bucket/test-file.pdf',
        fileType: 'application/pdf',
        category: 'invoice',
      };
      
      const response = await authRequest
        .post(`/api/shipments/${shipment._id}/documents`)
        .send(documentData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.fileUrl).toBe(documentData.fileUrl);
      expect(response.body.data.fileType).toBe(documentData.fileType);
      expect(response.body.data.category).toBe(documentData.category);
      expect(response.body.data.uploadedBy.toString()).toBe(user._id.toString());
      
      // Verify document was added to shipment
      const updatedShipment = await Shipment.findById(shipment._id);
      expect(updatedShipment!.documents).toBeDefined();
      expect(updatedShipment!.documents!.length).toBe(1);
      expect(updatedShipment!.documents![0].title).toBe(documentData.title);
    });
    
    it('should set default category if not provided', async () => {
      const documentData = {
        title: 'Test Document',
        fileUrl: 'https://storage.googleapis.com/test-bucket/test-doc.pdf',
        fileType: 'application/pdf',
        // No category provided
      };
      
      const response = await authRequest
        .post(`/api/shipments/${shipment._id}/documents`)
        .send(documentData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.category).toBe('other');
    });
    
    it('should return 400 for missing required fields', async () => {
      // Missing fileUrl
      const incompleteData = {
        title: 'Incomplete Document',
        fileType: 'application/pdf',
      };
      
      const response = await authRequest
        .post(`/api/shipments/${shipment._id}/documents`)
        .send(incompleteData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required fields');
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const documentData = {
        title: 'Test Document',
        fileUrl: 'https://storage.googleapis.com/test-bucket/test-doc.pdf',
        fileType: 'application/pdf',
      };
      
      const response = await authRequest
        .post(`/api/shipments/${nonExistentId}/documents`)
        .send(documentData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Shipment not found');
    });
    
    it('should return 400 for invalid shipment ID', async () => {
      const documentData = {
        title: 'Test Document',
        fileUrl: 'https://storage.googleapis.com/test-bucket/test-doc.pdf',
        fileType: 'application/pdf',
      };
      
      const response = await authRequest
        .post('/api/shipments/invalid-id/documents')
        .send(documentData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid shipment ID');
    });
  });
  
  describe('GET /api/shipments/:id/documents', () => {
    it('should get all documents for a shipment', async () => {
      // Add documents to test shipment
      const testShipment = await Shipment.findById(shipment._id);
      testShipment!.documents = [
        {
          title: 'Invoice #123',
          fileUrl: 'https://storage.googleapis.com/test-bucket/invoice-123.pdf',
          fileType: 'application/pdf',
          category: 'invoice',
          uploadedBy: user._id,
          uploadedAt: new Date(),
        },
        {
          title: 'Packing Slip',
          fileUrl: 'https://storage.googleapis.com/test-bucket/packing-slip.pdf',
          fileType: 'application/pdf',
          category: 'packing-slip',
          uploadedBy: user._id,
          uploadedAt: new Date(),
        },
      ];
      await testShipment!.save();
      
      const response = await authRequest.get(`/api/shipments/${shipment._id}/documents`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toBe('Invoice #123');
      expect(response.body.data[1].title).toBe('Packing Slip');
    });
    
    it('should return empty array when shipment has no documents', async () => {
      const response = await authRequest.get(`/api/shipments/${shipment._id}/documents`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/shipments/${nonExistentId}/documents`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Shipment not found');
    });
    
    it('should return 400 for invalid shipment ID', async () => {
      const response = await authRequest.get('/api/shipments/invalid-id/documents');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid shipment ID');
    });
    
    it('should populate uploadedBy user details', async () => {
      // Add document to test shipment
      const testShipment = await Shipment.findById(shipment._id);
      testShipment!.documents = [
        {
          title: 'Test Document',
          fileUrl: 'https://storage.googleapis.com/test-bucket/test-doc.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: user._id,
          uploadedAt: new Date(),
        },
      ];
      await testShipment!.save();
      
      const response = await authRequest.get(`/api/shipments/${shipment._id}/documents`);
      
      expect(response.status).toBe(200);
      expect(response.body.data[0].uploadedBy).toBeDefined();
      expect(response.body.data[0].uploadedBy.firstName).toBe('Test');
      expect(response.body.data[0].uploadedBy.lastName).toBe('User');
      expect(response.body.data[0].uploadedBy.email).toBe('shipment-test@example.com');
    });
  });
  
  describe('DELETE /api/shipments/:id/documents/:documentId', () => {
    it('should remove a document from a shipment and delete the file', async () => {
      // Add document to test shipment
      const testShipment = await Shipment.findById(shipment._id);
      testShipment!.documents = [
        {
          title: 'Document to Delete',
          fileUrl: 'https://storage.googleapis.com/test-bucket/delete-me.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: user._id,
          uploadedAt: new Date(),
        },
      ];
      await testShipment!.save();
      
      const documentId = testShipment!.documents![0]._id.toString();
      
      const response = await authRequest.delete(`/api/shipments/${shipment._id}/documents/${documentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed successfully');
      
      // Verify document was removed from shipment
      const updatedShipment = await Shipment.findById(shipment._id);
      expect(updatedShipment!.documents!.length).toBe(0);
      
      // Verify storage service was called to delete the file
      expect(storageService.deleteFile).toHaveBeenCalledTimes(1);
      expect(storageService.deleteFile).toHaveBeenCalledWith('https://storage.googleapis.com/test-bucket/delete-me.pdf');
    });
    
    it('should continue even if file deletion fails', async () => {
      // Mock the storage service to return false (deletion failed)
      (storageService.deleteFile as jest.Mock).mockResolvedValueOnce(false);
      
      // Add document to test shipment
      const testShipment = await Shipment.findById(shipment._id);
      testShipment!.documents = [
        {
          title: 'Document with Failed Deletion',
          fileUrl: 'https://storage.googleapis.com/test-bucket/fail-delete.pdf',
          fileType: 'application/pdf',
          category: 'other',
          uploadedBy: user._id,
          uploadedAt: new Date(),
        },
      ];
      await testShipment!.save();
      
      const documentId = testShipment!.documents![0]._id.toString();
      
      const response = await authRequest.delete(`/api/shipments/${shipment._id}/documents/${documentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify document was still removed from shipment despite file deletion failure
      const updatedShipment = await Shipment.findById(shipment._id);
      expect(updatedShipment!.documents!.length).toBe(0);
    });
    
    it('should return 404 for non-existent document', async () => {
      const nonExistentDocId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/shipments/${shipment._id}/documents/${nonExistentDocId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Document not found');
    });
    
    it('should return 404 when shipment has no documents', async () => {
      const nonExistentDocId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/shipments/${shipment._id}/documents/${nonExistentDocId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      // Either "No documents found" or "Document not found" message is acceptable
      expect(response.body.message).toMatch(/documents|Document/);
    });
    
    it('should return 404 for non-existent shipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const fakeDocId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/shipments/${nonExistentId}/documents/${fakeDocId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Shipment not found');
    });
    
    it('should return 400 for invalid shipment ID', async () => {
      const fakeDocId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/shipments/invalid-id/documents/${fakeDocId}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid shipment ID');
    });
  });
});