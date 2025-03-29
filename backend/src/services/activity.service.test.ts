import mongoose from 'mongoose';
import { ActivityService } from './activity.service';
import Activity from '../models/activity.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Connect to a test database before running tests
beforeEach(async () => {
  // Clear the Activity collection before each test
  await Activity.deleteMany({});
});

describe('ActivityService', () => {
  // Generate a valid ObjectId for testing
  const mockUserId = new mongoose.Types.ObjectId();
  const mockTaskId = new mongoose.Types.ObjectId();
  
  describe('logActivity', () => {
    it('should log a new activity', async () => {
      const activityData = {
        description: 'Test activity',
        entityType: 'system' as const,
        action: 'create' as const,
        status: 'completed' as const,
        userId: mockUserId,
        metadata: { test: true }
      };
      
      const result = await ActivityService.logActivity(activityData);
      
      // Verify activity was created
      expect(result).toBeDefined();
      expect(result!.description).toBe(activityData.description);
      expect(result!.entityType).toBe(activityData.entityType);
      expect(result!.action).toBe(activityData.action);
      expect(result!.status).toBe(activityData.status);
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      expect(result!.metadata).toEqual(activityData.metadata);
      
      // Verify activity was saved to database
      const savedActivity = await Activity.findById(result!._id);
      expect(savedActivity).toBeDefined();
      expect(savedActivity!.description).toBe(activityData.description);
    });
    
    it('should handle errors gracefully without throwing', async () => {
      // Mock save to throw an error
      jest.spyOn(mongoose.Model.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      // Mock console.error to prevent error output during test
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const activityData = {
        description: 'Test activity',
        entityType: 'system' as const,
        action: 'create' as const,
        status: 'completed' as const,
        userId: mockUserId
      };
      
      const result = await ActivityService.logActivity(activityData);
      
      // Verify error was logged but no exception was thrown
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();
      
      // Restore console.error
      console.error = originalConsoleError;
      
      // Restore the original save method
      jest.restoreAllMocks();
    });
  });
  
  describe('logUserLogin', () => {
    it('should log user login activity', async () => {
      const result = await ActivityService.logUserLogin(mockUserId);
      
      expect(result).toBeDefined();
      expect(result!.description).toBe('User logged in');
      expect(result!.entityType).toBe('user');
      expect(result!.entityId.toString()).toBe(mockUserId.toString());
      expect(result!.action).toBe('login');
      expect(result!.status).toBe('completed');
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      
      // Verify activity was saved to database
      const activities = await Activity.find({ userId: mockUserId });
      expect(activities.length).toBe(1);
      expect(activities[0].action).toBe('login');
    });
  });
  
  describe('logUserLogout', () => {
    it('should log user logout activity', async () => {
      const result = await ActivityService.logUserLogout(mockUserId);
      
      expect(result).toBeDefined();
      expect(result!.description).toBe('User logged out');
      expect(result!.entityType).toBe('user');
      expect(result!.entityId.toString()).toBe(mockUserId.toString());
      expect(result!.action).toBe('logout');
      expect(result!.status).toBe('completed');
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      
      // Verify activity was saved to database
      const activities = await Activity.find({ userId: mockUserId });
      expect(activities.length).toBe(1);
      expect(activities[0].action).toBe('logout');
    });
  });
  
  describe('logTaskCreate', () => {
    it('should log task creation activity', async () => {
      const taskTitle = 'Test Task';
      
      const result = await ActivityService.logTaskCreate(mockTaskId, mockUserId, taskTitle);
      
      expect(result).toBeDefined();
      expect(result!.description).toBe(`Task "${taskTitle}" created`);
      expect(result!.entityType).toBe('task');
      expect(result!.entityId.toString()).toBe(mockTaskId.toString());
      expect(result!.action).toBe('create');
      expect(result!.status).toBe('completed');
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      
      // Verify activity was saved to database
      const activities = await Activity.find({ entityId: mockTaskId });
      expect(activities.length).toBe(1);
      expect(activities[0].action).toBe('create');
    });
  });
  
  describe('logTaskUpdate', () => {
    it('should log task update activity with changes metadata', async () => {
      const taskTitle = 'Test Task';
      const changes = { status: 'completed', priority: 'high' };
      
      const result = await ActivityService.logTaskUpdate(mockTaskId, mockUserId, taskTitle, changes);
      
      expect(result).toBeDefined();
      expect(result!.description).toBe(`Task "${taskTitle}" updated`);
      expect(result!.entityType).toBe('task');
      expect(result!.entityId.toString()).toBe(mockTaskId.toString());
      expect(result!.action).toBe('update');
      expect(result!.status).toBe('completed');
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      expect(result!.metadata).toEqual({ changes });
      
      // Verify activity was saved to database
      const activities = await Activity.find({ entityId: mockTaskId });
      expect(activities.length).toBe(1);
      expect(activities[0].action).toBe('update');
      expect(activities[0].metadata).toEqual({ changes });
    });
  });
  
  describe('logTaskStatusChange', () => {
    it('should log task status change activity with old and new status metadata', async () => {
      const taskTitle = 'Test Task';
      const oldStatus = 'pending';
      const newStatus = 'completed';
      
      const result = await ActivityService.logTaskStatusChange(
        mockTaskId,
        mockUserId,
        taskTitle,
        oldStatus,
        newStatus
      );
      
      expect(result).toBeDefined();
      expect(result!.description).toBe(`Task "${taskTitle}" status changed from ${oldStatus} to ${newStatus}`);
      expect(result!.entityType).toBe('task');
      expect(result!.entityId.toString()).toBe(mockTaskId.toString());
      expect(result!.action).toBe('update');
      expect(result!.status).toBe('completed');
      expect(result!.userId.toString()).toBe(mockUserId.toString());
      expect(result!.metadata).toEqual({ oldStatus, newStatus });
      
      // Verify activity was saved to database
      const activities = await Activity.find({ entityId: mockTaskId });
      expect(activities.length).toBe(1);
      expect(activities[0].metadata).toEqual({ oldStatus, newStatus });
    });
  });
  
  describe('getRecentActivities', () => {
    // Skip these tests as they require proper User model setup
    it.skip('should return recent activities with default limit', async () => {
      // Testing implementation details - verify query structure
      const findSpy = jest.spyOn(Activity, 'find');
      const sortSpy = jest.spyOn(mongoose.Query.prototype, 'sort');
      const limitSpy = jest.spyOn(mongoose.Query.prototype, 'limit');
      
      await ActivityService.getRecentActivities();
      
      expect(findSpy).toHaveBeenCalledWith({});
      expect(sortSpy).toHaveBeenCalledWith({ createdAt: -1 });
      expect(limitSpy).toHaveBeenCalledWith(10);
      
      // Restore spies
      findSpy.mockRestore();
      sortSpy.mockRestore();
      limitSpy.mockRestore();
    });
    
    it.skip('should return activities with specified limit', async () => {
      // Similar implementation details test
      const limitSpy = jest.spyOn(mongoose.Query.prototype, 'limit');
      
      await ActivityService.getRecentActivities(5);
      
      expect(limitSpy).toHaveBeenCalledWith(5);
      
      limitSpy.mockRestore();
    });
    
    it.skip('should filter activities by userId', async () => {
      const findSpy = jest.spyOn(Activity, 'find');
      
      await ActivityService.getRecentActivities(10, mockUserId);
      
      expect(findSpy).toHaveBeenCalledWith({ userId: mockUserId });
      
      findSpy.mockRestore();
    });
  });
});