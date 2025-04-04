import { jest } from '@jest/globals';
import xeroInvoiceService from '../services/xero-invoice.service';
import xeroAuthService from '../services/xero-auth.service';
import { XeroUserCredentials, FluxoriOrderData, XeroInvoiceResult } from '../types';

// Mock dependencies
jest.mock('../services/xero-auth.service', () => ({
  getAuthenticatedClient: jest.fn(),
}));

// Sample test data
const mockUserCredentials: XeroUserCredentials = {
  userId: 'user123',
  organizationId: 'org456',
  tenantId: 'tenant789',
};

const mockOrderData: FluxoriOrderData = {
  orderId: 'order123',
  orderNumber: 'ORD-123',
  customerData: {
    id: 'cust456',
    companyName: 'Test Company',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '123-456-7890',
    billingAddress: {
      street: '123 Main St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
    },
  },
  items: [
    {
      id: 'item1',
      sku: 'SKU001',
      name: 'Test Product 1',
      description: 'Test product description 1',
      quantity: 2,
      unitPrice: 10.00,
      subtotal: 20.00,
    },
    {
      id: 'item2',
      sku: 'SKU002',
      name: 'Test Product 2',
      quantity: 1,
      unitPrice: 15.00,
      subtotal: 15.00,
    },
  ],
  subtotal: 35.00,
  taxTotal: 5.25,
  discountTotal: 0,
  shippingCost: 4.99,
  total: 45.24,
};

// Mock Xero Node SDK client methods
const mockAccountingApi = {
  getInvoices: jest.fn(),
  getInvoice: jest.fn(),
  createInvoices: jest.fn(),
  getTaxRates: jest.fn(),
};

const mockXeroClient = {
  accountingApi: mockAccountingApi,
};

