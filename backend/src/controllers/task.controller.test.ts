import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import User from '../models/user.model';
import Task from '../models/task.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { ActivityService } from '../services/activity.service';

// Mock the populate function on mongoose queries
const mockPopulate = jest.fn().mockImplementation(function() {
  return this;
});

// Apply the mock to the mongoose Query prototype
mongoose.Query.prototype.populate = mockPopulate;

// Mock the ActivityService
jest.mock('../services/activity.service', () => ({
  ActivityService: {
    logActivity: jest.fn().mockResolvedValue(null),
    logTaskCreate: jest.fn().mockResolvedValue(null),
    logTaskUpdate: jest.fn().mockResolvedValue(null),
    logTaskStatusChange: jest.fn().mockResolvedValue(null),
    getRecentActivities: jest.fn().mockResolvedValue([]),
  },
}));

describe('Task Controller', () => {
  let app: Express;
  let user: any;
  let adminUser: any;
  let token: string;
  let adminToken: string;
  let authRequest: any;
  let adminAuthRequest: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Task.deleteMany({});
    
    // Create a regular test user and an admin user
    user = await testUtils.createTestUser('task-test@example.com', 'password123', 'user');
    adminUser = await testUtils.createTestUser('admin-test@example.com', 'password123', 'admin');
    
    token = testUtils.generateAuthToken(user._id.toString(), 'user');
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    
    authRequest = testUtils.authenticatedRequest(app, token);
    adminAuthRequest = testUtils.authenticatedRequest(app, adminToken);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(async () => {
    // Clean up
    await Task.deleteMany({});
  });
  
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        tags: ['test', 'demo'],
      };
      
      const response = await authRequest.post('/api/tasks').send(taskData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.status).toBe(taskData.status);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.assignedTo.toString()).toBe(user._id.toString());
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
      
      // Verify task was saved to database
      const task = await Task.findById(response.body.data._id);
      expect(task).toBeDefined();
      expect(task!.title).toBe(taskData.title);
      
      // Verify activity was logged
      expect(ActivityService.logTaskCreate).toHaveBeenCalledTimes(1);
      expect(ActivityService.logTaskCreate).toHaveBeenCalledWith(
        expect.any(mongoose.Types.ObjectId),
        user._id,
        taskData.title
      );
    });
    
    it('should create a task with default values when minimal data is provided', async () => {
      const taskData = {
        title: 'Minimal Task',
      };
      
      const response = await authRequest.post('/api/tasks').send(taskData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.priority).toBe('medium');
      expect(response.body.data.assignedTo.toString()).toBe(user._id.toString());
    });
    
    it('should create a task assigned to another user', async () => {
      const otherUser = await testUtils.createTestUser('other@example.com', 'password123', 'user');
      
      const taskData = {
        title: 'Assigned Task',
        description: 'This task is assigned to another user',
        assignedTo: otherUser._id.toString(),
      };
      
      const response = await authRequest.post('/api/tasks').send(taskData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.assignedTo.toString()).toBe(otherUser._id.toString());
      expect(response.body.data.createdBy.toString()).toBe(user._id.toString());
    });
    
    it('should return 400 if title is not provided', async () => {
      const taskData = {
        description: 'Missing title',
      };
      
      const response = await authRequest.post('/api/tasks').send(taskData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors?.title).toBeDefined();
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthenticated Task' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/tasks', () => {
    it('should return tasks assigned to the current user by default', async () => {
      // Create tasks assigned to current user
      await Task.create([
        {
          title: 'User Task 1',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'high',
        },
        {
          title: 'User Task 2',
          status: 'in-progress',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
      ]);
      
      // Create task assigned to another user
      const otherUser = await testUtils.createTestUser('other@example.com', 'password123', 'user');
      await Task.create({
        title: 'Other User Task',
        status: 'pending',
        assignedTo: otherUser._id,
        createdBy: user._id,
        priority: 'low',
      });
      
      const response = await authRequest.get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      
      // All tasks should be assigned to the current user
      expect(response.body.data.every((task: any) => 
        task.assignedTo.toString() === user._id.toString()
      )).toBe(true);
      
      // Verify pagination info
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.totalPages).toBe(1);
    });
    
    it('should filter tasks by status', async () => {
      // Create tasks with different statuses
      await Task.create([
        {
          title: 'Pending Task',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
        {
          title: 'In Progress Task',
          status: 'in-progress',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
        {
          title: 'Completed Task',
          status: 'completed',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
      ]);
      
      const response = await authRequest.get('/api/tasks?status=completed');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Completed Task');
      expect(response.body.data[0].status).toBe('completed');
    });
    
    it('should filter tasks by priority', async () => {
      // Create tasks with different priorities
      await Task.create([
        {
          title: 'Low Priority Task',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'low',
        },
        {
          title: 'Medium Priority Task',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
        {
          title: 'High Priority Task',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'high',
        },
      ]);
      
      const response = await authRequest.get('/api/tasks?priority=high');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('High Priority Task');
      expect(response.body.data[0].priority).toBe('high');
    });
    
    it('should search tasks by title or description', async () => {
      // Create tasks with searchable terms
      await Task.create([
        {
          title: 'Design Database Schema',
          description: 'Create entity-relationship diagrams',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
        {
          title: 'Implement API Endpoints',
          description: 'Design and implement RESTful API for the project',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
        {
          title: 'Write Documentation',
          description: 'Document API endpoints with examples',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        },
      ]);
      
      // Search by title
      const titleResponse = await authRequest.get('/api/tasks?search=Database');
      expect(titleResponse.status).toBe(200);
      expect(titleResponse.body.count).toBe(1);
      expect(titleResponse.body.data[0].title).toBe('Design Database Schema');
      
      // Search by description
      const descResponse = await authRequest.get('/api/tasks?search=API');
      expect(descResponse.status).toBe(200);
      expect(descResponse.body.count).toBe(2);
      expect(descResponse.body.data.some((t: any) => t.title === 'Implement API Endpoints')).toBe(true);
      expect(descResponse.body.data.some((t: any) => t.title === 'Write Documentation')).toBe(true);
    });
    
    it('should handle pagination', async () => {
      // Create multiple tasks
      const tasks = [];
      for (let i = 1; i <= 15; i++) {
        tasks.push({
          title: `Task ${i}`,
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        });
      }
      
      await Task.create(tasks);
      
      // Test first page with custom limit
      const page1Response = await authRequest.get('/api/tasks?page=1&limit=5');
      expect(page1Response.status).toBe(200);
      expect(page1Response.body.count).toBe(5);
      expect(page1Response.body.total).toBe(15);
      expect(page1Response.body.pagination.page).toBe(1);
      expect(page1Response.body.pagination.limit).toBe(5);
      expect(page1Response.body.pagination.totalPages).toBe(3);
      
      // Test second page
      const page2Response = await authRequest.get('/api/tasks?page=2&limit=5');
      expect(page2Response.status).toBe(200);
      expect(page2Response.body.count).toBe(5);
      expect(page2Response.body.pagination.page).toBe(2);
      
      // Ensure different tasks on different pages
      const page1Titles = page1Response.body.data.map((t: any) => t.title);
      const page2Titles = page2Response.body.data.map((t: any) => t.title);
      
      page1Titles.forEach((title: string) => {
        expect(page2Titles).not.toContain(title);
      });
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/tasks/:id', () => {
    it('should return a single task by ID', async () => {
      const task = await Task.create({
        title: 'Test Task Details',
        description: 'Detailed description for test',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
        tags: ['test', 'details'],
      });
      
      const response = await authRequest.get(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(task.title);
      expect(response.body.data.description).toBe(task.description);
      expect(response.body.data.status).toBe(task.status);
      expect(response.body.data.priority).toBe(task.priority);
      expect(response.body.data.tags).toEqual(expect.arrayContaining(task.tags!));
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.get(`/api/tasks/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.get('/api/tasks/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid task ID');
    });
    
    it('should require authentication', async () => {
      const task = await Task.create({
        title: 'Unauthenticated Access Test',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const response = await request(app).get(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Task to Update',
        description: 'Original description',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated description',
        priority: 'high',
      };
      
      const response = await authRequest.put(`/api/tasks/${task._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.status).toBe('pending'); // Unchanged
      
      // Verify task was updated in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask!.title).toBe(updates.title);
      
      // Verify activity was logged
      expect(ActivityService.logTaskUpdate).toHaveBeenCalledTimes(1);
    });
    
    it('should update task status and log status change activity', async () => {
      const task = await Task.create({
        title: 'Status Change Task',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const updates = {
        status: 'completed',
      };
      
      const response = await authRequest.put(`/api/tasks/${task._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
      
      // Verify status change activity was logged
      expect(ActivityService.logTaskStatusChange).toHaveBeenCalledTimes(1);
      expect(ActivityService.logTaskStatusChange).toHaveBeenCalledWith(
        task._id,
        user._id,
        task.title,
        'pending',
        'completed'
      );
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.put(`/api/tasks/${nonExistentId}`).send({
        title: 'Updated Title',
      });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.put('/api/tasks/invalid-id').send({
        title: 'Invalid ID Update',
      });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid task ID');
    });
    
    it('should allow admin to update any task', async () => {
      // Create a task by regular user
      const task = await Task.create({
        title: 'Task for Admin Update',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const updates = {
        title: 'Admin Updated Task',
        status: 'in-progress',
      };
      
      // Update as admin
      const response = await adminAuthRequest.put(`/api/tasks/${task._id}`).send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.status).toBe(updates.status);
    });
    
    it('should return 403 if user is not authorized to update the task', async () => {
      // Create another user
      const otherUser = await testUtils.createTestUser('other-update@example.com', 'password123', 'user');
      
      // Create a task by other user, assigned to other user
      const task = await Task.create({
        title: 'Unauthorized Update Task',
        status: 'pending',
        assignedTo: otherUser._id,
        createdBy: otherUser._id,
        priority: 'medium',
      });
      
      // Try to update as regular user
      const response = await authRequest.put(`/api/tasks/${task._id}`).send({
        title: 'Unauthorized Updated Title',
      });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to update this task');
    });
    
    it('should require authentication', async () => {
      const task = await Task.create({
        title: 'Unauthenticated Update Test',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const response = await request(app).put(`/api/tasks/${task._id}`).send({
        title: 'Updated Without Auth',
      });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const response = await authRequest.delete(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');
      
      // Verify task was deleted from database
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
      
      // Verify activity was logged
      expect(ActivityService.logActivity).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await authRequest.delete(`/api/tasks/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
    
    it('should return 400 for invalid ID format', async () => {
      const response = await authRequest.delete('/api/tasks/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid task ID');
    });
    
    it('should allow admin to delete any task', async () => {
      // Create a task by regular user
      const task = await Task.create({
        title: 'Task for Admin Deletion',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      // Delete as admin
      const response = await adminAuthRequest.delete(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify task was deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
    
    it('should return 403 if user is not authorized to delete the task', async () => {
      // Create another user
      const otherUser = await testUtils.createTestUser('other-delete@example.com', 'password123', 'user');
      
      // Create a task by other user
      const task = await Task.create({
        title: 'Unauthorized Delete Task',
        status: 'pending',
        assignedTo: user._id, // Assigned to current user
        createdBy: otherUser._id, // But created by other user
        priority: 'medium',
      });
      
      // Try to delete as regular user (should fail as only creator or admin can delete)
      const response = await authRequest.delete(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to delete this task');
      
      // Verify task was not deleted
      const taskStillExists = await Task.findById(task._id);
      expect(taskStillExists).not.toBeNull();
    });
    
    it('should require authentication', async () => {
      const task = await Task.create({
        title: 'Unauthenticated Delete Test',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      const response = await request(app).delete(`/api/tasks/${task._id}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});