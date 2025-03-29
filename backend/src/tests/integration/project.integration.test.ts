import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Project from '../../models/project.model';
import Customer from '../../models/customer.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Project API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testCustomer: any;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Customer.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-project@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-project@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    
    // Create a test customer
    testCustomer = await createTestCustomer(adminUser._id.toString());
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
      size: 'medium',
      primaryContact: {
        name: 'John Contact',
        title: 'CTO',
        email: 'john@testcompany.com',
      },
      accountManager: userId,
      status: 'active',
      createdBy: userId,
    };
    
    const customerData = { ...defaultCustomer, ...overrides };
    const customer = new Customer(customerData);
    return await customer.save();
  };
  
  // Helper function to create a test project
  const createTestProject = async (userId: string, customerId: string, overrides = {}) => {
    const defaultProject = {
      name: `Test Project ${Date.now()}`,
      description: 'Project description',
      customer: customerId,
      accountManager: userId,
      status: 'planning',
      phase: 'discovery',
      startDate: new Date(),
      objectives: ['Complete integration tests'],
      createdBy: userId,
    };
    
    const projectData = { ...defaultProject, ...overrides };
    const project = new Project(projectData);
    return await project.save();
  };
  
  describe('GET /api/projects', () => {
    it('should return all projects for admin user', async () => {
      // Create multiple projects
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { name: 'Admin Project 1' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { name: 'Admin Project 2' });
      await createTestProject(regularUser._id.toString(), testCustomer._id.toString(), { name: 'User Project' });
      
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // Admin sees all projects
      expect(response.body.count).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should filter projects by status', async () => {
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'planning' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'active' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'completed' });
      
      const response = await request(app)
        .get('/api/projects?status=active')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('active');
    });
    
    it('should filter projects by phase', async () => {
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { phase: 'discovery' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { phase: 'implementation' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { phase: 'testing' });
      
      const response = await request(app)
        .get('/api/projects?phase=implementation')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].phase).toBe('implementation');
    });
    
    it('should filter projects by customer', async () => {
      // Create another customer
      const anotherCustomer = await createTestCustomer(adminUser._id.toString(), { 
        companyName: 'Another Company' 
      });
      
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      await createTestProject(adminUser._id.toString(), anotherCustomer._id.toString());
      
      const response = await request(app)
        .get(`/api/projects?customer=${testCustomer._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customer._id.toString()).toBe(testCustomer._id.toString());
    });
    
    it('should search projects by name or description', async () => {
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Special Project', 
        description: 'Standard description' 
      });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Regular Project', 
        description: 'Special description' 
      });
      
      // Search by name
      const nameResponse = await request(app)
        .get('/api/projects?search=Special Project')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(nameResponse.status).toBe(200);
      expect(nameResponse.body.data.length).toBe(1);
      expect(nameResponse.body.data[0].name).toBe('Special Project');
      
      // Search by description
      const descResponse = await request(app)
        .get('/api/projects?search=Special description')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(descResponse.status).toBe(200);
      expect(descResponse.body.data.length).toBe(1);
      expect(descResponse.body.data[0].description).toBe('Special description');
    });
    
    it('should paginate results correctly', async () => {
      // Create 15 projects
      for (let i = 1; i <= 15; i++) {
        await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
          name: `Paginated Project ${i}` 
        });
      }
      
      // Get first page with 5 items
      const response = await request(app)
        .get('/api/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
      
      // Get second page
      const response2 = await request(app)
        .get('/api/projects?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should sort projects correctly', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
      
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Past Project', 
        startDate: pastDate 
      });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Future Project', 
        startDate: futureDate 
      });
      
      // Sort by startDate ascending
      const response = await request(app)
        .get('/api/projects?sortBy=startDate&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data[0].name).toBe('Past Project');
      expect(response.body.data[1].name).toBe('Future Project');
      
      // Sort by startDate descending
      const response2 = await request(app)
        .get('/api/projects?sortBy=startDate&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data[0].name).toBe('Future Project');
      expect(response2.body.data[1].name).toBe('Past Project');
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/projects');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/projects/:id', () => {
    it('should return a specific project by ID', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Specific Project',
        tags: ['important', 'client-focused']
      });
      
      const response = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Specific Project');
      expect(response.body.data.tags).toContain('important');
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
    
    it('should return 400 for invalid project ID', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid project ID');
    });
  });
  
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const newProject = {
        name: 'New Integration Test Project',
        description: 'Project for testing project creation',
        customer: testCustomer._id.toString(),
        accountManager: adminUser._id.toString(),
        status: 'planning',
        phase: 'discovery',
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 50000,
        objectives: ['Complete integration testing', 'Deploy to production'],
        tags: ['test', 'integration'],
      };
      
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProject);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(newProject.name);
      expect(response.body.data.description).toBe(newProject.description);
      expect(response.body.data.status).toBe(newProject.status);
      expect(response.body.data.phase).toBe(newProject.phase);
      expect(response.body.data.objectives).toEqual(expect.arrayContaining(newProject.objectives));
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.tags).toEqual(expect.arrayContaining(newProject.tags));
      
      // Verify project was created in database
      const createdProject = await Project.findById(response.body.data._id);
      expect(createdProject).toBeDefined();
      expect(createdProject!.name).toBe(newProject.name);
    });
    
    it('should validate required fields when creating a project', async () => {
      const incompleteProject = {
        // Missing name, customer, and objectives
        description: 'Incomplete project',
        accountManager: adminUser._id.toString(),
        startDate: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteProject);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should validate customer exists when creating a project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const projectWithInvalidCustomer = {
        name: 'Project with invalid customer',
        description: 'This should fail validation',
        customer: nonExistentId.toString(),
        accountManager: adminUser._id.toString(),
        startDate: new Date().toISOString(),
        objectives: ['Test validation'],
      };
      
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(projectWithInvalidCustomer);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });
  
  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        name: 'Project to Update'
      });
      
      const updates = {
        name: 'Updated Project Name',
        description: 'Updated description',
        status: 'active',
        phase: 'implementation',
      };
      
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.phase).toBe(updates.phase);
      
      // Verify project was updated in database
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.name).toBe(updates.name);
    });
    
    it('should not allow regular users to update projects they do not own or manage', async () => {
      // Create project with admin as account manager
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        accountManager: adminUser._id.toString(),
        createdBy: adminUser._id.toString()
      });
      
      const updates = {
        description: 'Unauthorized update',
      };
      
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    it('should update project completion date when status is set to completed', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        status: 'active'
      });
      
      const updates = {
        status: 'completed',
      };
      
      const response = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actualCompletionDate).toBeDefined();
      
      // Verify project was updated in database
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.status).toBe('completed');
      expect(updatedProject!.actualCompletionDate).toBeDefined();
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/projects/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Title' });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('DELETE /api/projects/:id', () => {
    it('should delete a project as admin', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      
      const response = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify project was deleted from database
      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/projects/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('POST /api/projects/:id/documents', () => {
    it('should add a document to a project', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      
      const documentData = {
        title: 'Test Document',
        fileUrl: 'https://example.com/test-document.pdf',
        category: 'proposal'
      };
      
      const response = await request(app)
        .post(`/api/projects/${project._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(documentData);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.fileUrl).toBe(documentData.fileUrl);
      expect(response.body.data.category).toBe(documentData.category);
      
      // Verify document was added to project
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.documents.length).toBe(1);
      expect(updatedProject!.documents[0].title).toBe(documentData.title);
    });
    
    it('should validate required document fields', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      
      const incompleteDocumentData = {
        // Missing title
        fileUrl: 'https://example.com/test-document.pdf',
      };
      
      const response = await request(app)
        .post(`/api/projects/${project._id}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteDocumentData);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/projects/:id/documents/:documentId', () => {
    it('should remove a document from a project', async () => {
      // Create project with a document
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      
      // Add a document to the project
      project.documents.push({
        title: 'Document to Remove',
        fileUrl: 'https://example.com/document.pdf',
        category: 'other',
        uploadedBy: adminUser._id,
        uploadedAt: new Date(),
      });
      
      await project.save();
      
      const documentId = project.documents[0]._id;
      
      const response = await request(app)
        .delete(`/api/projects/${project._id}/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Document removed successfully');
      
      // Verify document was removed from project
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.documents.length).toBe(0);
    });
    
    it('should return 404 for non-existent document', async () => {
      const project = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
      const nonExistentDocId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/projects/${project._id}/documents/${nonExistentDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Document not found in this project');
    });
  });
  
  describe('GET /api/projects/stats', () => {
    it('should return project statistics', async () => {
      // Create projects with different statuses
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'planning' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'planning' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'active' });
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { status: 'completed' });
      
      // Create project with budget
      await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), { 
        budget: 25000,
        status: 'active'
      });
      
      const response = await request(app)
        .get('/api/projects/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalProjects).toBe(5);
      expect(response.body.data.statusBreakdown).toBeDefined();
      expect(response.body.data.statusBreakdown.planning).toBe(2);
      expect(response.body.data.statusBreakdown.active).toBe(2);
      expect(response.body.data.statusBreakdown.completed).toBe(1);
      expect(response.body.data.totalBudget).toBe(25000);
    });
  });
});