describe('XeroInvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    (xeroAuthService.getAuthenticatedClient as jest.Mock).mockResolvedValue(mockXeroClient);
    
    // Mock tax rates response
    mockAccountingApi.getTaxRates.mockResolvedValue({
      body: {
        taxRates: [
          {
            name: 'Tax Exempt',
            taxType: 'NONE',
            effectiveRate: 0,
          },
          {
            name: 'Standard Rate',
            taxType: 'OUTPUT',
            effectiveRate: 15,
          },
        ],
      },
    });
  });
  
  describe('createInvoice', () => {
    it('should create an invoice in Xero', async() => {
      // Mock createInvoices response
      mockAccountingApi.createInvoices.mockResolvedValue({
        body: {
          invoices: [
            {
              invoiceID: 'inv-123',
              invoiceNumber: 'INV-001',
              type: 'ACCREC',
              status: 'DRAFT',
              lineItems: [
                {
                  description: 'Test Product 1',
                  quantity: 2,
                  unitAmount: 10.00,
                  lineAmount: 20.00,
                },
                {
                  description: 'Test Product 2',
                  quantity: 1,
                  unitAmount: 15.00,
                  lineAmount: 15.00,
                },
              ],
              subTotal: 35.00,
              totalTax: 5.25,
              total: 40.25,
            },
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.createInvoice(mockUserCredentials, mockOrderData);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.invoiceId).toBe('inv-123');
      expect(result.invoiceNumber).toBe('INV-001');
      
      // Verify API was called
      expect(mockAccountingApi.createInvoices).toHaveBeenCalled();
      
      // Verify correct invoice structure was sent
      const invoiceArg = mockAccountingApi.createInvoices.mock.calls[0][1];
      expect(invoiceArg.invoices).toHaveLength(1);
      expect(invoiceArg.invoices[0].type).toBe('ACCREC');
      expect(invoiceArg.invoices[0].lineItems).toHaveLength(mockOrderData.items.length);
    });
    
    it('should handle invoice creation failure', async() => {
      // Mock createInvoices to return empty array
      mockAccountingApi.createInvoices.mockResolvedValue({
        body: {
          invoices: [],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.createInvoice(mockUserCredentials, mockOrderData);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('should handle API errors', async() => {
      // Mock createInvoices to throw error
      mockAccountingApi.createInvoices.mockRejectedValue(new Error('API error'));
      
      // Call the method under test
      const result = await xeroInvoiceService.createInvoice(mockUserCredentials, mockOrderData);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('API error');
    });
  });
  
  describe('getInvoices', () => {
    it('should retrieve invoices from Xero', async() => {
      // Mock getInvoices response
      mockAccountingApi.getInvoices.mockResolvedValue({
        body: {
          invoices: [
            {
              invoiceID: 'inv-123',
              invoiceNumber: 'INV-001',
              type: 'ACCREC',
              status: 'DRAFT',
            },
            {
              invoiceID: 'inv-456',
              invoiceNumber: 'INV-002',
              type: 'ACCREC',
              status: 'AUTHORISED',
            },
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.getInvoices(mockUserCredentials);
      
      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].invoiceID).toBe('inv-123');
      expect(result[1].invoiceNumber).toBe('INV-002');
      
      // Verify API was called
      expect(mockAccountingApi.getInvoices).toHaveBeenCalledWith(
        'tenant789',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });
    
    it('should handle empty response', async() => {
      // Mock getInvoices response with no invoices
      mockAccountingApi.getInvoices.mockResolvedValue({
        body: {
          invoices: [],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.getInvoices(mockUserCredentials);
      
      // Assertions
      expect(result).toEqual([]);
    });
    
    it('should handle API errors', async() => {
      // Mock getInvoices to throw error
      mockAccountingApi.getInvoices.mockRejectedValue(new Error('API error'));
      
      // Call the method under test and expect error
      await expect(xeroInvoiceService.getInvoices(mockUserCredentials))
        .rejects.toThrow('API error');
    });
  });
  
  describe('getInvoiceById', () => {
    it('should retrieve a specific invoice by ID', async() => {
      // Mock getInvoice response
      mockAccountingApi.getInvoice.mockResolvedValue({
        body: {
          invoices: [
            {
              invoiceID: 'inv-123',
              invoiceNumber: 'INV-001',
              type: 'ACCREC',
              status: 'DRAFT',
            },
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.getInvoiceById(mockUserCredentials, 'inv-123');
      
      // Assertions
      expect(result).not.toBeNull();
      expect(result?.invoiceID).toBe('inv-123');
      expect(result?.invoiceNumber).toBe('INV-001');
      
      // Verify API was called correctly
      expect(mockAccountingApi.getInvoice).toHaveBeenCalledWith('tenant789', 'inv-123');
    });
    
    it('should return null for non-existent invoice', async() => {
      // Mock getInvoice response with no invoices
      mockAccountingApi.getInvoice.mockResolvedValue({
        body: {
          invoices: [],
        },
      });
      
      // Call the method under test
      const result = await xeroInvoiceService.getInvoiceById(mockUserCredentials, 'non-existent');
      
      // Assertions
      expect(result).toBeNull();
    });
    
    it('should handle API errors', async() => {
      // Mock getInvoice to throw error
      mockAccountingApi.getInvoice.mockRejectedValue(new Error('API error'));
      
      // Call the method under test and expect error
      await expect(xeroInvoiceService.getInvoiceById(mockUserCredentials, 'inv-123'))
        .rejects.toThrow('API error');
    });
  });
  
  describe('syncOrderToXero', () => {
    it('should create invoice for order in Xero', async() => {
      // Mock dependencies
      const mockOrderModel = {
        findById: jest.fn().mockResolvedValue(mockOrderData),
      };
      
      // Use jest.spyOn to mock internal module method
      const createInvoiceSpy = jest.spyOn(xeroInvoiceService, 'createInvoice')
        .mockResolvedValue({
          success: true,
          invoiceId: 'inv-123',
          invoiceNumber: 'INV-001',
        });
      
      // Call the method under test
      const result = await xeroInvoiceService.syncOrderToXero(
        mockUserCredentials,
        'order123',
        mockOrderModel as any
      );
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.invoiceId).toBe('inv-123');
      expect(result.invoiceNumber).toBe('INV-001');
      
      // Verify dependencies were called correctly
      expect(mockOrderModel.findById).toHaveBeenCalledWith('order123');
      expect(createInvoiceSpy).toHaveBeenCalledWith(mockUserCredentials, mockOrderData);
      
      // Restore the spy
      createInvoiceSpy.mockRestore();
    });
    
    it('should handle order not found', async() => {
      // Mock dependencies
      const mockOrderModel = {
        findById: jest.fn().mockResolvedValue(null),
      };
      
      // Call the method under test
      const result = await xeroInvoiceService.syncOrderToXero(
        mockUserCredentials,
        'non-existent',
        mockOrderModel as any
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
    
    it('should handle invoice creation failure', async() => {
      // Mock dependencies
      const mockOrderModel = {
        findById: jest.fn().mockResolvedValue(mockOrderData),
      };
      
      // Use jest.spyOn to mock internal module method
      const createInvoiceSpy = jest.spyOn(xeroInvoiceService, 'createInvoice')
        .mockResolvedValue({
          success: false,
          error: 'Invoice creation failed',
        });
      
      // Call the method under test
      const result = await xeroInvoiceService.syncOrderToXero(
        mockUserCredentials,
        'order123',
        mockOrderModel as any
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invoice creation failed');
      
      // Restore the spy
      createInvoiceSpy.mockRestore();
    });
    
    it('should handle database errors', async() => {
      // Mock dependencies
      const mockOrderModel = {
        findById: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      // Call the method under test
      const result = await xeroInvoiceService.syncOrderToXero(
        mockUserCredentials,
        'order123',
        mockOrderModel as any
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});