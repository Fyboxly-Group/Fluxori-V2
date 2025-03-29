import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Task from '../../models/task.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

describe('Task API Integration Tests', () => {
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
    await Task.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-task@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-task@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  // Helper function to create a test task
  const createTestTask = async (userId: string, overrides = {}) => {
    const defaultTask = {
      title: `Test Task ${Date.now()}`,
      description: 'Task description',
      status: 'pending',
      priority: 'medium',
      assignedTo: userId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      createdBy: userId,
    };
    
    const taskData = { ...defaultTask, ...overrides };
    const task = new Task(taskData);
    return await task.save();
  };
  
  describe('GET /api/tasks', () => {
    it('should return all tasks for admin user', async () => {
      // Create multiple tasks
      await createTestTask(adminUser._id.toString(), { title: 'Admin Task 1' });
      await createTestTask(regularUser._id.toString(), { title: 'User Task 1' });
      await createTestTask(adminUser._id.toString(), { title: 'Admin Task 2' });
      
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // Admin sees all tasks
      expect(response.body.count).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('should only return assigned tasks for regular user', async () => {
      // Create multiple tasks
      await createTestTask(adminUser._id.toString(), { title: 'Admin Task' });
      await createTestTask(regularUser._id.toString(), { title: 'User Task' });
      
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Regular user should only see their own tasks
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('User Task');
    });
    
    it('should filter tasks by status', async () => {
      await createTestTask(adminUser._id.toString(), { status: 'pending' });
      await createTestTask(adminUser._id.toString(), { status: 'in-progress' });
      await createTestTask(adminUser._id.toString(), { status: 'completed' });
      
      const response = await request(app)
        .get('/api/tasks?status=in-progress')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('in-progress');
    });
    
    it('should filter tasks by priority', async () => {
      await createTestTask(adminUser._id.toString(), { priority: 'low' });
      await createTestTask(adminUser._id.toString(), { priority: 'medium' });
      await createTestTask(adminUser._id.toString(), { priority: 'high' });
      
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].priority).toBe('high');
    });
    
    it('should search tasks by title or description', async () => {
      await createTestTask(adminUser._id.toString(), { 
        title: 'Project Setup', 
        description: 'Set up the development environment' 
      });
      await createTestTask(adminUser._id.toString(), { 
        title: 'Feature Implementation', 
        description: 'Implement user authentication' 
      });
      
      const response = await request(app)
        .get('/api/tasks?search=authentication')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Feature Implementation');
    });
    
    it('should paginate results correctly', async () => {
      // Create 15 tasks
      for (let i = 1; i <= 15; i++) {
        await createTestTask(adminUser._id.toString(), { title: `Paginated Task ${i}` });
      }
      
      // Get first page with 5 items
      const response = await request(app)
        .get('/api/tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.total).toBe(15);
      
      // Get second page
      const response2 = await request(app)
        .get('/api/tasks?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);
    });
    
    it('should sort tasks correctly', async () => {
      // Create tasks with different due dates
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
      const farFutureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
      
      await createTestTask(adminUser._id.toString(), { title: 'Past Task', dueDate: pastDate });
      await createTestTask(adminUser._id.toString(), { title: 'Future Task', dueDate: futureDate });
      await createTestTask(adminUser._id.toString(), { title: 'Far Future Task', dueDate: farFutureDate });
      
      // Sort by dueDate ascending
      const response = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.data[0].title).toBe('Past Task');
      expect(response.body.data[2].title).toBe('Far Future Task');
      
      // Sort by dueDate descending
      const response2 = await request(app)
        .get('/api/tasks?sortBy=dueDate&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response2.status).toBe(200);
      expect(response2.body.data[0].title).toBe('Far Future Task');
      expect(response2.body.data[2].title).toBe('Past Task');
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      const task = await createTestTask(adminUser._id.toString(), { 
        title: 'Specific Task',
        tags: ['important', 'project']
      });
      
      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Specific Task');
      expect(response.body.data.tags).toContain('important');
    });
    
    it('should allow assignees to view their tasks', async () => {
      // Create task assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        title: 'Assigned Task',
        assignedTo: regularUser._id.toString()
      });
      
      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    it('should not allow regular users to view tasks not assigned to them', async () => {
      // Create task not assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        title: 'Unassigned Task',
        assignedTo: adminUser._id.toString() // Assigned to admin, not regular user
      });
      
      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });
  
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Integration Test Task',
        description: 'Task for testing task creation',
        status: 'pending',
        priority: 'high',
        assignedTo: regularUser._id.toString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['test', 'integration'],
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTask);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe(newTask.description);
      expect(response.body.data.status).toBe(newTask.status);
      expect(response.body.data.priority).toBe(newTask.priority);
      expect(response.body.data.assignedTo.toString()).toBe(newTask.assignedTo);
      expect(response.body.data.createdBy.toString()).toBe(adminUser._id.toString());
      expect(response.body.data.tags).toEqual(expect.arrayContaining(newTask.tags));
      
      // Verify task was created in database
      const createdTask = await Task.findById(response.body.data._id);
      expect(createdTask).toBeDefined();
      expect(createdTask!.title).toBe(newTask.title);
    });
    
    it('should validate required fields when creating a task', async () => {
      const incompleteTask = {
        // Missing title and other required fields
        description: 'Incomplete task'
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteTask);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide all required fields');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.title).toBeDefined();
    });
    
    it('should allow regular users to create tasks', async () => {
      const newTask = {
        title: 'User Created Task',
        description: 'Task created by regular user',
        status: 'pending',
        assignedTo: regularUser._id.toString(),
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTask);
        
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.createdBy.toString()).toBe(regularUser._id.toString());
    });
  });
  
  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const task = await createTestTask(adminUser._id.toString(), { title: 'Task to Update' });
      
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated description',
        priority: 'high',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.priority).toBe(updates.priority);
      
      // Verify task was updated in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask!.title).toBe(updates.title);
    });
    
    it('should allow users to update tasks assigned to them', async () => {
      // Create task assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        assignedTo: regularUser._id.toString()
      });
      
      const updates = {
        description: 'Updated by assignee',
        notes: 'Added some notes',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updates.description);
    });
    
    it('should not allow regular users to update tasks not assigned to them', async () => {
      // Create task not assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        assignedTo: adminUser._id.toString() // Assigned to admin, not regular user
      });
      
      const updates = {
        description: 'Unauthorized update',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' });
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });
  
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task as admin', async () => {
      const task = await createTestTask(adminUser._id.toString());
      
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify task was deleted from database
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
    
    it('should not allow regular users to delete tasks', async () => {
      // Create task assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        assignedTo: regularUser._id.toString()
      });
      
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      
      // Verify task was not deleted
      const notDeletedTask = await Task.findById(task._id);
      expect(notDeletedTask).toBeDefined();
    });
    
    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });
  
  describe('PUT /api/tasks/:id/status', () => {
    it('should update task status', async () => {
      const task = await createTestTask(adminUser._id.toString(), { status: 'pending' });
      
      const statusUpdate = {
        status: 'in-progress',
        notes: 'Starting work on this task',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(statusUpdate.status);
      expect(response.body.data.statusHistory).toBeDefined();
      expect(response.body.data.statusHistory.length).toBe(1);
      expect(response.body.data.statusHistory[0].status).toBe(statusUpdate.status);
      expect(response.body.data.statusHistory[0].notes).toBe(statusUpdate.notes);
      
      // Verify task was updated in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask!.status).toBe(statusUpdate.status);
    });
    
    it('should allow assignees to update task status', async () => {
      // Create task assigned to regular user
      const task = await createTestTask(adminUser._id.toString(), { 
        status: 'pending',
        assignedTo: regularUser._id.toString()
      });
      
      const statusUpdate = {
        status: 'in-progress',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(statusUpdate);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(statusUpdate.status);
    });
    
    it('should not allow invalid status values', async () => {
      const task = await createTestTask(adminUser._id.toString());
      
      const invalidStatusUpdate = {
        status: 'invalid-status',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidStatusUpdate);
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});