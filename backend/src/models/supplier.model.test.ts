import mongoose from 'mongoose';
import Supplier, { ISupplierDocument } from './supplier.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Supplier Model', () => {
  let testSupplier: ISupplierDocument;
  const testUserId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    // Create a test supplier before each test
    testSupplier = new Supplier({
      name: 'Test Supplier',
      contactPerson: 'John Doe',
      email: 'contact@testsupplier.com',
      phone: '123-456-7890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
      },
      paymentTerms: 'Net 30',
      leadTime: 14,
      minimumOrderValue: 1000,
      website: 'https://testsupplier.com',
      isActive: true,
      categories: ['Electronics', 'Components'],
      rating: 4,
      createdBy: testUserId,
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    await Supplier.deleteMany({});
  });
  
  it('should create a new supplier with the correct fields', async () => {
    const savedSupplier = await testSupplier.save();
    
    // Verify required fields
    expect(savedSupplier._id).toBeDefined();
    expect(savedSupplier.name).toBe('Test Supplier');
    expect(savedSupplier.contactPerson).toBe('John Doe');
    expect(savedSupplier.email).toBe('contact@testsupplier.com');
    expect(savedSupplier.phone).toBe('123-456-7890');
    expect(savedSupplier.address.street).toBe('123 Test St');
    expect(savedSupplier.address.city).toBe('Test City');
    expect(savedSupplier.address.state).toBe('Test State');
    expect(savedSupplier.address.postalCode).toBe('12345');
    expect(savedSupplier.address.country).toBe('Test Country');
    expect(savedSupplier.paymentTerms).toBe('Net 30');
    expect(savedSupplier.leadTime).toBe(14);
    expect(savedSupplier.minimumOrderValue).toBe(1000);
    expect(savedSupplier.website).toBe('https://testsupplier.com');
    expect(savedSupplier.isActive).toBe(true);
    expect(savedSupplier.categories).toEqual(['Electronics', 'Components']);
    expect(savedSupplier.rating).toBe(4);
    expect(savedSupplier.createdBy.toString()).toBe(testUserId.toString());
    expect(savedSupplier.createdAt).toBeDefined();
    expect(savedSupplier.updatedAt).toBeDefined();
  });
  
  it('should require all required fields', async () => {
    const incompleteSupplier = new Supplier({
      // Missing required fields
    });
    
    // Use a try/catch block to capture validation errors
    let error;
    try {
      await incompleteSupplier.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.contactPerson).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.phone).toBeDefined();
    expect(error.errors['address.street']).toBeDefined();
    expect(error.errors['address.city']).toBeDefined();
    expect(error.errors['address.state']).toBeDefined();
    expect(error.errors['address.postalCode']).toBeDefined();
    expect(error.errors['address.country']).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });
  
  it('should validate rating is between 1 and 5', async () => {
    // Test with rating below minimum
    testSupplier.rating = 0;
    
    let error;
    try {
      await testSupplier.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.rating).toBeDefined();
    
    // Reset error
    error = undefined;
    
    // Test with rating above maximum
    testSupplier.rating = 6;
    
    try {
      await testSupplier.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.rating).toBeDefined();
    
    // Test with valid rating
    testSupplier.rating = 3;
    
    // Should not throw error
    await testSupplier.validate();
  });
  
  it('should validate lead time is not negative', async () => {
    testSupplier.leadTime = -1;
    
    let error;
    try {
      await testSupplier.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.leadTime).toBeDefined();
    
    // Test with valid lead time
    testSupplier.leadTime = 0;
    
    // Should not throw error
    await testSupplier.validate();
  });
  
  it('should validate minimum order value is not negative', async () => {
    testSupplier.minimumOrderValue = -100;
    
    let error;
    try {
      await testSupplier.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.minimumOrderValue).toBeDefined();
    
    // Test with valid minimum order value
    testSupplier.minimumOrderValue = 0;
    
    // Should not throw error
    await testSupplier.validate();
  });
  
  it('should automatically convert email to lowercase', async () => {
    testSupplier.email = 'TEST@ExamPle.CoM';
    
    const savedSupplier = await testSupplier.save();
    
    expect(savedSupplier.email).toBe('test@example.com');
  });
  
  it('should trim whitespace from string fields', async () => {
    testSupplier.name = '  Trimmed Name  ';
    testSupplier.contactPerson = '  John Smith  ';
    testSupplier.categories = ['  Category1  ', '  Category2  '];
    
    const savedSupplier = await testSupplier.save();
    
    expect(savedSupplier.name).toBe('Trimmed Name');
    expect(savedSupplier.contactPerson).toBe('John Smith');
    expect(savedSupplier.categories[0]).toBe('Category1');
    expect(savedSupplier.categories[1]).toBe('Category2');
  });
});