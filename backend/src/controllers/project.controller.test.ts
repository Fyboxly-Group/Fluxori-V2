import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import Project from '../models/project.model';
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

describe('Project Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  let testCustomer: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await Project.deleteMany({});
    await Customer.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('project-test@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');
    
    // Create authenticated request helper
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Create a test customer to use in projects
    testCustomer = await createTestCustomer();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  // Helper function to create a test customer
  const createTestCustomer = async (override = {}) => {
    const defaultCustomer = {
      companyName: `Test Company ${Date.now()}`,
      industry: 'Technology',
      size: 'medium',
      primaryContact: {
        name: 'John Doe',
        title: 'CTO',
        email: 'john.doe@example.com',
      },
      accountManager: user._id,
      status: 'active',
      createdBy: user._id
    };
    
    const customerData = { ...defaultCustomer, ...override };
    const customer = new Customer(customerData);
    return await customer.save();
  };
  
  // Helper function to create a test project
  const createTestProject = async (override = {}) => {
    const defaultProject = {
      name: `Test Project ${Date.now()}`,
      description: 'Test project description',
      customer: testCustomer._id,
      accountManager: user._id,
      status: 'planning',
      phase: 'discovery',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      objectives: ['Complete phase 1', 'Implement core features'],
      businessValue: 'Increase efficiency by 30%',
      createdBy: user._id
    };
    
    const projectData = { ...defaultProject, ...override };
    const project = new Project(projectData);
    return await project.save();
  };
  
  describe('GET /api/projects', () => {
    it('should return all projects with pagination', async () => {
      // Create test projects
      await createTestProject({ name: 'Project A' });
      await createTestProject({ name: 'Project B' });
      await createTestProject({ name: 'Project C' });
      
      // Execute request
      const response = await authRequest.get('/api/projects');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
    
    it('should filter projects by search term', async () => {
      await createTestProject({ name: 'Alpha Project', description: 'First test project' });
      await createTestProject({ name: 'Beta Implementation', description: 'Second test project' });
      await createTestProject({ name: 'Gamma Features', description: 'Integration project' });
      
      // Search by name
      let response = await authRequest.get('/api/projects?search=beta');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Beta Implementation');
      
      // Search by description
      response = await authRequest.get('/api/projects?search=integration');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Gamma Features');
    });
    
    it('should filter projects by customer', async () => {
      const secondCustomer = await createTestCustomer({ companyName: 'Second Customer' });
      
      await createTestProject({ customer: testCustomer._id });
      await createTestProject({ customer: secondCustomer._id });
      
      const response = await authRequest.get(`/api/projects?customer=${secondCustomer._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].customer.toString()).toBe(secondCustomer._id.toString());
    });
    
    it('should filter projects by status', async () => {
      await createTestProject({ status: 'planning' });
      await createTestProject({ status: 'active' });
      await createTestProject({ status: 'completed' });
      
      const response = await authRequest.get('/api/projects?status=active');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('active');
    });
    
    it('should filter projects by phase', async () => {
      await createTestProject({ phase: 'discovery' });
      await createTestProject({ phase: 'implementation' });
      await createTestProject({ phase: 'testing' });
      
      const response = await authRequest.get('/api/projects?phase=implementation');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].phase).toBe('implementation');
    });
    
    it('should filter projects by account manager', async () => {
      const otherUser = await testUtils.createTestUser('other-manager@example.com', 'password', 'admin');
      
      await createTestProject({ accountManager: user._id });
      await createTestProject({ accountManager: otherUser._id });
      
      const response = await authRequest.get(`/api/projects?accountManager=${otherUser._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].accountManager.toString()).toBe(otherUser._id.toString());
    });
    
    it('should filter projects by date range', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in future
      
      await createTestProject({ startDate: new Date(pastDate.setDate(pastDate.getDate() - 60)) }); // 90 days ago
      await createTestProject({ startDate: new Date() }); // today
      await createTestProject({ startDate: new Date(futureDate) }); // 30 days in future
      
      // Test filtering by from date
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 15); // 15 days ago
      
      const response = await authRequest.get(`/api/projects?fromDate=${fromDate.toISOString()}`);
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2); // today and future
      
      // Test filtering by to date
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 15); // 15 days in future
      
      const response2 = await authRequest.get(`/api/projects?toDate=${toDate.toISOString()}`);
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(2); // past and today
      
      // Test filtering by date range
      const response3 = await authRequest.get(
        `/api/projects?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`
      );
      
      expect(response3.status).toBe(200);
      expect(response3.body.count).toBe(1); // only today
    });
    
    it('should handle pagination correctly', async () => {
      // Create 15 test projects
      for (let i = 1; i <= 15; i++) {
        await createTestProject({ name: `Project ${i}` });
      }
      
      // Test first page with 5 projects per page
      const response = await authRequest.get('/api/projects?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      
      // Test second page
      const response2 = await authRequest.get('/api/projects?page=2&limit=5');
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
  });
  
  describe('GET /api/projects/:id', () => {
    it('should return a single project by ID', async () => {
      const project = await createTestProject({ 
        name: 'Detailed Project',
        description: 'Detailed project description',
        phase: 'implementation'
      });
      
      const response = await authRequest.get(`/api/projects/${project._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Detailed Project');
      expect(response.body.data.description).toBe('Detailed project description');
      expect(response.body.data.phase).toBe('implementation');
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/projects/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.get('/api/projects/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid project ID');
    });
  });
  
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const newProject = {
        name: 'New Test Project',
        description: 'Creating a new test project',
        customer: testCustomer._id.toString(),
        accountManager: user._id.toString(),
        status: 'planning',
        phase: 'discovery',
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 150000,
        objectives: ['Complete MVP', 'Deploy to production'],
        businessValue: 'Increase revenue by 20%',
        tags: ['high-priority', 'strategic'],
      };
      
      const response = await authRequest.post('/api/projects').send(newProject);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(newProject.name);
      expect(response.body.data.description).toBe(newProject.description);
      expect(response.body.data.budget).toBe(newProject.budget);
      expect(response.body.data.objectives).toEqual(expect.arrayContaining(newProject.objectives));
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
      
      // Verify project was saved to database
      const savedProject = await Project.findById(response.body.data._id);
      expect(savedProject).toBeDefined();
      expect(savedProject!.name).toBe(newProject.name);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 for missing required fields', async () => {
      const incompleteProject = {
        name: 'Incomplete Project',
        // Missing required fields
      };
      
      const response = await authRequest.post('/api/projects').send(incompleteProject);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should return 404 for invalid customer ID', async () => {
      const nonExistentCustomerId = new mongoose.Types.ObjectId();
      
      const projectWithInvalidCustomer = {
        name: 'Invalid Customer Project',
        customer: nonExistentCustomerId.toString(),
        accountManager: user._id.toString(),
        startDate: new Date().toISOString(),
        objectives: ['Test objective'],
      };
      
      const response = await authRequest.post('/api/projects').send(projectWithInvalidCustomer);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer not found');
    });
  });
  
  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      const project = await createTestProject();
      
      const updates = {
        name: 'Updated Project Name',
        description: 'Updated project description',
        status: 'active',
        phase: 'implementation',
        budget: 200000,
      };
      
      const response = await authRequest.put(`/api/projects/${project._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.phase).toBe(updates.phase);
      expect(response.body.data.budget).toBe(updates.budget);
      
      // Verify project was updated in database
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.name).toBe(updates.name);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should handle updating objectives', async () => {
      const project = await createTestProject({ 
        objectives: ['Original objective 1', 'Original objective 2'] 
      });
      
      const updates = {
        objectives: ['Updated objective 1', 'Updated objective 2', 'New objective 3'],
      };
      
      const response = await authRequest.put(`/api/projects/${project._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.objectives).toEqual(updates.objectives);
      expect(response.body.data.objectives.length).toBe(3);
    });
    
    it('should handle updating key results', async () => {
      const project = await createTestProject({
        keyResults: [
          { description: 'Original KR 1', target: 100, current: 0, unit: '%', isComplete: false }
        ]
      });
      
      const updates = {
        keyResults: [
          { description: 'Updated KR 1', target: 100, current: 50, unit: '%', isComplete: false },
          { description: 'New KR 2', target: 10, current: 2, unit: 'features', isComplete: false }
        ],
      };
      
      const response = await authRequest.put(`/api/projects/${project._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.keyResults.length).toBe(2);
      expect(response.body.data.keyResults[0].description).toBe('Updated KR 1');
      expect(response.body.data.keyResults[0].current).toBe(50);
      expect(response.body.data.keyResults[1].description).toBe('New KR 2');
    });
    
    it('should set completion date when status changes to completed', async () => {
      const project = await createTestProject({ status: 'active' });
      
      const updates = {
        status: 'completed'
      };
      
      const response = await authRequest.put(`/api/projects/${project._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actualCompletionDate).toBeDefined();
      
      // Verify actual completion date was set
      const completedProject = await Project.findById(project._id);
      expect(completedProject!.actualCompletionDate).toBeDefined();
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/projects/${nonExistentId}`).send({
        name: 'Updated Name',
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      const project = await createTestProject();
      
      const response = await authRequest.delete(`/api/projects/${project._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Project deleted successfully');
      
      // Verify project was deleted from database
      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/projects/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
    
    it('should use deleteOne instead of deprecated remove method', async () => {
      const project = await createTestProject();
      
      // Spy on the deleteOne method
      const deleteOneSpy = jest.spyOn(Project, 'deleteOne');
      
      // Try to delete the project
      const response = await authRequest.delete(`/api/projects/${project._id}`);
      
      expect(response.status).toBe(200);
      
      // Verify deleteOne was called with the correct ID
      expect(deleteOneSpy).toHaveBeenCalledWith({ _id: project._id.toString() });
      
      // Restore the spy
      deleteOneSpy.mockRestore();
    });
  });
  
  describe('POST /api/projects/:id/documents', () => {
    it('should add a document to a project', async () => {
      const project = await createTestProject();
      
      const documentData = {
        title: 'Project Specification',
        fileUrl: 'https://example.com/files/spec.pdf',
        category: 'specification'
      };
      
      const response = await authRequest.post(`/api/projects/${project._id}/documents`).send(documentData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.fileUrl).toBe(documentData.fileUrl);
      expect(response.body.data.category).toBe(documentData.category);
      expect(response.body.data.uploadedBy.toString()).toBe(user._id.toString());
      
      // Verify document was added to project
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.documents.length).toBe(1);
      expect(updatedProject!.documents[0].title).toBe(documentData.title);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 for missing required document fields', async () => {
      const project = await createTestProject();
      
      const incompleteDocument = {
        // Missing title and fileUrl
        category: 'report'
      };
      
      const response = await authRequest.post(`/api/projects/${project._id}/documents`).send(incompleteDocument);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide document title and file URL');
    });
    
    it('should return 404 for non-existent project', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const documentData = {
        title: 'Test Document',
        fileUrl: 'https://example.com/files/doc.pdf',
      };
      
      const response = await authRequest.post(`/api/projects/${nonExistentId}/documents`).send(documentData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('DELETE /api/projects/:id/documents/:documentId', () => {
    it('should remove a document from a project', async () => {
      // Create project with a document
      const project = await createTestProject();
      
      // Add a document to the project
      project.documents.push({
        title: 'Test Document',
        fileUrl: 'https://example.com/files/test.pdf',
        category: 'report',
        uploadedBy: user._id,
        uploadedAt: new Date()
      });
      
      await project.save();
      
      const documentId = project.documents[0]._id.toString();
      
      const response = await authRequest.delete(`/api/projects/${project._id}/documents/${documentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document removed successfully');
      
      // Verify document was removed from project
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject!.documents.length).toBe(0);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent document', async () => {
      const project = await createTestProject();
      const nonExistentDocumentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/projects/${project._id}/documents/${nonExistentDocumentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Document not found in this project');
    });
  });
});