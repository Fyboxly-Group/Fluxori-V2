import { jest } from '@jest/globals';
import xeroWebhookService from '../services/xero-webhook.service';
import { XeroWebhookEvent } from '../types';
import mongoose from 'mongoose';

// Mock mongoose model
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...(originalModule as any),
    model: jest.fn().mockImplementation(() => ({
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    })),
  };
});

// Sample webhook event
const mockWebhookEvent: XeroWebhookEvent = {
  resourceUrl: 'https://api.xero.com/api.xro/2.0/Invoices/123',
  resourceId: 'invoice-123',
  eventType: 'CREATE',
  eventCategory: 'INVOICE',
  eventDate: '2023-08-25T12:00:00Z',
  tenantId: 'tenant-123',
  tenantType: 'ORGANISATION',
};

describe('XeroWebhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('processWebhookEvent', () => {
    it('should process an invoice creation webhook event', async() => {
      // Mock model operations
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockResolvedValue({
        organizationId: 'org-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        autoSyncInvoices: true,
      });
      
      // Call the method under test
      const result = await xeroWebhookService.processWebhookEvent(mockWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('Invoice CREATE event processed');
    });
    
    it('should handle contact update webhook event', async() => {
      // Create contact webhook event
      const contactWebhookEvent: XeroWebhookEvent = {
        ...mockWebhookEvent,
        resourceUrl: 'https://api.xero.com/api.xro/2.0/Contacts/123',
        resourceId: 'contact-123',
        eventCategory: 'CONTACT',
        eventType: 'UPDATE',
      };
      
      // Mock model operations
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockResolvedValue({
        organizationId: 'org-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        autoSyncContacts: true,
      });
      
      // Call the method under test
      const result = await xeroWebhookService.processWebhookEvent(contactWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('Contact UPDATE event processed');
    });
    
    it('should handle unknown event categories', async() => {
      // Create unknown webhook event
      const unknownWebhookEvent: XeroWebhookEvent = {
        ...mockWebhookEvent,
        eventCategory: 'UNKNOWN' as any,
      };
      
      // Call the method under test
      const result = await xeroWebhookService.processWebhookEvent(unknownWebhookEvent);
      
      // Assertions
      expect(result.success).false;
      expect(result.message).toContain('Unsupported event category');
    });
    
    it('should handle configuration lookup failures', async() => {
      // Mock model operations to return null (no config found)
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the method under test
      const result = await xeroWebhookService.processWebhookEvent(mockWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('No Xero configuration found');
    });
    
    it('should handle database errors', async() => {
      // Mock model operations to throw an error
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the method under test
      const result = await xeroWebhookService.processWebhookEvent(mockWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error processing webhook event');
    });
  });
  
  describe('saveWebhookEvent', () => {
    it('should save a webhook event to the database', async() => {
      // Mock model operations
      const mockWebhookModel = mongoose.model('XeroWebhookEvent');
      (mockWebhookModel.create as jest.Mock).mockResolvedValue({
        _id: 'webhook-db-id',
        ...mockWebhookEvent,
      });
      
      // Call the method under test
      const result = await xeroWebhookService.saveWebhookEvent(mockWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.eventId).toBe('webhook-db-id');
    });
    
    it('should handle database errors during save', async() => {
      // Mock model operations to throw an error
      const mockWebhookModel = mongoose.model('XeroWebhookEvent');
      (mockWebhookModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the method under test
      const result = await xeroWebhookService.saveWebhookEvent(mockWebhookEvent);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error saving webhook event');
    });
  });
  
  describe('validateWebhookSignature', () => {
    it('should validate a valid webhook signature', () => {
      // Mock webhook signature validation (implementation details will depend on the service)
      // This is a simplified example
      const result = xeroWebhookService.validateWebhookSignature(
        JSON.stringify(mockWebhookEvent),
        'valid-signature',
        'webhook-key'
      );
      
      // Assertions
      expect(result).toBe(true);
    });
    
    it('should reject an invalid webhook signature', () => {
      // Mock webhook signature validation
      const result = xeroWebhookService.validateWebhookSignature(
        JSON.stringify(mockWebhookEvent),
        'invalid-signature',
        'webhook-key'
      );
      
      // Assertions
      expect(result).toBe(false);
    });
  });
});