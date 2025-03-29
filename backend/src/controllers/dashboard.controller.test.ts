import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createTestApp } from '../tests/utils/test-app';
import User from '../models/user.model';
import Task from '../models/task.model';
import Activity from '../models/activity.model';
import SystemStatus from '../models/system-status.model';
import * as testUtils from '../tests/utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import { ActivityService } from '../services/activity.service';
import { SystemStatusService } from '../services/system-status.service';

// Mock the populate function on mongoose queries
const mockPopulate = jest.fn().mockImplementation(function() {
  return this;
});

// Apply the mock to the mongoose Query prototype
mongoose.Query.prototype.populate = mockPopulate;

// Mock the system status service
jest.mock('../services/system-status.service', () => ({
  SystemStatusService: {
    checkDatabaseHealth: jest.fn().mockResolvedValue(true),
    getAllComponentStatus: jest.fn().mockResolvedValue([
      {
        _id: 'mock-id-1',
        name: 'API Service',
        status: 'operational',
        description: 'Core API functionality',
        lastCheckedAt: new Date(),
      },
      {
        _id: 'mock-id-2',
        name: 'Database',
        status: 'operational',
        description: 'MongoDB database connection',
        lastCheckedAt: new Date(),
      },
    ]),
  },
}));

// Mock the activity service
jest.mock('../services/activity.service', () => ({
  ActivityService: {
    getRecentActivities: jest.fn().mockImplementation(async (limit, userId) => {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      }
      return Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .lean();
    }),
    logActivity: jest.fn().mockResolvedValue(null),
  },
}));

