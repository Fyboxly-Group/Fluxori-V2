/**
 * Complete batch fix for Xero connector test files
 * 
 * This script completely rewrites the problematic test files with correct TypeScript syntax.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_TYPECHECK = process.argv.includes('--skip-typecheck');
const TARGET_DIR = '/home/tarquin_stapa/Fluxori-V2/backend/src/modules/xero-connector/tests';

// Utility functions
function log(message) {
  if (VERBOSE) {
    console.log(message);
  }
}

function logError(message) {
  console.error('\x1b[31m%s\x1b[0m', message);
}

function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

function getTypeScriptErrorCount() {
  try {
    const result = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    return 0;
  } catch (error) {
    const errorOutput = error.stdout.toString();
    const matches = errorOutput.match(/Found (\d+) error/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return 0;
  }
}

// Function to fix various test files
function fixTestFiles() {
  const testFiles = [
    'xero-auth.service.test.ts',
    'xero-invoice.service.test.ts',
    'xero-webhook.service.test.ts',
    'xero-sync.service.test.ts'
  ];
  
  let fixedCount = 0;
  
  for (const fileName of testFiles) {
    const filePath = path.join(TARGET_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Apply generic fixes that work across all files
    const fixedContent = applyGenericFixes(content);
    
    if (fixedContent !== content) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        logSuccess(`Fixed: ${filePath}`);
        fixedCount++;
      } else {
        log(`Would fix: ${filePath} (dry run)`);
        fixedCount++;
      }
    } else {
      log(`No changes needed: ${filePath}`);
    }
  }
  
  return fixedCount;
}

// Generic fixes that work across all Xero test files
function applyGenericFixes(content) {
  // Remove @ts-nocheck pragma
  let fixed = content.replace(/\/\/ @ts-nocheck.*?\n/, '');
  
  // Fix import statements
  fixed = fixed.replace(/import (.*?) from (.*?),/g, 'import $1 from $2;');
  
  // Fix mock function declarations
  fixed = fixed.replace(/jest\.fn\(\);/g, 'jest.fn(),');
  
  // Fix proper casting to jest.Mock
  fixed = fixed.replace(/\((.*?) as jest\.Mock\)/g, '$1 as jest.Mock');
  
  // Fix comma/semicolon confusion in object literals
  fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([^,;\n]*);(\s*[a-zA-Z0-9_}])/g, '$1: $2,$3');
  
  // Fix mockResolvedValue syntax
  fixed = fixed.replace(/mockResolvedValue\(\((\{[^}]*\})\)\)/g, 'mockResolvedValue($1)');
  
  // Fix string literals with trailing semicolons
  fixed = fixed.replace(/'([^']*)';/g, "'$1',");
  
  // Fix double as any
  fixed = fixed.replace(/as any as any/g, 'as any');
  
  // Fix parens in object expression
  fixed = fixed.replace(/\{([^{}]*)\} as any\)/g, '{$1}) as any');
  
  // Fix as any at end of expressions
  fixed = fixed.replace(/as any\);/g, ');');
  
  // Fix jest.Mock usage without parens
  fixed = fixed.replace(/([a-zA-Z0-9_.]+) as jest\.Mock\.mockResolvedValue/g, '($1 as jest.Mock).mockResolvedValue');
  
  // Fix expect().toHaveBeenCalled
  fixed = fixed.replace(/expect\((.*?)\)\.toHaveBeenCalled;/g, 'expect($1).toHaveBeenCalled();');
  
  // Fix object property declarations
  let lines = fixed.split('\n');
  let inObjectLiteral = false;
  let objectDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Track object depth
    if (line.includes('{')) {
      objectDepth += (line.match(/{/g) || []).length;
      inObjectLiteral = true;
    }
    
    if (line.includes('}')) {
      objectDepth -= (line.match(/}/g) || []).length;
      if (objectDepth === 0) {
        inObjectLiteral = false;
      }
    }
    
    // Fix property declarations with semicolons in objects
    if (inObjectLiteral && line.match(/^[a-zA-Z0-9_]+\s*:\s*.+;$/)) {
      lines[i] = lines[i].replace(/;$/, ',');
    }
  }
  
  fixed = lines.join('\n');
  
  // Complete transformation - Use the completely rewritten xero-contact.service.test.ts format
  return fixed;
}

// Function to explicitly rewrite all test files
function rewriteAllTestFiles() {
  fixContactServiceTest();
  fixInvoiceServiceTest();
  fixWebhookServiceTest();
  fixAuthServiceTest();
  fixSyncServiceTest();
  
  return 5; // Total files fixed
}

// Function to fix xero-contact.service.test.ts
function fixContactServiceTest() {
  const filePath = path.join(TARGET_DIR, 'xero-contact.service.test.ts');
  const content = `import { jest } from '@jest/globals';
import xeroContactService from '../services/xero-contact.service';
import xeroAuthService from '../services/xero-auth.service';
import mongoose from 'mongoose';
import { XeroUserCredentials } from '../types';

// Mock dependencies
jest.mock('../services/xero-auth.service', () => ({
  getAuthenticatedClient: jest.fn(),
}));

// Mock mongoose model
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...(originalModule as any),
    model: jest.fn().mockImplementation(() => ({
      findById: jest.fn(),
    })),
  };
});

// Sample test data
const mockUserCredentials: XeroUserCredentials = {
  userId: 'user123',
  organizationId: 'org456',
  tenantId: 'tenant789',
};

// Mock Xero Node SDK client methods
const mockAccountingApi = {
  getContacts: jest.fn(),
  getContact: jest.fn(),
  createContacts: jest.fn(),
  updateContact: jest.fn(),
};

const mockXeroClient = {
  accountingApi: mockAccountingApi,
};

describe('XeroContactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    (xeroAuthService.getAuthenticatedClient as jest.Mock).mockResolvedValue(mockXeroClient);
  });
  
  describe('getContacts', () => {
    it('should retrieve contacts from Xero', async() => {
      // Mock getContacts response
      mockAccountingApi.getContacts.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'contact1',
              name: 'Test Company 1',
            } as any,
            {
              contactID: 'contact2',
              name: 'Test Company 2',
            } as any,
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroContactService.getContacts(mockUserCredentials, 1, 10, 'Name=="Test"');
      
      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].contactID).toBe('contact1');
      expect(result[1].name).toBe('Test Company 2');
      
      // Verify API was called with correct parameters
      expect(mockAccountingApi.getContacts).toHaveBeenCalledWith(
        'tenant789',
        undefined,
        'Name=="Test"',
        'Name ASC',
        0,
        10
      );
    });
    
    it('should handle empty response from Xero', async() => {
      // Mock getContacts response with no contacts
      mockAccountingApi.getContacts.mockResolvedValue({
        body: {
          contacts: [],
        } as any,
      });
      
      // Call the method under test
      const result = await xeroContactService.getContacts(mockUserCredentials);
      
      // Assertions
      expect(result).toEqual([]);
    });
    
    it('should throw error when API call fails', async() => {
      // Mock getContacts to throw error
      mockAccountingApi.getContacts.mockRejectedValue(new Error('API error'));
      
      // Call the method under test and expect error
      await expect(xeroContactService.getContacts(mockUserCredentials))
        .rejects.toThrow('API error');
    });
  });
  
  describe('getContactById', () => {
    it('should retrieve a contact by ID', async() => {
      // Mock getContact response
      mockAccountingApi.getContact.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'contact1',
              name: 'Test Company',
              emailAddress: 'test@example.com',
            } as any,
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroContactService.getContactById(mockUserCredentials, 'contact1');
      
      // Assertions
      expect(result).not.toBeNull();
      expect(result?.contactID).toBe('contact1');
      expect(result?.name).toBe('Test Company');
      
      // Verify API was called with correct parameters
      expect(mockAccountingApi.getContact).toHaveBeenCalledWith('tenant789', 'contact1');
    });
    
    it('should return null when contact is not found', async() => {
      // Mock getContact response with no contacts
      mockAccountingApi.getContact.mockResolvedValue({
        body: {
          contacts: [],
        } as any,
      });
      
      // Call the method under test
      const result = await xeroContactService.getContactById(mockUserCredentials, 'nonexistent');
      
      // Assertions
      expect(result).toBeNull();
    });
  });
  
  describe('createContact', () => {
    it('should create a new contact in Xero', async() => {
      // Mock createContacts response
      mockAccountingApi.createContacts.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'new-contact-id',
              name: 'New Company',
              emailAddress: 'new@example.com',
            } as any,
          ],
        },
      });
      
      // Contact data to create
      const contactData = {
        name: 'New Company',
        emailAddress: 'new@example.com',
        phones: [{ phoneNumber: '123456789', phoneType: 'DEFAULT' }],
      };
      
      // Call the method under test
      const result = await xeroContactService.createContact(mockUserCredentials, contactData);
      
      // Assertions
      expect(result.contactID).toBe('new-contact-id');
      expect(result.name).toBe('New Company');
      
      // Verify API was called with correct parameters
      expect(mockAccountingApi.createContacts).toHaveBeenCalled();
    });
    
    it('should throw error when contact creation fails', async() => {
      // Mock createContacts response with no contacts
      mockAccountingApi.createContacts.mockResolvedValue({
        body: {
          contacts: [], // Empty array indicates failure
        } as any,
      });
      
      // Call the method under test and expect error
      await expect(xeroContactService.createContact(mockUserCredentials, { name: 'Test' }))
        .rejects.toThrow('Failed to create contact in Xero');
    });
  });
  
  describe('updateContact', () => {
    it('should update an existing contact in Xero', async() => {
      // Mock updateContact response
      mockAccountingApi.updateContact.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'contact1',
              name: 'Updated Company',
              emailAddress: 'updated@example.com',
            } as any,
          ],
        },
      });
      
      // Contact data to update
      const contactData = {
        name: 'Updated Company',
        emailAddress: 'updated@example.com',
      };
      
      // Call the method under test
      const result = await xeroContactService.updateContact(mockUserCredentials, 'contact1', contactData);
      
      // Assertions
      expect(result.contactID).toBe('contact1');
      expect(result.name).toBe('Updated Company');
      
      // Verify API was called with correct parameters
      expect(mockAccountingApi.updateContact).toHaveBeenCalledWith('tenant789', 'contact1', {
        contacts: [
          {
            ...contactData,
            contactID: 'contact1',
          },
        ],
      });
    });
    
    it('should throw error when contact update fails', async() => {
      // Mock updateContact response with no contacts
      mockAccountingApi.updateContact.mockResolvedValue({
        body: {
          contacts: [], // Empty array indicates failure
        } as any,
      });
      
      // Call the method under test and expect error
      await expect(xeroContactService.updateContact(mockUserCredentials, 'contact1', { name: 'Test' }))
        .rejects.toThrow('Failed to update contact in Xero');
    });
  });
  
  describe('syncCustomerToXero', () => {
    it('should update existing contact when customer already exists in Xero', async() => {
      // Mock mongoose Customer.findById
      const mockCustomer = {
        _id: 'cust123',
        companyName: 'Existing Company',
        primaryContact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
      };
      
      const mockCustomerModel = mongoose.model('Customer');
      (mockCustomerModel.findById as jest.Mock).mockResolvedValue(mockCustomer);
      
      // Mock getContacts to return existing contact
      mockAccountingApi.getContacts.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'xero-contact-id',
              name: 'Existing Company',
            } as any,
          ],
        },
      });
      
      // Mock updateContact
      mockAccountingApi.updateContact.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'xero-contact-id',
              name: 'Existing Company',
              emailAddress: 'john@example.com',
            } as any,
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroContactService.syncCustomerToXero(mockUserCredentials, 'cust123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.contactId).toBe('xero-contact-id');
      expect(result.message).toBe('Customer updated in Xero');
      
      // Verify update was called instead of create
      expect(mockAccountingApi.updateContact).toHaveBeenCalled();
      expect(mockAccountingApi.createContacts).not.toHaveBeenCalled();
    });
    
    it('should create new contact when customer does not exist in Xero', async() => {
      // Mock mongoose Customer.findById
      const mockCustomer = {
        _id: 'cust123',
        companyName: 'New Company',
        primaryContact: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '123-456-7890',
        },
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
      };
      
      const mockCustomerModel = mongoose.model('Customer');
      (mockCustomerModel.findById as jest.Mock).mockResolvedValue(mockCustomer);
      
      // Mock getContacts to return no existing contacts
      mockAccountingApi.getContacts.mockResolvedValue({
        body: {
          contacts: [], // No existing contacts
        } as any,
      });
      
      // Mock createContacts
      mockAccountingApi.createContacts.mockResolvedValue({
        body: {
          contacts: [
            {
              contactID: 'new-xero-contact-id',
              name: 'New Company',
              emailAddress: 'jane@example.com',
            } as any,
          ],
        },
      });
      
      // Call the method under test
      const result = await xeroContactService.syncCustomerToXero(mockUserCredentials, 'cust123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.contactId).toBe('new-xero-contact-id');
      expect(result.message).toBe('Customer created in Xero');
      
      // Verify create was called instead of update
      expect(mockAccountingApi.createContacts).toHaveBeenCalled();
      expect(mockAccountingApi.updateContact).not.toHaveBeenCalled();
    });
    
    it('should return error when customer is not found', async() => {
      // Mock mongoose Customer.findById to return null
      const mockCustomerModel = mongoose.model('Customer');
      (mockCustomerModel.findById as jest.Mock).mockResolvedValue(null);
      
      // Call the method under test
      const result = await xeroContactService.syncCustomerToXero(mockUserCredentials, 'nonexistent');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer not found');
    });
    
    it('should handle API errors during sync', async() => {
      // Mock mongoose Customer.findById
      const mockCustomer = {
        _id: 'cust123',
        companyName: 'Test Company',
        primaryContact: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      
      const mockCustomerModel = mongoose.model('Customer');
      (mockCustomerModel.findById as jest.Mock).mockResolvedValue(mockCustomer);
      
      // Mock getContacts to throw error
      mockAccountingApi.getContacts.mockRejectedValue(new Error('API connection error'));
      
      // Call the method under test
      const result = await xeroContactService.syncCustomerToXero(mockUserCredentials, 'cust123');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('API connection error');
    });
  });
});`;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    logSuccess(`Fixed: ${filePath}`);
  } else {
    log(`Would fix: ${filePath} (dry run)`);
  }
  
  return true;
}

// Function to fix xero-invoice.service.test.ts
function fixInvoiceServiceTest() {
  const filePath = path.join(TARGET_DIR, 'xero-invoice.service.test.ts');
  const content = `import { jest } from '@jest/globals';
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
});`;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    logSuccess(`Fixed: ${filePath}`);
  } else {
    log(`Would fix: ${filePath} (dry run)`);
  }
  
  return true;
}

// Function to fix xero-webhook.service.test.ts
function fixWebhookServiceTest() {
  const filePath = path.join(TARGET_DIR, 'xero-webhook.service.test.ts');
  const content = `import { jest } from '@jest/globals';
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
});`;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    logSuccess(`Fixed: ${filePath}`);
  } else {
    log(`Would fix: ${filePath} (dry run)`);
  }
  
  return true;
}

// Function to fix xero-auth.service.test.ts
function fixAuthServiceTest() {
  const filePath = path.join(TARGET_DIR, 'xero-auth.service.test.ts');
  const content = `import { jest } from '@jest/globals';
import xeroAuthService from '../services/xero-auth.service';
import mongoose from 'mongoose';
import { XeroUserCredentials } from '../types';

// Mock dependencies
jest.mock('xero-node', () => {
  return {
    XeroClient: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue({}),
      buildConsentUrl: jest.fn().mockReturnValue('https://example.com/auth'),
      apiCallback: jest.fn().mockResolvedValue({
        tokenSet: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 1800,
        },
      }),
      refreshToken: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 1800,
      }),
      accountingApi: {},
    })),
  };
});

// Mock mongoose models
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

// Sample user credentials
const mockUserCredentials: XeroUserCredentials = {
  userId: 'user123',
  organizationId: 'org456',
  tenantId: 'tenant789',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('XeroAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAuthUrl', () => {
    it('should generate an authorization URL', async() => {
      // Call the method under test
      const result = await xeroAuthService.getAuthUrl('user123', 'org456', 'https://example.com/callback');
      
      // Assertions
      expect(result).toBe('https://example.com/auth');
    });
  });
  
  describe('handleCallback', () => {
    it('should process OAuth callback and save credentials', async() => {
      // Mock XeroConfig model
      const mockXeroConfigModel = mongoose.model('XeroConfig');
      (mockXeroConfigModel.findOne as jest.Mock).mockResolvedValue(null); // No existing config
      (mockXeroConfigModel.create as jest.Mock).mockResolvedValue({
        _id: 'config123',
        userId: 'user123',
        organizationId: 'org456',
      });
      
      // Call the method under test
      const result = await xeroAuthService.handleCallback(
        'auth-code',
        'state-data'
      );
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.tenantId).toBeDefined();
      expect(result.tenantName).toBeDefined();
    });
    
    it('should handle invalid callback data', async() => {
      // Call the method under test with invalid data
      const result = await xeroAuthService.handleCallback(
        '',
        ''
      );
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('refreshAccessToken', () => {
    it('should refresh an expired access token', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user123',
        organizationId: 'org456',
        refreshToken: 'refresh-token',
      });
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
    
    it('should handle non-existent connection', async() => {
      // Mock XeroConnection model to return null (no connection found)
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('non-existent', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('No Xero connection found');
    });
    
    it('should handle token refresh errors', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.findOne as jest.Mock).mockResolvedValue({
        userId: 'user123',
        organizationId: 'org456',
        refreshToken: 'invalid-refresh-token',
      });
      
      // Mock XeroClient to throw error
      const XeroClient = require('xero-node').XeroClient;
      XeroClient.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue({}),
        refreshToken: jest.fn().mockRejectedValue(new Error('Invalid refresh token')),
      }));
      
      // Call the method under test
      const result = await xeroAuthService.refreshAccessToken('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toContain('Error refreshing token');
    });
  });
  
  describe('getAuthenticatedClient', () => {
    it('should return an authenticated Xero client', async() => {
      // First mock the refreshAccessToken method
      jest.spyOn(xeroAuthService, 'refreshAccessToken').mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      
      // Call the method under test
      const client = await xeroAuthService.getAuthenticatedClient(mockUserCredentials);
      
      // Assertions
      expect(client).toBeDefined();
      expect(client.accountingApi).toBeDefined();
    });
    
    it('should handle authentication errors', async() => {
      // Mock refreshAccessToken to fail
      jest.spyOn(xeroAuthService, 'refreshAccessToken').mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });
      
      // Call the method under test and expect error
      await expect(xeroAuthService.getAuthenticatedClient(mockUserCredentials))
        .rejects.toThrow('Failed to authenticate with Xero');
    });
  });
  
  describe('disconnectXero', () => {
    it('should disconnect a Xero connection', async() => {
      // Mock XeroConnection model
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });
      
      // Call the method under test
      const result = await xeroAuthService.disconnectXero('user123', 'org456');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toContain('Xero connection disconnected');
    });
    
    it('should handle non-existent connection', async() => {
      // Mock XeroConnection model to return no modifications
      const mockXeroConnectionModel = mongoose.model('XeroConnection');
      (mockXeroConnectionModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 0 });
      
      // Call the method under test
      const result = await xeroAuthService.disconnectXero('non-existent', 'org456');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toContain('No Xero connection found');
    });
  });
});`;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    logSuccess(`Fixed: ${filePath}`);
  } else {
    log(`Would fix: ${filePath} (dry run)`);
  }
  
  return true;
}

// Function to fix xero-sync.service.test.ts
function fixSyncServiceTest() {
  const filePath = path.join(TARGET_DIR, 'xero-sync.service.test.ts');
  const content = `import { jest } from '@jest/globals';
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
});`;

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    logSuccess(`Fixed: ${filePath}`);
  } else {
    log(`Would fix: ${filePath} (dry run)`);
  }
  
  return true;
}

// Main execution
(async function main() {
  console.log('Completely fixing Xero connector test files with correct TypeScript syntax...');
  
  // Check TypeScript errors before fixes
  if (!SKIP_TYPECHECK) {
    const beforeErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors before fixes: ${beforeErrorCount}`);
  }
  
  // Process all test files
  const fixedCount = rewriteAllTestFiles();
  console.log(`Fixed ${fixedCount} files.`);
  
  // Check TypeScript errors after fixes
  if (!DRY_RUN && !SKIP_TYPECHECK) {
    const afterErrorCount = getTypeScriptErrorCount();
    console.log(`TypeScript errors after fixes: ${afterErrorCount}`);
  }
  
  console.log('Done!');
})();