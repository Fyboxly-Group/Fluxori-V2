import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Project from '../../models/project.model';
import Customer from '../../models/customer.model';
import Milestone from '../../models/milestone.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Milestone API Integration Tests', () => {
  let app: Express;
  let adminUser: any;
  let regularUser: any;
  let reviewerUser: any;
  let adminToken: string;
  let userToken: string;
  let reviewerToken: string;
  let testCustomer: any;
  let testProject: any;
  
  beforeAll(async () => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Customer.deleteMany({});
    await Milestone.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-milestone@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-milestone@example.com', 'password123', 'user');
    reviewerUser = await testUtils.createTestUser('reviewer-milestone@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    reviewerToken = testUtils.generateAuthToken(reviewerUser._id.toString(), 'user');
    
    // Create a test customer
    testCustomer = await createTestCustomer(adminUser._id.toString());
    
    // Create a test project
    testProject = await createTestProject(adminUser._id.toString(), testCustomer._id.toString());
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
      status: 'active',
      phase: 'implementation',
      startDate: new Date(),
      objectives: ['Complete integration tests'],
      createdBy: userId,
    };
    
    const projectData = { ...defaultProject, ...overrides };
    const project = new Project(projectData);
    return await project.save();
  };
  
  // Helper function to create a test milestone
  const createTestMilestone = async (userId: string, projectId: string, overrides = {}) => {
    const defaultMilestone = {
      title: `Test Milestone ${Date.now()}`,
      description: 'Milestone description',
      project: projectId,
      status: 'not-started',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      deliverables: ['Test deliverable'],
      owner: userId,
      reviewers: [],
      approvalRequired: false,
      priority: 'medium',
      progress: 0,
      createdBy: userId,
    };
    
    const milestoneData = { ...defaultMilestone, ...overrides };
    const milestone = new Milestone(milestoneData);
    return await milestone.save();
  };
  
  describe('GET /api/milestones', () => {
    it('should return all milestones for admin user', async () => {
      // Create multiple milestones
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { title: 'Admin Milestone 1' });
      await createTestMilestone(regularUser._id.toString(), testProject._id.toString(), { title: 'User Milestone 1' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { title: 'Admin Milestone 2' });
      
      const response = await request(app)
        .get('/api/milestones')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // Admin sees all milestones
      expect(response.body.count).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should filter milestones by project', async () => {
      // Create another project
      const anotherProject = await createTestProject(adminUser._id.toString(), testCustomer._id.toString(), {
        name: 'Another Test Project'
      });
      
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { title: 'Milestone for Project 1' });
      await createTestMilestone(adminUser._id.toString(), anotherProject._id.toString(), { title: 'Milestone for Project 2' });
      
      const response = await request(app)
        .get(`/api/milestones?project=${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].project._id.toString()).toBe(testProject._id.toString());
    });
    
    it('should filter milestones by status', async () => {
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { status: 'not-started' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { status: 'in-progress' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { status: 'completed' });
      
      const response = await request(app)
        .get('/api/milestones?status=in-progress')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('in-progress');
    });
    
    it('should filter milestones by owner', async () => {
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { owner: adminUser._id });
      await createTestMilestone(regularUser._id.toString(), testProject._id.toString(), { owner: regularUser._id });
      
      const response = await request(app)
        .get(`/api/milestones?owner=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].owner._id.toString()).toBe(regularUser._id.toString());
    });
    
    it('should filter milestones by priority', async () => {
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { priority: 'low' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { priority: 'medium' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { priority: 'high' });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { priority: 'critical' });
      
      const response = await request(app)
        .get('/api/milestones?priority=critical')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].priority).toBe('critical');
    });
    
    it('should search milestones by title or description', async () => {
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        title: 'Unique Title', 
        description: 'Standard description' 
      });
      await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        title: 'Standard Title', 
        description: 'Unique description' 
      });
      
      // Search by title
      const titleResponse = await request(app)
        .get('/api/milestones?search=Unique Title')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(titleResponse.status).toBe(200);
      expect(titleResponse.body.data.length).toBe(1);
      expect(titleResponse.body.data[0].title).toBe('Unique Title');
      
      // Search by description
      const descResponse = await request(app)
        .get('/api/milestones?search=Unique description')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(descResponse.status).toBe(200);
      expect(descResponse.body.data.length).toBe(1);
      expect(descResponse.body.data[0].description).toBe('Unique description');
    });
    
    it('should paginate results correctly', async () => {
      // Create 15 milestones
      for (let i = 1; i <= 15; i++) {
        await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
          title: `Paginated Milestone ${i}` 
        });
      }
      
      // Get first page with 5 items
      const response = await request(app)
        .get('/api/milestones?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
      
      // Get second page
      const response2 = await request(app)
        .get('/api/milestones?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/milestones');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/milestones/:id', () => {
    it('should return a specific milestone by ID', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        title: 'Specific Milestone',
        tags: ['important', 'testing']
      });
      
      const response = await request(app)
        .get(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Specific Milestone');
      expect(response.body.data.tags).toContain('important');
      expect(response.body.data.project).toBeDefined();
      expect(response.body.data.project.name).toBe(testProject.name);
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/milestones/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
    
    it('should return 400 for invalid milestone ID', async () => {
      const response = await request(app)
        .get('/api/milestones/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid milestone ID');
    });
  });
  
  describe('POST /api/milestones', () => {
    it('should create a new milestone', async () => {
      const newMilestone = {
        title: 'New Integration Test Milestone',
        description: 'Milestone for testing creation',
        project: testProject._id.toString(),
        status: 'not-started',
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        deliverables: ['Integration test', 'Documentation'],
        owner: regularUser._id.toString(),
        reviewers: [reviewerUser._id.toString()],
        approvalRequired: true,
        priority: 'high',
        tags: ['test', 'integration'],
      };
      
      const response = await request(app)
        .post('/api/milestones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMilestone);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(newMilestone.title);
      expect(response.body.data.description).toBe(newMilestone.description);
      expect(response.body.data.status).toBe(newMilestone.status);
      expect(response.body.data.priority).toBe(newMilestone.priority);
      expect(response.body.data.deliverables).toEqual(expect.arrayContaining(newMilestone.deliverables));
      expect(response.body.data.owner.toString()).toBe(newMilestone.owner);
      expect(response.body.data.reviewers[0].toString()).toBe(newMilestone.reviewers[0]);
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.tags).toEqual(expect.arrayContaining(newMilestone.tags));
      
      // Verify milestone was created in database
      const createdMilestone = await Milestone.findById(response.body.data._id);
      expect(createdMilestone).toBeDefined();
      expect(createdMilestone!.title).toBe(newMilestone.title);
    });
    
    it('should validate required fields when creating a milestone', async () => {
      const incompleteMilestone = {
        // Missing title, project, startDate, targetCompletionDate, owner
        description: 'Incomplete milestone',
      };
      
      const response = await request(app)
        .post('/api/milestones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteMilestone);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should validate project exists when creating a milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const milestoneWithInvalidProject = {
        title: 'Milestone with invalid project',
        description: 'This should fail validation',
        project: nonExistentId.toString(),
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner: adminUser._id.toString(),
      };
      
      const response = await request(app)
        .post('/api/milestones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(milestoneWithInvalidProject);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('PUT /api/milestones/:id', () => {
    it('should update an existing milestone', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        title: 'Milestone to Update'
      });
      
      const updates = {
        title: 'Updated Milestone Name',
        description: 'Updated description',
        status: 'in-progress',
        priority: 'high',
        progress: 30
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.progress).toBe(updates.progress);
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.title).toBe(updates.title);
    });
    
    it('should set actualCompletionDate when status changes to completed', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        status: 'in-progress',
        progress: 80
      });
      
      const updates = {
        status: 'completed',
        progress: 100
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.progress).toBe(100);
      expect(response.body.data.actualCompletionDate).toBeDefined();
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.status).toBe('completed');
      expect(updatedMilestone!.actualCompletionDate).toBeDefined();
    });
    
    it('should not allow regular users to update milestones they do not own or create', async () => {
      // Create milestone with admin as owner and creator
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        owner: adminUser._id.toString(),
        createdBy: adminUser._id.toString()
      });
      
      const updates = {
        description: 'Unauthorized update',
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    it('should allow milestone owners to update their milestones', async () => {
      // Create milestone with regular user as owner
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        owner: regularUser._id.toString(),
        createdBy: adminUser._id.toString()
      });
      
      const updates = {
        description: 'Owner update',
        notes: 'Added some notes'
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.notes).toBe(updates.notes);
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/milestones/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
  });
  
  describe('DELETE /api/milestones/:id', () => {
    it('should delete a milestone as admin', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString());
      
      const response = await request(app)
        .delete(`/api/milestones/${milestone._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify milestone was deleted from database
      const deletedMilestone = await Milestone.findById(milestone._id);
      expect(deletedMilestone).toBeNull();
    });
    
    it('should not allow deletion of milestone with dependencies', async () => {
      // Create dependent milestones
      const milestone1 = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), {
        title: 'First Milestone'
      });
      
      const milestone2 = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), {
        title: 'Second Milestone',
        dependencies: [milestone1._id]
      });
      
      const response = await request(app)
        .delete(`/api/milestones/${milestone1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete milestone');
      
      // Verify milestone was not deleted
      const notDeletedMilestone = await Milestone.findById(milestone1._id);
      expect(notDeletedMilestone).toBeDefined();
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/milestones/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
  });
  
  describe('PUT /api/milestones/:id/approve', () => {
    it('should allow reviewers to approve milestones', async () => {
      // Create milestone with reviewer
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        reviewers: [reviewerUser._id],
        approvalRequired: true
      });
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/approve`)
        .set('Authorization', `Bearer ${reviewerToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Milestone approved successfully');
      expect(response.body.data.approvedBy).toHaveLength(1);
      expect(response.body.data.approvedBy[0].toString()).toBe(reviewerUser._id.toString());
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.approvedBy).toHaveLength(1);
      expect(updatedMilestone!.approvedBy![0].toString()).toBe(reviewerUser._id.toString());
    });
    
    it('should not allow non-reviewers to approve milestones', async () => {
      // Create milestone with reviewer (not including regularUser)
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        reviewers: [reviewerUser._id],
        approvalRequired: true
      });
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/approve`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized to approve');
    });
    
    it('should prevent duplicate approvals from the same user', async () => {
      // Create milestone with reviewer and one approval
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        reviewers: [reviewerUser._id],
        approvalRequired: true,
        approvedBy: [reviewerUser._id]
      });
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/approve`)
        .set('Authorization', `Bearer ${reviewerToken}`);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already approved');
    });
    
    it('should allow admin to approve any milestone', async () => {
      // Create milestone with reviewer (not including admin)
      const milestone = await createTestMilestone(regularUser._id.toString(), testProject._id.toString(), { 
        reviewers: [reviewerUser._id],
        approvalRequired: true
      });
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Milestone approved successfully');
    });
  });
  
  describe('PUT /api/milestones/:id/progress', () => {
    it('should update milestone progress', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        status: 'not-started',
        progress: 0
      });
      
      const progressUpdate = {
        progress: 45
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/progress`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(progressUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toBe(45);
      expect(response.body.data.status).toBe('in-progress');
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.progress).toBe(45);
      expect(updatedMilestone!.status).toBe('in-progress');
    });
    
    it('should automatically set status to completed when progress is 100%', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        status: 'in-progress',
        progress: 75
      });
      
      const progressUpdate = {
        progress: 100
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/progress`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(progressUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toBe(100);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actualCompletionDate).toBeDefined();
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.progress).toBe(100);
      expect(updatedMilestone!.status).toBe('completed');
      expect(updatedMilestone!.actualCompletionDate).toBeDefined();
    });
    
    it('should automatically set status to not-started when progress is 0%', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString(), { 
        status: 'in-progress',
        progress: 25
      });
      
      const progressUpdate = {
        progress: 0
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/progress`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(progressUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toBe(0);
      expect(response.body.data.status).toBe('not-started');
      
      // Verify milestone was updated in database
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.progress).toBe(0);
      expect(updatedMilestone!.status).toBe('not-started');
    });
    
    it('should validate progress is between 0 and 100', async () => {
      const milestone = await createTestMilestone(adminUser._id.toString(), testProject._id.toString());
      
      const invalidProgressUpdate = {
        progress: 150
      };
      
      const response = await request(app)
        .put(`/api/milestones/${milestone._id}/progress`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProgressUpdate);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Progress must be a number between 0 and 100');
    });
  });
});