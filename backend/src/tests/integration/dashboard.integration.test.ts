import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../utils/test-app';
import User from '../../models/user.model';
import Task from '../../models/task.model';
import Activity from '../../models/activity.model';
import SystemStatus from '../../models/system-status.model';
import * as testUtils from '../utils/test-utils';
import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { SystemStatusService } from '../../services/system-status.service';

// Mock the SystemStatusService
jest.mock('../../services/system-status.service', () => ({
  SystemStatusService: {
    checkDatabaseHealth: jest.fn().mockResolvedValue(true),
    getAllComponentStatus: jest.fn().mockImplementation(async () => {
      return [
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
      ];
    }),
  },
}));

describe('Dashboard API Integration Tests', () => {
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
    await Activity.deleteMany({});
    
    // Create test users
    adminUser = await testUtils.createTestUser('admin-dashboard@example.com', 'password123', 'admin');
    regularUser = await testUtils.createTestUser('user-dashboard@example.com', 'password123', 'user');
    
    // Generate tokens
    adminToken = testUtils.generateAuthToken(adminUser._id.toString(), 'admin');
    userToken = testUtils.generateAuthToken(regularUser._id.toString(), 'user');
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
  
  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          status: 'pending',
          assignedTo: regularUser._id,
          createdBy: adminUser._id,
          priority: 'medium',
        },
        {
          title: 'Task 2',
          status: 'completed',
          assignedTo: regularUser._id,
          createdBy: adminUser._id,
          priority: 'high',
        },
        {
          title: 'Task 3',
          status: 'in-progress',
          assignedTo: adminUser._id,
          createdBy: regularUser._id,
          priority: 'low',
        },
      ]);
      
      // Create test activities
      await Activity.create([
        {
          description: 'User login',
          entityType: 'user',
          entityId: regularUser._id,
          action: 'login',
          status: 'completed',
          userId: regularUser._id,
        },
        {
          description: 'Task created',
          entityType: 'task',
          entityId: new mongoose.Types.ObjectId(),
          action: 'create',
          status: 'completed',
          userId: adminUser._id,
        },
      ]);
      
      // Test with regularUser token to verify user-specific stats
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // System stats
      expect(response.body.data.usersCount).toBe(2); // Both users are active
      expect(response.body.data.tasksCount).toBe(3);
      expect(response.body.data.pendingTasksCount).toBe(1);
      expect(response.body.data.completedTasksCount).toBe(1);
      expect(response.body.data.activitiesCount).toBe(2);
      
      // User-specific stats
      expect(response.body.data.userTasksCount).toBe(2); // Tasks assigned to regularUser
      expect(response.body.data.userPendingTasksCount).toBe(1);
      expect(response.body.data.userCompletedTasksCount).toBe(1);
    });
    
    it('should return stats with zero counts when no data exists', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // System stats (only users exist)
      expect(response.body.data.usersCount).toBe(2);
      expect(response.body.data.tasksCount).toBe(0);
      expect(response.body.data.pendingTasksCount).toBe(0);
      expect(response.body.data.completedTasksCount).toBe(0);
      expect(response.body.data.activitiesCount).toBe(0);
      
      // User-specific stats
      expect(response.body.data.userTasksCount).toBe(0);
      expect(response.body.data.userPendingTasksCount).toBe(0);
      expect(response.body.data.userCompletedTasksCount).toBe(0);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/activities', () => {
    beforeEach(async () => {
      // Create a sequence of activities with different timestamps
      for (let i = 1; i <= 15; i++) {
        const isRegularUserActivity = i % 2 === 0; // Even numbers for regularUser, odd for adminUser
        
        await Activity.create({
          description: `Activity ${i}`,
          entityType: 'user',
          entityId: isRegularUserActivity ? regularUser._id : adminUser._id,
          action: 'update',
          status: 'completed',
          userId: isRegularUserActivity ? regularUser._id : adminUser._id,
          // Each activity is created 1 hour apart, with most recent ones having higher numbers
          createdAt: new Date(Date.now() - (15 - i) * 60 * 60 * 1000)
        });
      }
    });
    
    it('should return recent activities with default limit', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(10); // Default limit is 10
      expect(response.body.data.length).toBe(10);
      
      // Activities should be in reverse chronological order (newest first)
      expect(response.body.data[0].description).toBe('Activity 15');
      expect(response.body.data[9].description).toBe('Activity 6');
    });
    
    it('should respect the limit parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(5);
      expect(response.body.data.length).toBe(5);
      
      // Should return the 5 most recent activities
      const descriptions = response.body.data.map((activity: any) => activity.description);
      expect(descriptions).toEqual([
        'Activity 15',
        'Activity 14',
        'Activity 13',
        'Activity 12',
        'Activity 11'
      ]);
    });
    
    it('should filter activities by current user when onlyMine=true', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities?onlyMine=true')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      
      // Should only include activities for the regular user (even numbers)
      response.body.data.forEach((activity: any) => {
        expect(activity.userId.toString()).toBe(regularUser._id.toString());
      });
      
      // Verify all returned activities are for the regular user
      const activityNumbers = response.body.data
        .map((activity: any) => parseInt(activity.description.split(' ')[1]))
        .sort((a: number, b: number) => a - b);
        
      activityNumbers.forEach((num: number) => {
        expect(num % 2).toBe(0); // All should be even numbers
      });
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/tasks', () => {
    beforeEach(async () => {
      // Create tasks for both users with different priorities and due dates
      await Task.create([
        {
          title: 'Regular User Pending Task',
          description: 'Task for regular user',
          status: 'pending',
          priority: 'high',
          assignedTo: regularUser._id,
          createdBy: adminUser._id,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        },
        {
          title: 'Regular User In-Progress Task',
          description: 'Another task for regular user',
          status: 'in-progress',
          priority: 'medium',
          assignedTo: regularUser._id,
          createdBy: adminUser._id,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        {
          title: 'Regular User Completed Task',
          description: 'Completed task for regular user',
          status: 'completed',
          priority: 'low',
          assignedTo: regularUser._id,
          createdBy: regularUser._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
          title: 'Admin User Task',
          description: 'Task for admin user',
          status: 'pending',
          priority: 'urgent',
          assignedTo: adminUser._id,
          createdBy: adminUser._id,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        },
      ]);
    });
    
    it('should return tasks assigned to the current user', async () => {
      // Test with regularUser token
      const response = await request(app)
        .get('/api/dashboard/tasks')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3); // Regular user has 3 tasks
      expect(response.body.data.length).toBe(3);
      
      // Verify returned tasks
      const titles = response.body.data.map((task: any) => task.title);
      expect(titles).toContain('Regular User Pending Task');
      expect(titles).toContain('Regular User In-Progress Task');
      expect(titles).toContain('Regular User Completed Task');
      expect(titles).not.toContain('Admin User Task');
      
      // Tasks should be sorted by due date (ascending)
      expect(response.body.data[0].title).toBe('Regular User Pending Task');
      expect(response.body.data[1].title).toBe('Regular User In-Progress Task');
      expect(response.body.data[2].title).toBe('Regular User Completed Task');
    });
    
    it('should filter tasks by status', async () => {
      // Test filtering for completed tasks
      const response = await request(app)
        .get('/api/dashboard/tasks?status=completed')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Regular User Completed Task');
      expect(response.body.data[0].status).toBe('completed');
    });
    
    it('should respect the limit parameter', async () => {
      // Should limit to 2 tasks even though user has 3
      const response = await request(app)
        .get('/api/dashboard/tasks?limit=2')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
      
      // Should return the 2 tasks with earliest due dates
      expect(response.body.data[0].title).toBe('Regular User Pending Task');
      expect(response.body.data[1].title).toBe('Regular User In-Progress Task');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/tasks');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/dashboard/system-status', () => {
    it('should return system status information', async () => {
      const response = await request(app)
        .get('/api/dashboard/system-status')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // From mock
      expect(response.body.data.length).toBe(2);
      
      // Check for expected component data
      expect(response.body.data[0].name).toBe('API Service');
      expect(response.body.data[0].status).toBe('operational');
      expect(response.body.data[1].name).toBe('Database');
      expect(response.body.data[1].status).toBe('operational');
      
      // Verify service methods were called
      expect(SystemStatusService.checkDatabaseHealth).toHaveBeenCalledTimes(1);
      expect(SystemStatusService.getAllComponentStatus).toHaveBeenCalledTimes(1);
    });
    
    it('should handle database health check failure', async () => {
      // Mock database health check to fail
      (SystemStatusService.checkDatabaseHealth as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection failed')
      );
      
      const response = await request(app)
        .get('/api/dashboard/system-status')
        .set('Authorization', `Bearer ${adminToken}`);
        
      // Should still return 200 with available component statuses
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // The mock getAllComponentStatus still returns operational statuses
      expect(response.body.data[1].name).toBe('Database');
      expect(response.body.data[1].status).toBe('operational');
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/system-status');
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});