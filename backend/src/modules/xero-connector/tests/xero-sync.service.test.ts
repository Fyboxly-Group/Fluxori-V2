import { jest } from '@jest/globals';
import xeroSyncService from '../services/xero-sync.service';
import xeroAuthService from '../services/xero-auth.service';
import xeroContactService from '../services/xero-contact.service';
import xeroInvoiceService from '../services/xero-invoice.service';
import mongoose from 'mongoose';
import { XeroUserCredentials, SyncOperationType } from '../types';

// Mock dependencies
jest.mock('../services/xero-auth.service', () => ({
  getAuthenticatedClient: jest.fn(),
}));

jest.mock('../services/xero-contact.service', () => ({
  getContacts: jest.fn(),
  syncCustomerToXero: jest.fn(),
}));

jest.mock('../services/xero-invoice.service', () => ({
  getInvoices: jest.fn(),
  syncOrderToXero: jest.fn(),
}));

// Mock mongoose model
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...(originalModule as any),
    model: jest.fn().mockImplementation((modelName) => {
      if (modelName === 'XeroSyncStatus') {
        return {
          create: jest.fn(),
          findById: jest.fn(),
          updateOne: jest.fn(),
        };
      }
      if (modelName === 'Customer') {
        return {
          find: jest.fn().mockResolvedValue([
            { _id: 'cust1', companyName: 'Customer 1' },
            { _id: 'cust2', companyName: 'Customer 2' },
          ]),
        };
      }
      if (modelName === 'Order') {
        return {
          find: jest.fn().mockResolvedValue([
            { _id: 'order1', orderNumber: 'ORD-001' },
            { _id: 'order2', orderNumber: 'ORD-002' },
          ]),
        };
      }
      return {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn(),
      };
    }),
  };
});

