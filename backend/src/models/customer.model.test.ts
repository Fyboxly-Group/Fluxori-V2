import mongoose from 'mongoose';
import Customer, { ICustomerDocument } from './customer.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Customer Model', () => {
  let testCustomer: ICustomerDocument;
  const testUserId = new mongoose.Types.ObjectId();
  const testAccountManagerId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test customer before each test
    testCustomer = new Customer({
      companyName: 'Test Company',
      industry: 'Technology',
      website: 'https://testcompany.com',
      size: 'medium',
      annualRevenue: 5000000,
      logo: 'https://storage.com/test-company-logo.png',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'Test Country',
      },
      primaryContact: {
        name: 'John Smith',
        title: 'CEO',
        email: 'john@testcompany.com',
        phone: '123-456-7890',
      },
      secondaryContacts: [
        {
          name: 'Jane Doe',
          title: 'CTO',
          email: 'jane@testcompany.com',
          phone: '123-456-7891',
        }
      ],
      accountManager: testAccountManagerId,
      customerSince: new Date('2020-01-01'),
      contractValue: 100000,
      contractRenewalDate: new Date('2025-01-01'),
      nps: 9,
      status: 'active',
      tags: ['enterprise', 'tech', 'VIP'],
      notes: 'Important customer with growth potential',
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Customer.deleteMany({});
  });
  
  it('should create a new customer with the correct fields', async () => {
    const savedCustomer = await testCustomer.save();
    
    // Verify required fields
    expect(savedCustomer._id).toBeDefined();
    expect(savedCustomer.companyName).toBe('Test Company');
    expect(savedCustomer.industry).toBe('Technology');
    expect(savedCustomer.website).toBe('https://testcompany.com');
    expect(savedCustomer.size).toBe('medium');
    expect(savedCustomer.annualRevenue).toBe(5000000);
    expect(savedCustomer.logo).toBe('https://storage.com/test-company-logo.png');
    
    // Verify address
    expect(savedCustomer.address?.street).toBe('123 Test St');
    expect(savedCustomer.address?.city).toBe('Test City');
    expect(savedCustomer.address?.state).toBe('TS');
    expect(savedCustomer.address?.postalCode).toBe('12345');
    expect(savedCustomer.address?.country).toBe('Test Country');
    
    // Verify primary contact
    expect(savedCustomer.primaryContact.name).toBe('John Smith');
    expect(savedCustomer.primaryContact.title).toBe('CEO');
    expect(savedCustomer.primaryContact.email).toBe('john@testcompany.com');
    expect(savedCustomer.primaryContact.phone).toBe('123-456-7890');
    
    // Verify secondary contacts
    expect(savedCustomer.secondaryContacts?.length).toBe(1);
    expect(savedCustomer.secondaryContacts?.[0].name).toBe('Jane Doe');
    expect(savedCustomer.secondaryContacts?.[0].title).toBe('CTO');
    expect(savedCustomer.secondaryContacts?.[0].email).toBe('jane@testcompany.com');
    
    // Verify other fields
    expect(savedCustomer.accountManager.toString()).toBe(testAccountManagerId.toString());
    expect(savedCustomer.customerSince).toEqual(new Date('2020-01-01'));
    expect(savedCustomer.contractValue).toBe(100000);
    expect(savedCustomer.contractRenewalDate).toEqual(new Date('2025-01-01'));
    expect(savedCustomer.nps).toBe(9);
    expect(savedCustomer.status).toBe('active');
    expect(savedCustomer.tags).toEqual(['enterprise', 'tech', 'VIP']);
    expect(savedCustomer.notes).toBe('Important customer with growth potential');
    expect(savedCustomer.createdBy.toString()).toBe(testUserId.toString());
    expect(savedCustomer.createdAt).toBeDefined();
    expect(savedCustomer.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteCustomer = new Customer({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.companyName).toBeDefined();
    expect(error.errors.industry).toBeDefined();
    expect(error.errors.size).toBeDefined();
    expect(error.errors['primaryContact.name']).toBeDefined();
    expect(error.errors['primaryContact.title']).toBeDefined();
    expect(error.errors['primaryContact.email']).toBeDefined();
    expect(error.errors.accountManager).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate size is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testCustomer.size = 'invalid_size';
    
    let error;
    try {
      await testCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.size).toBeDefined();
    
    // Test with valid size
    testCustomer.size = 'large';
    
    // Should not throw error
    await testCustomer.validate();
  });
  
  it('should validate status is within allowed values', async () => {
    // @ts-ignore: intentionally testing invalid value
    testCustomer.status = 'invalid_status';
    
    let error;
    try {
      await testCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
    
    // Test with valid status
    testCustomer.status = 'prospect';
    
    // Should not throw error
    await testCustomer.validate();
  });
  
  it('should validate NPS is between 0 and 10', async () => {
    // Test with NPS below minimum
    testCustomer.nps = -1;
    
    let error;
    try {
      await testCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.nps).toBeDefined();
    
    // Reset error
    error = undefined;
    
    // Test with NPS above maximum
    testCustomer.nps = 11;
    
    try {
      await testCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.nps).toBeDefined();
    
    // Test with valid NPS
    testCustomer.nps = 8;
    
    // Should not throw error
    await testCustomer.validate();
  });
  
  it('should validate required fields in secondary contacts', async () => {
    // Test with incomplete secondary contact
    testCustomer.secondaryContacts = [
      {
        // @ts-ignore: intentionally omitting required fields
        name: 'Jane Doe',
        // Missing title and email
        phone: '123-456-7891',
      }
    ];
    
    let error;
    try {
      await testCustomer.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['secondaryContacts.0.title']).toBeDefined();
    expect(error.errors['secondaryContacts.0.email']).toBeDefined();
  });
  
  it('should trim whitespace from string fields', async () => {
    testCustomer.companyName = '  Trimmed Company Name  ';
    testCustomer.industry = '  Software  ';
    testCustomer.tags = ['  tag1  ', '  tag2  '];
    
    const savedCustomer = await testCustomer.save();
    
    expect(savedCustomer.companyName).toBe('Trimmed Company Name');
    expect(savedCustomer.industry).toBe('Software');
    expect(savedCustomer.tags[0]).toBe('tag1');
    expect(savedCustomer.tags[1]).toBe('tag2');
  });
  
  it('should handle partial address information', async () => {
    testCustomer.address = {
      street: '456 Partial St',
      city: 'Partial City',
      // Missing state, postalCode, and country
    } as any; // Use 'as any' to bypass TypeScript checks for testing
    
    // Should not throw validation error for partial address
    await testCustomer.validate();
    
    const savedCustomer = await testCustomer.save();
    
    expect(savedCustomer.address?.street).toBe('456 Partial St');
    expect(savedCustomer.address?.city).toBe('Partial City');
    expect(savedCustomer.address?.state).toBeUndefined();
  });
  
  it('should add default values when not provided', async () => {
    // Create a customer without optional fields that have defaults
    const minimalCustomer = new Customer({
      companyName: 'Minimal Company',
      industry: 'Retail',
      size: 'small',
      primaryContact: {
        name: 'Minimal Contact',
        title: 'Owner',
        email: 'contact@minimal.com',
      },
      accountManager: testAccountManagerId,
      createdBy: testUserId,
    });
    
    const savedCustomer = await minimalCustomer.save();
    
    // Default values should be set
    expect(savedCustomer.status).toBe('active');
    expect(savedCustomer.customerSince).toBeDefined(); // Default to current date
  });
});