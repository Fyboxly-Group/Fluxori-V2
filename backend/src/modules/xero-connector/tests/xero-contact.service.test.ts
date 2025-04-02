import { jest } from '@jest/globals';
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
});