import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import Customer from '../models/customer.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { ActivityService } from '../services/activity.service';

// Mock the populate function on mongoose queries
const mockPopulate = jest.fn().mockImplementation(function() {
  return this;
});

// Apply the mock to the mongoose Query prototype
mongoose.Query.prototype.populate = mockPopulate;

// Mock the ActivityService to avoid actual DB operations for activity logs
jest.mock('../services/activity.service', () => ({
  ActivityService: {
    logActivity: jest.fn().mockResolvedValue(null),
  },
}));

describe('Customer Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await Customer.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('customer-test@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');
    
    // Create authenticated request helper
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  // Helper function to create a test customer
  const createTestCustomer = async (override = {}) => {
    const defaultCustomer = {
      companyName: `Test Company ${Date.now()}`,
      industry: 'Technology',
      website: 'https://example.com',
      size: 'medium',
      annualRevenue: 5000000,
      primaryContact: {
        name: 'John Doe',
        title: 'CTO',
        email: 'john.doe@example.com',
        phone: '123-456-7890'
      },
      accountManager: user._id,
      customerSince: new Date(),
      status: 'active',
      createdBy: user._id
    };
    
    const customerData = { ...defaultCustomer, ...override };
    const customer = new Customer(customerData);
    return await customer.save();
  };
  
  // Routes for customers should be set up in the test app
  
  describe('GET /api/customers', () => {
    it('should return all customers with pagination', async () => {
      // Create test customers
      await createTestCustomer({ companyName: 'Company A' });
      await createTestCustomer({ companyName: 'Company B' });
      await createTestCustomer({ companyName: 'Company C' });
      
      // Execute request
      const response = await authRequest.get('/api/customers');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
    
    it('should filter customers by search term', async () => {
      await createTestCustomer({ 
        companyName: 'Acme Corporation',
        primaryContact: { name: 'John Smith', title: 'CEO', email: 'john@acme.com' }
      });
      await createTestCustomer({ 
        companyName: 'TechCorp',
        primaryContact: { name: 'Jane Smith', title: 'CTO', email: 'jane@techcorp.com' }
      });
      await createTestCustomer({ 
        companyName: 'Acme Solutions',
        primaryContact: { name: 'Robert Jones', title: 'COO', email: 'robert@acmesolutions.com' }
      });
      
      // Search by company name
      let response = await authRequest.get('/api/customers?search=acme');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map(c => c.companyName)).toContain('Acme Corporation');
      expect(response.body.data.map(c => c.companyName)).toContain('Acme Solutions');
      
      // Search by contact name
      response = await authRequest.get('/api/customers?search=smith');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data.map(c => c.primaryContact.name)).toContain('John Smith');
      expect(response.body.data.map(c => c.primaryContact.name)).toContain('Jane Smith');
    });
    
    it('should filter customers by industry', async () => {
      await createTestCustomer({ industry: 'Technology' });
      await createTestCustomer({ industry: 'Finance' });
      await createTestCustomer({ industry: 'Technology' });
      
      const response = await authRequest.get('/api/customers?industry=Technology');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.every(c => c.industry === 'Technology')).toBe(true);
    });
    
    it('should filter customers by size', async () => {
      await createTestCustomer({ size: 'small' });
      await createTestCustomer({ size: 'medium' });
      await createTestCustomer({ size: 'large' });
      
      const response = await authRequest.get('/api/customers?size=medium');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].size).toBe('medium');
    });
    
    it('should filter customers by status', async () => {
      await createTestCustomer({ status: 'active' });
      await createTestCustomer({ status: 'inactive' });
      await createTestCustomer({ status: 'prospect' });
      
      const response = await authRequest.get('/api/customers?status=inactive');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('inactive');
    });
    
    it('should filter customers by account manager', async () => {
      const otherUser = await testUtils.createTestUser('other-manager@example.com', 'password', 'admin');
      
      await createTestCustomer({ accountManager: user._id });
      await createTestCustomer({ accountManager: otherUser._id });
      
      const response = await authRequest.get(`/api/customers?accountManager=${user._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].accountManager.toString()).toBe(user._id.toString());
    });
    
    it('should sort customers correctly', async () => {
      await createTestCustomer({ companyName: 'Zebra Inc', customerSince: new Date('2023-01-01') });
      await createTestCustomer({ companyName: 'Alpha Corp', customerSince: new Date('2022-01-01') });
      await createTestCustomer({ companyName: 'Beta Ltd', customerSince: new Date('2021-01-01') });
      
      // Test ascending sort by name
      let response = await authRequest.get('/api/customers?sortBy=companyName&sortOrder=asc');
      
      expect(response.status).toBe(200);
      expect(response.body.data[0].companyName).toBe('Alpha Corp');
      expect(response.body.data[2].companyName).toBe('Zebra Inc');
      
      // Test descending sort by customerSince
      response = await authRequest.get('/api/customers?sortBy=customerSince&sortOrder=desc');
      
      expect(response.status).toBe(200);
      expect(new Date(response.body.data[0].customerSince).getFullYear()).toBe(2023);
      expect(new Date(response.body.data[2].customerSince).getFullYear()).toBe(2021);
    });
    
    it('should handle pagination correctly', async () => {
      // Create 15 test customers
      for (let i = 1; i <= 15; i++) {
        await createTestCustomer({ 
          companyName: `Company ${i}`,
        });
      }
      
      // Test first page with 5 customers per page
      const response = await authRequest.get('/api/customers?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      
      // Test second page
      const response2 = await authRequest.get('/api/customers?page=2&limit=5');
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
  });
  
  describe('GET /api/customers/:id', () => {
    it('should return a single customer by ID', async () => {
      const customer = await createTestCustomer({ 
        companyName: 'Test Customer', 
        industry: 'Healthcare',
        website: 'https://healthcare.example.com' 
      });
      
      const response = await authRequest.get(`/api/customers/${customer._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.companyName).toBe('Test Customer');
      expect(response.body.data.industry).toBe('Healthcare');
      expect(response.body.data.website).toBe('https://healthcare.example.com');
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/customers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.get('/api/customers/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid customer ID');
    });
  });
  
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        companyName: 'New Test Company',
        industry: 'Software',
        website: 'https://newcompany.example.com',
        size: 'enterprise',
        annualRevenue: 10000000,
        primaryContact: {
          name: 'Jane Doe',
          title: 'CEO',
          email: 'jane@newcompany.example.com',
          phone: '123-456-7890'
        },
        accountManager: user._id.toString(),
        tags: ['software', 'enterprise'],
      };
      
      const response = await authRequest.post('/api/customers').send(newCustomer);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.companyName).toBe(newCustomer.companyName);
      expect(response.body.data.industry).toBe(newCustomer.industry);
      expect(response.body.data.size).toBe(newCustomer.size);
      expect(response.body.data.primaryContact.email).toBe(newCustomer.primaryContact.email);
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
      
      // Verify customer was saved to database
      const savedCustomer = await Customer.findOne({ companyName: newCustomer.companyName });
      expect(savedCustomer).toBeDefined();
      expect(savedCustomer!.website).toBe(newCustomer.website);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 for missing required fields', async () => {
      const incompleteCustomer = {
        companyName: 'Incomplete Customer',
        // Missing required fields
      };
      
      const response = await authRequest.post('/api/customers').send(incompleteCustomer);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should return 400 for duplicate company name', async () => {
      // Create a customer first
      await createTestCustomer({ companyName: 'Duplicate Company' });
      
      // Try to create another with the same company name
      const duplicateCustomer = {
        companyName: 'Duplicate Company',
        industry: 'Technology',
        size: 'medium',
        primaryContact: {
          name: 'John Smith',
          title: 'CTO',
          email: 'john@duplicate.example.com'
        },
        accountManager: user._id.toString()
      };
      
      const response = await authRequest.post('/api/customers').send(duplicateCustomer);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      const customer = await createTestCustomer({
        primaryContact: {
          name: 'Old Contact',
          title: 'Manager',
          email: 'old@example.com'
        }
      });
      
      const updates = {
        website: 'https://updated.example.com',
        primaryContact: {
          name: 'New Contact',
          title: 'Director',
          email: 'new@example.com',
          phone: '987-654-3210'
        },
        status: 'inactive'
      };
      
      const response = await authRequest.put(`/api/customers/${customer._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.website).toBe(updates.website);
      expect(response.body.data.primaryContact.name).toBe(updates.primaryContact.name);
      expect(response.body.data.primaryContact.email).toBe(updates.primaryContact.email);
      expect(response.body.data.status).toBe(updates.status);
      
      // Verify customer was updated in database
      const updatedCustomer = await Customer.findById(customer._id);
      expect(updatedCustomer!.website).toBe(updates.website);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/customers/${nonExistentId}`).send({
        website: 'https://nonexistent.example.com',
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
    
    it('should return 400 when updating company name to an existing one', async () => {
      // Create two customers with different names
      await createTestCustomer({ companyName: 'First Company' });
      const secondCustomer = await createTestCustomer({ companyName: 'Second Company' });
      
      // Try to update second customer's name to match first customer's
      const updates = {
        companyName: 'First Company',
      };
      
      const response = await authRequest.put(`/api/customers/${secondCustomer._id}`).send(updates);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const customer = await createTestCustomer();
      
      const response = await authRequest.delete(`/api/customers/${customer._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify customer was deleted from database
      const deletedCustomer = await Customer.findById(customer._id);
      expect(deletedCustomer).toBeNull();
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/customers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
    
    it('should use deleteOne instead of deprecated remove method', async () => {
      const customer = await createTestCustomer();
      
      // Spy on the deleteOne method
      const deleteOneSpy = jest.spyOn(Customer, 'deleteOne');
      
      // Try to delete the customer
      const response = await authRequest.delete(`/api/customers/${customer._id}`);
      
      expect(response.status).toBe(200);
      
      // Verify deleteOne was called with the correct ID
      expect(deleteOneSpy).toHaveBeenCalledWith({ _id: customer._id.toString() });
      
      // Restore the spy
      deleteOneSpy.mockRestore();
    });
  });
  
  describe('GET /api/customers/stats', () => {
    it('should return customer statistics', async () => {
      // Create customers with various properties
      await createTestCustomer({ 
        industry: 'Technology',
        size: 'small',
        status: 'active',
        contractValue: 100000,
        customerSince: new Date()
      });
      
      await createTestCustomer({ 
        industry: 'Technology',
        size: 'large',
        status: 'active',
        contractValue: 500000,
        customerSince: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
      });
      
      await createTestCustomer({ 
        industry: 'Healthcare',
        size: 'medium',
        status: 'inactive',
        contractValue: 250000,
        customerSince: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) // 200 days ago
      });
      
      // Set up a customer with upcoming renewal
      const today = new Date();
      const renewalDate = new Date();
      renewalDate.setDate(today.getDate() + 30); // 30 days from now
      
      await createTestCustomer({
        contractRenewalDate: renewalDate,
        status: 'active'
      });
      
      const response = await authRequest.get('/api/customers/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // Check counts
      expect(response.body.data.totalCustomers).toBe(4);
      expect(response.body.data.statusBreakdown.active).toBe(3);
      expect(response.body.data.statusBreakdown.inactive).toBe(1);
      
      // Check industry breakdown
      expect(response.body.data.industryBreakdown.Technology).toBe(2);
      expect(response.body.data.industryBreakdown.Healthcare).toBe(1);
      
      // Check size breakdown
      expect(response.body.data.sizeBreakdown.small).toBe(1);
      expect(response.body.data.sizeBreakdown.medium).toBe(1);
      expect(response.body.data.sizeBreakdown.large).toBe(1);
      
      // Check contract value
      expect(response.body.data.totalContractValue).toBe(850000);
      
      // Check upcoming renewals
      expect(response.body.data.upcomingRenewalsCount).toBe(1);
      
      // Check recent customers (depends on the 30-day window)
      expect(response.body.data.recentCustomersCount).toBeGreaterThanOrEqual(1);
    });
    
    it('should return empty statistics when no customers exist', async () => {
      const response = await authRequest.get('/api/customers/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      expect(response.body.data.totalCustomers).toBe(0);
      expect(response.body.data.totalContractValue).toBe(0);
      expect(response.body.data.statusBreakdown).toEqual({});
      expect(response.body.data.industryBreakdown).toEqual({});
      expect(response.body.data.sizeBreakdown).toEqual({});
    });
  });
});