// Sample test data
const mockUserCredentials: XeroUserCredentials = {
  userId: 'user123',
  organizationId: 'org456',
  tenantId: 'tenant789',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('XeroSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    (xeroAuthService.getAuthenticatedClient as jest.Mock).mockResolvedValue({
      accountingApi: {},
    });
  });
  
  describe('startSync', () => {
    it('should start a new sync operation', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.create as jest.Mock).mockResolvedValue({
        _id: 'sync123',
        type: 'full',
        startedAt: new Date(),
        status: 'running',
        progress: 0,
      });
      
      // Call the method under test
      const result = await xeroSyncService.startSync(mockUserCredentials, 'full');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.syncId).toBe('sync123');
      expect(result.status).toBe('running');
    });
    
    it('should handle sync creation errors', async() => {
      // Mock XeroSyncStatus model to throw error
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the method under test
      const result = await xeroSyncService.startSync(mockUserCredentials, 'full');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
  
  describe('syncContacts', () => {
    it('should sync customers to Xero contacts', async() => {
      // Mock dependencies
      (xeroContactService.syncCustomerToXero as jest.Mock).mockImplementation((credentials, customerId) => {
        return Promise.resolve({
          success: true,
          contactId: 'xero-contact-' + customerId,
          message: 'Customer synced successfully',
        });
      });
      
      // Call the method under test
      const result = await xeroSyncService.syncContacts(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.syncedContacts).toBe(2);
      expect(result.failedContacts).toBe(0);
    });
    
    it('should handle contact sync failures', async() => {
      // Mock dependencies
      (xeroContactService.syncCustomerToXero as jest.Mock).mockImplementation((credentials, customerId) => {
        return Promise.resolve({
          success: customerId === 'cust1', // Only first sync succeeds
          contactId: customerId === 'cust1' ? 'xero-contact-cust1' : undefined,
          message: customerId === 'cust1' ? 'Customer synced successfully' : 'Sync failed',
          error: customerId === 'cust1' ? undefined : 'API error',
        });
      });
      
      // Call the method under test
      const result = await xeroSyncService.syncContacts(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(true); // Overall success even with partial failures
      expect(result.syncedContacts).toBe(1);
      expect(result.failedContacts).toBe(1);
    });
    
    it('should handle database errors', async() => {
      // Mock Customer model to throw error
      const mockCustomerModel = mongoose.model('Customer');
      (mockCustomerModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the method under test
      const result = await xeroSyncService.syncContacts(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
  
  describe('syncInvoices', () => {
    it('should sync orders to Xero invoices', async() => {
      // Mock dependencies
      (xeroInvoiceService.syncOrderToXero as jest.Mock).mockImplementation((credentials, orderId) => {
        return Promise.resolve({
          success: true,
          invoiceId: 'xero-invoice-' + orderId,
          invoiceNumber: 'INV-' + orderId,
        });
      });
      
      // Call the method under test
      const result = await xeroSyncService.syncInvoices(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.syncedInvoices).toBe(2);
      expect(result.failedInvoices).toBe(0);
    });
    
    it('should handle invoice sync failures', async() => {
      // Mock dependencies
      (xeroInvoiceService.syncOrderToXero as jest.Mock).mockImplementation((credentials, orderId) => {
        return Promise.resolve({
          success: orderId === 'order1', // Only first sync succeeds
          invoiceId: orderId === 'order1' ? 'xero-invoice-order1' : undefined,
          invoiceNumber: orderId === 'order1' ? 'INV-order1' : undefined,
          error: orderId === 'order1' ? undefined : 'API error',
        });
      });
      
      // Call the method under test
      const result = await xeroSyncService.syncInvoices(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(true); // Overall success even with partial failures
      expect(result.syncedInvoices).toBe(1);
      expect(result.failedInvoices).toBe(1);
    });
    
    it('should handle database errors', async() => {
      // Mock Order model to throw error
      const mockOrderModel = mongoose.model('Order');
      (mockOrderModel.find as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the method under test
      const result = await xeroSyncService.syncInvoices(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
  
  describe('performFullSync', () => {
    it('should perform a full sync of contacts and invoices', async() => {
      // Mock internal methods
      jest.spyOn(xeroSyncService, 'syncContacts').mockResolvedValue({
        success: true,
        syncedContacts: 10,
        failedContacts: 0,
      });
      
      jest.spyOn(xeroSyncService, 'syncInvoices').mockResolvedValue({
        success: true,
        syncedInvoices: 5,
        failedInvoices: 0,
      });
      
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.findById as jest.Mock).mockResolvedValue({
        _id: 'sync123',
        type: 'full',
        startedAt: new Date(),
        status: 'running',
        progress: 0,
      });
      
      // Call the method under test
      const result = await xeroSyncService.performFullSync(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.contactsResult.syncedContacts).toBe(10);
      expect(result.invoicesResult.syncedInvoices).toBe(5);
    });
    
    it('should handle contact sync failure during full sync', async() => {
      // Mock internal methods
      jest.spyOn(xeroSyncService, 'syncContacts').mockResolvedValue({
        success: false,
        error: 'Contact sync failed',
      });
      
      // Call the method under test
      const result = await xeroSyncService.performFullSync(mockUserCredentials, 'sync123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Contact sync failed');
      // Invoice sync should not be attempted after contact sync failure
      expect(result.invoicesResult).toBeUndefined();
    });
  });
  
  describe('getSyncStatus', () => {
    it('should retrieve sync operation status', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.findById as jest.Mock).mockResolvedValue({
        _id: 'sync123',
        type: 'full',
        startedAt: new Date(),
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        totalItems: 15,
        processedItems: 15,
      });
      
      // Call the method under test
      const result = await xeroSyncService.getSyncStatus('sync123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.status.status).toBe('completed');
      expect(result.status.progress).toBe(100);
    });
    
    it('should handle non-existent sync operation', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.findById as jest.Mock).mockResolvedValue(null);
      
      // Call the method under test
      const result = await xeroSyncService.getSyncStatus('non-existent');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Sync operation not found');
    });
  });
  
  describe('updateSyncProgress', () => {
    it('should update sync operation progress', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroSyncService.updateSyncProgress('sync123', 50, 10, 5);
      
      // Assertions
      expect(result.success).toBe(true);
    });
    
    it('should handle non-existent sync operation', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 0 });
      
      // Call the method under test
      const result = await xeroSyncService.updateSyncProgress('non-existent', 50);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('No sync operation updated');
    });
  });
  
  describe('completeSyncOperation', () => {
    it('should mark a sync operation as completed', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroSyncService.completeSyncOperation('sync123');
      
      // Assertions
      expect(result.success).toBe(true);
    });
    
    it('should handle non-existent sync operation', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 0 });
      
      // Call the method under test
      const result = await xeroSyncService.completeSyncOperation('non-existent');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('No sync operation completed');
    });
  });
  
  describe('failSyncOperation', () => {
    it('should mark a sync operation as failed', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroSyncService.failSyncOperation('sync123', 'Sync failed due to API error');
      
      // Assertions
      expect(result.success).toBe(true);
    });
    
    it('should handle non-existent sync operation', async() => {
      // Mock XeroSyncStatus model
      const mockSyncStatusModel = mongoose.model('XeroSyncStatus');
      (mockSyncStatusModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 0 });
      
      // Call the method under test
      const result = await xeroSyncService.failSyncOperation('non-existent', 'Error');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('No sync operation failed');
    });
  });
});