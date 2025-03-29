import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Customer from '../../models/customer.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Customer API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Customer.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-customer@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-customer@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test customer
  const createTestCustomer = async (userId: string, overrides = {}) => {
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
      accountManager: userId,
      customerSince: new Date(),
      status: 'active',
      createdBy: userId
    };
    
    const customerData = { ...defaultCustomer, ...overrides };
    const customer = new Customer(customerData);
    return await customer.save();
  };
  
  describe('GET /api/customers', () => {
    it('should return all customers for authenticated user', async () => {
      // Create multiple customers
      await createTestCustomer(adminUser._id.toString(), { companyName: 'Company A' });
      await createTestCustomer(adminUser._id.toString(), { companyName: 'Company B' });
      await createTestCustomer(regularUser._id.toString(), { companyName: 'Company C' });
      
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // All customers
      expect(response.body.count).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should filter customers by search term', async () => {
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Acme Corporation',
        primaryContact: { name: 'John Smith', title: 'CEO', email: 'john@acme.com' }
      });
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'TechCorp',
        primaryContact: { name: 'Jane Smith', title: 'CTO', email: 'jane@techcorp.com' }
      });
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Acme Solutions',
        primaryContact: { name: 'Robert Jones', title: 'COO', email: 'robert@acmesolutions.com' }
      });
      
      // Search by company name
      const response = await request(app)
        .get('/api/customers?search=acme')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.map((c: any) => c.companyName)).toContain('Acme Corporation');
      expect(response.body.data.map((c: any) => c.companyName)).toContain('Acme Solutions');
      
      // Search by contact name
      const response2 = await request(app)
        .get('/api/customers?search=smith')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(2);
      expect(response2.body.data[0].primaryContact.name).toMatch(/Smith/);
      expect(response2.body.data[1].primaryContact.name).toMatch(/Smith/);
    });
    
    it('should filter customers by industry', async () => {
      await createTestCustomer(adminUser._id.toString(), { industry: 'Technology' });
      await createTestCustomer(adminUser._id.toString(), { industry: 'Finance' });
      await createTestCustomer(adminUser._id.toString(), { industry: 'Healthcare' });
      
      const response = await request(app)
        .get('/api/customers?industry=Finance')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].industry).toBe('Finance');
    });
    
    it('should filter customers by size', async () => {
      await createTestCustomer(adminUser._id.toString(), { size: 'small' });
      await createTestCustomer(adminUser._id.toString(), { size: 'medium' });
      await createTestCustomer(adminUser._id.toString(), { size: 'large' });
      await createTestCustomer(adminUser._id.toString(), { size: 'enterprise' });
      
      const response = await request(app)
        .get('/api/customers?size=enterprise')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].size).toBe('enterprise');
    });
    
    it('should filter customers by status', async () => {
      await createTestCustomer(adminUser._id.toString(), { status: 'active' });
      await createTestCustomer(adminUser._id.toString(), { status: 'inactive' });
      await createTestCustomer(adminUser._id.toString(), { status: 'prospect' });
      
      const response = await request(app)
        .get('/api/customers?status=prospect')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('prospect');
    });
    
    it('should filter customers by account manager', async () => {
      await createTestCustomer(adminUser._id.toString(), { accountManager: adminUser._id });
      await createTestCustomer(regularUser._id.toString(), { accountManager: regularUser._id });
      
      const response = await request(app)
        .get(`/api/customers?accountManager=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].accountManager._id.toString()).toBe(regularUser._id.toString());
    });
    
    it('should sort customers correctly', async () => {
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Zebra Inc', 
        customerSince: new Date('2023-01-01') 
      });
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Alpha Corp', 
        customerSince: new Date('2022-01-01') 
      });
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Beta Ltd', 
        customerSince: new Date('2021-01-01') 
      });
      
      // Sort by company name ascending
      const response = await request(app)
        .get('/api/customers?sortBy=companyName&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data[0].companyName).toBe('Alpha Corp');
      expect(response.body.data[1].companyName).toBe('Beta Ltd');
      expect(response.body.data[2].companyName).toBe('Zebra Inc');
      
      // Sort by customer since descending
      const response2 = await request(app)
        .get('/api/customers?sortBy=customerSince&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(new Date(response2.body.data[0].customerSince).getFullYear()).toBe(2023);
      expect(new Date(response2.body.data[1].customerSince).getFullYear()).toBe(2022);
      expect(new Date(response2.body.data[2].customerSince).getFullYear()).toBe(2021);
    });
    
    it('should paginate results correctly', async () => {
      // Create 15 customers
      for (let i = 1; i <= 15; i++) {
        await createTestCustomer(adminUser._id.toString(), { 
          companyName: `Paginated Company ${i}` 
        });
      }
      
      // Get first page with 5 items
      const response = await request(app)
        .get('/api/customers?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
      
      // Get second page
      const response2 = await request(app)
        .get('/api/customers?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/customers');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/customers/:id', () => {
    it('should return a specific customer by ID', async () => {
      const customer = await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Specific Customer',
        website: 'https://specific.example.com',
        tags: ['important', 'client']
      });
      
      const response = await request(app)
        .get(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.companyName).toBe('Specific Customer');
      expect(response.body.data.website).toBe('https://specific.example.com');
      expect(response.body.data.tags).toContain('important');
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
    
    it('should return 400 for invalid customer ID', async () => {
      const response = await request(app)
        .get('/api/customers/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid customer ID');
    });
  });
  
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        companyName: 'New Integration Test Customer',
        industry: 'Software',
        website: 'https://newtestcustomer.example.com',
        size: 'large',
        annualRevenue: 15000000,
        primaryContact: {
          name: 'Jane Doe',
          title: 'CEO',
          email: 'jane@newtestcustomer.example.com',
          phone: '123-456-7890'
        },
        accountManager: adminUser._id.toString(),
        status: 'active',
        tags: ['software', 'integration-test'],
      };
      
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCustomer);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.companyName).toBe(newCustomer.companyName);
      expect(response.body.data.industry).toBe(newCustomer.industry);
      expect(response.body.data.status).toBe(newCustomer.status);
      expect(response.body.data.primaryContact.email).toBe(newCustomer.primaryContact.email);
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.tags).toEqual(expect.arrayContaining(newCustomer.tags));
      
      // Verify customer was created in database
      const createdCustomer = await Customer.findById(response.body.data._id);
      expect(createdCustomer).toBeDefined();
      expect(createdCustomer!.companyName).toBe(newCustomer.companyName);
    });
    
    it('should validate required fields when creating a customer', async () => {
      const incompleteCustomer = {
        // Missing required fields
        companyName: 'Incomplete Customer',
        website: 'https://incomplete.example.com'
      };
      
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteCustomer);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should prevent duplicate company names', async () => {
      // Create a customer first
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Duplicate Test Customer' 
      });
      
      // Try to create another with the same name
      const duplicateCustomer = {
        companyName: 'Duplicate Test Customer',
        industry: 'Technology',
        size: 'medium',
        primaryContact: {
          name: 'John Smith',
          title: 'CTO',
          email: 'john@duplicate.example.com'
        },
        accountManager: adminUser._id.toString()
      };
      
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateCustomer);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      const customer = await createTestCustomer(adminUser._id.toString(), { 
        primaryContact: {
          name: 'Original Contact',
          title: 'Manager',
          email: 'original@example.com',
          phone: '123-456-7890'
        }
      });
      
      const updates = {
        companyName: 'Updated Company Name',
        website: 'https://updated.example.com',
        primaryContact: {
          name: 'Updated Contact',
          title: 'Director',
          email: 'updated@example.com',
          phone: '987-654-3210'
        },
        status: 'inactive'
      };
      
      const response = await request(app)
        .put(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe(updates.companyName);
      expect(response.body.data.website).toBe(updates.website);
      expect(response.body.data.primaryContact.name).toBe(updates.primaryContact.name);
      expect(response.body.data.primaryContact.email).toBe(updates.primaryContact.email);
      expect(response.body.data.status).toBe(updates.status);
      
      // Verify customer was updated in database
      const updatedCustomer = await Customer.findById(customer._id);
      expect(updatedCustomer!.companyName).toBe(updates.companyName);
      expect(updatedCustomer!.primaryContact.email).toBe(updates.primaryContact.email);
    });
    
    it('should prevent updating company name to an existing one', async () => {
      // Create two customers with different names
      await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'First Test Company' 
      });
      
      const secondCustomer = await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Second Test Company' 
      });
      
      // Try to update second customer's name to match first
      const updates = {
        companyName: 'First Test Company'
      };
      
      const response = await request(app)
        .put(`/api/customers/${secondCustomer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const updates = {
        website: 'https://nonexistent.example.com'
      };
      
      const response = await request(app)
        .put(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });
  
  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const customer = await createTestCustomer(adminUser._id.toString());
      
      const response = await request(app)
        .delete(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify customer was deleted from database
      const deletedCustomer = await Customer.findById(customer._id);
      expect(deletedCustomer).toBeNull();
    });
    
    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });
  
  describe('GET /api/customers/stats', () => {
    it('should return customer statistics', async () => {
      // Create test customers with various properties
      await createTestCustomer(adminUser._id.toString(), { 
        industry: 'Technology',
        size: 'small',
        status: 'active',
        contractValue: 100000,
        customerSince: new Date()
      });
      
      await createTestCustomer(adminUser._id.toString(), { 
        industry: 'Technology',
        size: 'large',
        status: 'active',
        contractValue: 500000,
        customerSince: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
      });
      
      await createTestCustomer(adminUser._id.toString(), { 
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
      
      await createTestCustomer(adminUser._id.toString(), {
        contractRenewalDate: renewalDate,
        status: 'active'
      });
      
      const response = await request(app)
        .get('/api/customers/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
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
      const response = await request(app)
        .get('/api/customers/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      expect(response.body.data.totalCustomers).toBe(0);
      expect(response.body.data.totalContractValue).toBe(0);
      expect(response.body.data.statusBreakdown).toEqual({});
      expect(response.body.data.industryBreakdown).toEqual({});
      expect(response.body.data.sizeBreakdown).toEqual({});
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/customers/stats');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});