describe('Dashboard Controller', () => {
  let app: Express;
  let user: any;
  let token: string;
  let authRequest: any;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
    
    // Create a test user and authentication token
    user = await testUtils.createTestUser('dashboard-test@example.com', 'password123');
    token = testUtils.generateAuthToken(user._id.toString());
    authRequest = testUtils.authenticatedRequest(app, token);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      // Create test users
      await testUtils.createTestUser('user1@example.com', 'password123');
      await testUtils.createTestUser('user2@example.com', 'password123');
      await testUtils.createTestUser('inactive@example.com', 'password123', 'user', false);
      
      // Create test tasks
      await Task.create({
        title: 'Task 1',
        status: 'pending',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      await Task.create({
        title: 'Task 2',
        status: 'completed',
        assignedTo: user._id,
        createdBy: user._id,
        priority: 'medium',
      });
      
      await Task.create({
        title: 'Task 3',
        status: 'pending',
        assignedTo: new mongoose.Types.ObjectId(), // Assigned to different user
        createdBy: user._id,
        priority: 'medium',
      });
      
      // Create test activities
      await Activity.create({
        description: 'User login',
        entityType: 'user',
        entityId: user._id,
        action: 'login',
        status: 'completed',
        userId: user._id,
      });
      
      await Activity.create({
        description: 'User update',
        entityType: 'user',
        entityId: user._id,
        action: 'update',
        status: 'completed',
        userId: user._id,
      });
      
      const response = await authRequest.get('/api/dashboard/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // System stats
      expect(response.body.data.usersCount).toBe(3); // Only active users
      expect(response.body.data.tasksCount).toBe(3);
      expect(response.body.data.pendingTasksCount).toBe(2);
      expect(response.body.data.completedTasksCount).toBe(1);
      expect(response.body.data.activitiesCount).toBe(2);
      
      // User stats
      expect(response.body.data.userTasksCount).toBe(2); // Only tasks assigned to current user
      expect(response.body.data.userPendingTasksCount).toBe(1);
      expect(response.body.data.userCompletedTasksCount).toBe(1);
    });
    
    it('should return stats with zero counts when no data exists', async () => {
      const response = await authRequest.get('/api/dashboard/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      expect(response.body.data.usersCount).toBe(1); // Current user only
      expect(response.body.data.tasksCount).toBe(0);
      expect(response.body.data.pendingTasksCount).toBe(0);
      expect(response.body.data.completedTasksCount).toBe(0);
      expect(response.body.data.activitiesCount).toBe(0);
      expect(response.body.data.userTasksCount).toBe(0);
      expect(response.body.data.userPendingTasksCount).toBe(0);
      expect(response.body.data.userCompletedTasksCount).toBe(0);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/stats');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/activities', () => {
    it('should return recent activities', async () => {
      // Create test activities in sequence with controlled timestamps
      for (let i = 1; i <= 15; i++) {
        // Insert activities one by one with increasing timestamps
        await Activity.create({
          description: `Activity ${i}`,
          entityType: 'user',
          entityId: user._id,
          action: 'update',
          status: 'completed',
          userId: user._id,
          createdAt: new Date(Date.now() + (i * 1000)) // Each activity is 1 second newer
        });
      }
      
      const response = await authRequest.get('/api/dashboard/activities');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(10); // Default limit is 10
      expect(response.body.data.length).toBe(10);
      
      // Most recent activity should be first (Activity 15 should be the newest)
      expect(response.body.data[0].description).toBe('Activity 15');
    });
    
    it('should respect the limit parameter', async () => {
      // Create test activities
      const activities = [];
      for (let i = 1; i <= 10; i++) {
        activities.push({
          description: `Activity ${i}`,
          entityType: 'user',
          entityId: user._id,
          action: 'update',
          status: 'completed',
          userId: user._id,
        });
      }
      
      await Activity.insertMany(activities);
      
      const response = await authRequest.get('/api/dashboard/activities?limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(5);
      expect(response.body.data.length).toBe(5);
    });
    
    it('should filter activities by current user when onlyMine=true', async () => {
      // Create activities for current user
      await Activity.insertMany([
        {
          description: 'Current user activity 1',
          entityType: 'user',
          entityId: user._id,
          action: 'update',
          status: 'completed',
          userId: user._id,
        },
        {
          description: 'Current user activity 2',
          entityType: 'user',
          entityId: user._id,
          action: 'update',
          status: 'completed',
          userId: user._id,
        },
      ]);
      
      // Create activity for another user
      const otherUserId = new mongoose.Types.ObjectId();
      await Activity.create({
        description: 'Other user activity',
        entityType: 'user',
        entityId: otherUserId,
        action: 'update',
        status: 'completed',
        userId: otherUserId,
      });
      
      const response = await authRequest.get('/api/dashboard/activities?onlyMine=true');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].description).toContain('Current user activity');
      expect(response.body.data[1].description).toContain('Current user activity');
    });
    
    it('should return empty array when no activities exist', async () => {
      const response = await authRequest.get('/api/dashboard/activities');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/activities');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/tasks', () => {
    it('should return tasks assigned to the current user', async () => {
      // Create tasks assigned to current user
      await Task.create([
        {
          title: 'User Task 1',
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
        },
        {
          title: 'User Task 2',
          status: 'in-progress',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
          dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
        },
      ]);
      
      // Create task assigned to another user
      const otherUserId = new mongoose.Types.ObjectId();
      await Task.create({
        title: 'Other User Task',
        status: 'pending',
        assignedTo: otherUserId,
        createdBy: user._id,
        priority: 'low',
      });
      
      const response = await authRequest.get('/api/dashboard/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      
      // Should not include the task assigned to another user
      const titles = response.body.data.map((task: any) => task.title);
      expect(titles).toContain('User Task 1');
      expect(titles).toContain('User Task 2');
      expect(titles).not.toContain('Other User Task');
      
      // Tasks should be sorted by due date (ascending)
      expect(response.body.data[0].title).toBe('User Task 1');
      expect(response.body.data[1].title).toBe('User Task 2');
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
      
      const response = await authRequest.get('/api/dashboard/tasks?status=completed');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Completed Task');
    });
    
    it('should respect the limit parameter', async () => {
      // Create multiple tasks
      const tasks = [];
      for (let i = 1; i <= 10; i++) {
        tasks.push({
          title: `Task ${i}`,
          status: 'pending',
          assignedTo: user._id,
          createdBy: user._id,
          priority: 'medium',
        });
      }
      
      await Task.create(tasks);
      
      const response = await authRequest.get('/api/dashboard/tasks?limit=3');
      
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.data.length).toBe(3);
    });
    
    it('should return empty array when no tasks exist', async () => {
      const response = await authRequest.get('/api/dashboard/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/tasks');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/system-status', () => {
    it('should return system status information', async () => {
      const response = await authRequest.get('/api/dashboard/system-status');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // Based on our mock
      expect(response.body.data.length).toBe(2);
      
      // Check component details
      expect(response.body.data[0].name).toBe('API Service');
      expect(response.body.data[0].status).toBe('operational');
      expect(response.body.data[1].name).toBe('Database');
      expect(response.body.data[1].status).toBe('operational');
      
      // Verify that the checkDatabaseHealth method was called
      expect(SystemStatusService.checkDatabaseHealth).toHaveBeenCalledTimes(1);
      expect(SystemStatusService.getAllComponentStatus).toHaveBeenCalledTimes(1);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/api/dashboard/system-status');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should handle database health check failure', async () => {
      // Mock the database health check to fail
      (SystemStatusService.checkDatabaseHealth as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));
      
      const response = await authRequest.get('/api/dashboard/system-status');
      
      // Even though the health check fails, the endpoint should still return a 200 response
      // with whatever component statuses are available (from getAllComponentStatus)
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});