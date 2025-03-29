import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import Milestone from '../models/milestone.model';
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

describe('Milestone Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  let testCustomer: any;
  let testProject: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await Milestone.deleteMany({});
    await Project.deleteMany({});
    await Customer.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('milestone-test@example.com', 'password123', 'admin');
    token = testUtils.generateAuthToken(user._id.toString(), 'admin');
    
    // Create authenticated request helper
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Create a test customer and project to use in milestones
    testCustomer = await createTestCustomer();
    testProject = await createTestProject();
    
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
      status: 'active',
      phase: 'implementation',
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
  
  // Helper function to create a test milestone
  const createTestMilestone = async (override = {}) => {
    const defaultMilestone = {
      title: `Test Milestone ${Date.now()}`,
      description: 'Test milestone description',
      project: testProject._id,
      status: 'not-started',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      deliverables: ['Deliverable 1', 'Deliverable 2'],
      owner: user._id,
      reviewers: [user._id],
      approvalRequired: true,
      priority: 'medium',
      progress: 0,
      createdBy: user._id
    };
    
    const milestoneData = { ...defaultMilestone, ...override };
    const milestone = new Milestone(milestoneData);
    return await milestone.save();
  };
  
  describe('GET /api/milestones', () => {
    it('should return all milestones with pagination', async () => {
      // Create test milestones
      await createTestMilestone({ title: 'Milestone A' });
      await createTestMilestone({ title: 'Milestone B' });
      await createTestMilestone({ title: 'Milestone C' });
      
      // Execute request
      const response = await authRequest.get('/api/milestones');
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
    });
    
    it('should filter milestones by search term', async () => {
      await createTestMilestone({ title: 'Design Phase Milestone', description: 'First design milestone' });
      await createTestMilestone({ title: 'Implementation Milestone', description: 'Second implementation milestone' });
      await createTestMilestone({ title: 'Testing Milestone', description: 'Final acceptance testing' });
      
      // Search by title
      let response = await authRequest.get('/api/milestones?search=design');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Design Phase Milestone');
      
      // Search by description
      response = await authRequest.get('/api/milestones?search=acceptance');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Testing Milestone');
    });
    
    it('should filter milestones by project', async () => {
      const secondProject = await createTestProject({ name: 'Second Project' });
      
      await createTestMilestone({ project: testProject._id });
      await createTestMilestone({ project: secondProject._id });
      
      const response = await authRequest.get(`/api/milestones?project=${secondProject._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].project._id.toString()).toBe(secondProject._id.toString());
    });
    
    it('should filter milestones by status', async () => {
      await createTestMilestone({ status: 'not-started' });
      await createTestMilestone({ status: 'in-progress' });
      await createTestMilestone({ status: 'completed' });
      
      const response = await authRequest.get('/api/milestones?status=in-progress');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('in-progress');
    });
    
    it('should filter milestones by owner', async () => {
      const otherUser = await testUtils.createTestUser('other-owner@example.com', 'password', 'admin');
      
      await createTestMilestone({ owner: user._id });
      await createTestMilestone({ owner: otherUser._id });
      
      const response = await authRequest.get(`/api/milestones?owner=${otherUser._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].owner._id.toString()).toBe(otherUser._id.toString());
    });
    
    it('should filter milestones by priority', async () => {
      await createTestMilestone({ priority: 'low' });
      await createTestMilestone({ priority: 'medium' });
      await createTestMilestone({ priority: 'high' });
      await createTestMilestone({ priority: 'critical' });
      
      const response = await authRequest.get('/api/milestones?priority=high');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].priority).toBe('high');
    });
    
    it('should filter milestones by date range', async () => {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago
      
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 60); // 60 days in future
      
      const farFutureDate = new Date(today);
      farFutureDate.setDate(farFutureDate.getDate() + 90); // 90 days in future
      
      await createTestMilestone({ targetCompletionDate: pastDate });
      await createTestMilestone({ targetCompletionDate: futureDate });
      await createTestMilestone({ targetCompletionDate: farFutureDate });
      
      // Test filtering by from date
      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() + 30); // 30 days from now
      
      const response = await authRequest.get(`/api/milestones?fromDate=${fromDate.toISOString()}`);
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2); // future and far future
      
      // Test filtering by to date
      const toDate = new Date(today);
      toDate.setDate(toDate.getDate() + 75); // 75 days from now
      
      const response2 = await authRequest.get(`/api/milestones?toDate=${toDate.toISOString()}`);
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(2); // past and future
      
      // Test filtering by date range
      const response3 = await authRequest.get(
        `/api/milestones?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`
      );
      
      expect(response3.status).toBe(200);
      expect(response3.body.count).toBe(1); // only future
    });
    
    it('should handle pagination correctly', async () => {
      // Create 15 test milestones
      for (let i = 1; i <= 15; i++) {
        await createTestMilestone({ title: `Milestone ${i}` });
      }
      
      // Test first page with 5 milestones per page
      const response = await authRequest.get('/api/milestones?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      
      // Test second page
      const response2 = await authRequest.get('/api/milestones?page=2&limit=5');
      
      expect(response2.status).toBe(200);
      expect(response2.body.count).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
  });
  
  describe('GET /api/milestones/:id', () => {
    it('should return a single milestone by ID', async () => {
      const milestone = await createTestMilestone({ 
        title: 'Detailed Milestone',
        description: 'Detailed milestone description',
        priority: 'high'
      });
      
      const response = await authRequest.get(`/api/milestones/${milestone._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Detailed Milestone');
      expect(response.body.data.description).toBe('Detailed milestone description');
      expect(response.body.data.priority).toBe('high');
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/milestones/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.get('/api/milestones/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid milestone ID');
    });
  });
  
  describe('POST /api/milestones', () => {
    it('should create a new milestone', async () => {
      const newMilestone = {
        title: 'New Test Milestone',
        description: 'Creating a new test milestone',
        project: testProject._id.toString(),
        status: 'not-started',
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        deliverables: ['Deliverable A', 'Deliverable B'],
        owner: user._id.toString(),
        reviewers: [user._id.toString()],
        approvalRequired: true,
        priority: 'high',
        notes: 'Test milestone notes',
        tags: ['important', 'phase1'],
      };
      
      const response = await authRequest.post('/api/milestones').send(newMilestone);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(newMilestone.title);
      expect(response.body.data.description).toBe(newMilestone.description);
      expect(response.body.data.priority).toBe(newMilestone.priority);
      expect(response.body.data.deliverables).toEqual(expect.arrayContaining(newMilestone.deliverables));
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
      
      // Verify milestone was saved to database
      const savedMilestone = await Milestone.findById(response.body.data._id);
      expect(savedMilestone).toBeDefined();
      expect(savedMilestone!.title).toBe(newMilestone.title);
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 for missing required fields', async () => {
      const incompleteMilestone = {
        title: 'Incomplete Milestone',
        // Missing required fields
      };
      
      const response = await authRequest.post('/api/milestones').send(incompleteMilestone);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
    });
    
    it('should return 404 for invalid project ID', async () => {
      const nonExistentProjectId = new mongoose.Types.ObjectId();
      
      const milestoneWithInvalidProject = {
        title: 'Invalid Project Milestone',
        project: nonExistentProjectId.toString(),
        startDate: new Date().toISOString(),
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner: user._id.toString(),
      };
      
      const response = await authRequest.post('/api/milestones').send(milestoneWithInvalidProject);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });
  
  describe('PUT /api/milestones/:id', () => {
    it('should update an existing milestone', async () => {
      const milestone = await createTestMilestone();
      
      const updates = {
        title: 'Updated Milestone Title',
        description: 'Updated milestone description',
        status: 'in-progress',
        priority: 'critical',
        progress: 25,
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}`).send(updates);
      
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
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should handle updating deliverables', async () => {
      const milestone = await createTestMilestone({ 
        deliverables: ['Original deliverable 1', 'Original deliverable 2'] 
      });
      
      const updates = {
        deliverables: ['Updated deliverable 1', 'Updated deliverable 2', 'New deliverable 3'],
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deliverables).toEqual(updates.deliverables);
      expect(response.body.data.deliverables.length).toBe(3);
    });
    
    it('should handle updating reviewers', async () => {
      const otherUser = await testUtils.createTestUser('reviewer@example.com', 'password', 'user');
      
      const milestone = await createTestMilestone({
        reviewers: [user._id]
      });
      
      const updates = {
        reviewers: [user._id.toString(), otherUser._id.toString()],
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviewers.length).toBe(2);
      expect(response.body.data.reviewers[1].toString()).toBe(otherUser._id.toString());
    });
    
    it('should set completion date when status changes to completed', async () => {
      const milestone = await createTestMilestone({ status: 'in-progress' });
      
      const updates = {
        status: 'completed'
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actualCompletionDate).toBeDefined();
      
      // Verify actual completion date was set
      const completedMilestone = await Milestone.findById(milestone._id);
      expect(completedMilestone!.actualCompletionDate).toBeDefined();
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/milestones/${nonExistentId}`).send({
        title: 'Updated Title',
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
  });
  
  describe('DELETE /api/milestones/:id', () => {
    it('should delete a milestone', async () => {
      const milestone = await createTestMilestone();
      
      const response = await authRequest.delete(`/api/milestones/${milestone._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Milestone deleted successfully');
      
      // Verify milestone was deleted from database
      const deletedMilestone = await Milestone.findById(milestone._id);
      expect(deletedMilestone).toBeNull();
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent milestone', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/milestones/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone not found');
    });
    
    it('should return 400 when milestone has dependents', async () => {
      const milestone1 = await createTestMilestone({ title: 'First Milestone' });
      const milestone2 = await createTestMilestone({ 
        title: 'Dependent Milestone',
        dependencies: [milestone1._id]
      });
      
      const response = await authRequest.delete(`/api/milestones/${milestone1._id}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete milestone');
      expect(response.body.message).toContain('depend on this milestone');
    });
    
    it('should use deleteOne instead of deprecated remove method', async () => {
      const milestone = await createTestMilestone();
      
      // Create a milestone with no dependencies to allow deletion
      jest.spyOn(Milestone, 'countDocuments').mockResolvedValue(0);
      
      // Spy on the deleteOne method
      const deleteOneSpy = jest.spyOn(Milestone, 'deleteOne');
      
      // Try to delete the milestone
      const response = await authRequest.delete(`/api/milestones/${milestone._id}`);
      
      expect(response.status).toBe(200);
      
      // Verify deleteOne was called with the correct ID
      expect(deleteOneSpy).toHaveBeenCalledWith({ _id: milestone._id.toString() });
      
      // Restore the spies
      deleteOneSpy.mockRestore();
      jest.spyOn(Milestone, 'countDocuments').mockRestore();
    });
  });
  
  describe('PUT /api/milestones/:id/approve', () => {
    it('should approve a milestone', async () => {
      const milestone = await createTestMilestone({
        status: 'completed',
        approvalRequired: true,
        approvedBy: []
      });
      
      const approvalData = {
        approved: true,
        comments: 'Looks good, approved!'
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}/approve`).send(approvalData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify user was added to approvedBy
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.approvedBy.length).toBe(1);
      expect(updatedMilestone!.approvedBy[0].toString()).toBe(user._id.toString());
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should reject a milestone', async () => {
      const milestone = await createTestMilestone({
        status: 'completed',
        approvalRequired: true
      });
      
      const rejectionData = {
        approved: false,
        comments: 'Not quite ready yet, please revise.'
      };
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}/approve`).send(rejectionData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify status was changed back to in-progress
      const updatedMilestone = await Milestone.findById(milestone._id);
      expect(updatedMilestone!.status).toBe('in-progress');
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 if milestone does not require approval', async () => {
      const milestone = await createTestMilestone({
        approvalRequired: false
      });
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}/approve`).send({
        approved: true
      });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('This milestone does not require approval');
    });
    
    it('should return 400 if milestone is not in completed status when approving', async () => {
      const milestone = await createTestMilestone({
        status: 'in-progress',
        approvalRequired: true
      });
      
      const response = await authRequest.put(`/api/milestones/${milestone._id}/approve`).send({
        approved: true
      });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Milestone must be in completed status to be approved');
    });
  });
});