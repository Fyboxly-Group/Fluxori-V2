import mongoose from 'mongoose';
import { SeedService } from './seed.service';
import User from '../models/user.model';
import Task from '../models/task.model';
import Activity from '../models/activity.model';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('SeedService', () => {
  // Clear collections before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  describe('seedUsers', () => {
    it('should seed predefined users', async () => {
      const result = await SeedService.seedUsers();
      
      // Verify result
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Users seeded successfully');
      
      // Verify users were created
      const users = await User.find();
      expect(users.length).toBe(3);
      
      // Check specific users
      const admin = await User.findOne({ email: 'admin@fluxori.com' });
      const regularUser = await User.findOne({ email: 'user@fluxori.com' });
      const guestUser = await User.findOne({ email: 'guest@fluxori.com' });
      
      expect(admin).toBeDefined();
      expect(admin!.firstName).toBe('Admin');
      expect(admin!.role).toBe('admin');
      
      expect(regularUser).toBeDefined();
      expect(regularUser!.firstName).toBe('Regular');
      expect(regularUser!.role).toBe('user');
      
      expect(guestUser).toBeDefined();
      expect(guestUser!.firstName).toBe('Guest');
      expect(guestUser!.role).toBe('guest');
    });
    
    it('should handle errors gracefully', async () => {
      // Mock User.updateOne to throw an error
      jest.spyOn(User, 'updateOne').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const result = await SeedService.seedUsers();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should not create duplicate users', async () => {
      // Seed users twice
      await SeedService.seedUsers();
      await SeedService.seedUsers();
      
      // Verify no duplicates
      const adminUsers = await User.find({ email: 'admin@fluxori.com' });
      expect(adminUsers.length).toBe(1);
    });
  });
  
  describe('seedTasks', () => {
    it('should require users to exist first', async () => {
      const result = await SeedService.seedTasks();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Required users not found. Run seedUsers first.');
    });
    
    it('should seed predefined tasks when users exist', async () => {
      // Seed users first
      await SeedService.seedUsers();
      
      const result = await SeedService.seedTasks();
      
      // Verify result
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Tasks seeded successfully');
      
      // Verify tasks were created
      const tasks = await Task.find();
      expect(tasks.length).toBe(7); // Based on the number of predefined tasks
      
      // Check specific task
      const setupTask = await Task.findOne({ title: 'Set up project repository' });
      expect(setupTask).toBeDefined();
      expect(setupTask!.status).toBe('completed');
      expect(setupTask!.priority).toBe('high');
      expect(setupTask!.tags).toContain('setup');
    });
    
    it('should handle errors gracefully', async () => {
      // Seed users first
      await SeedService.seedUsers();
      
      // Mock Task.updateOne to throw an error
      jest.spyOn(Task, 'updateOne').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const result = await SeedService.seedTasks();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should not create duplicate tasks', async () => {
      // Seed users first
      await SeedService.seedUsers();
      
      // Seed tasks twice
      await SeedService.seedTasks();
      await SeedService.seedTasks();
      
      // Check for duplicates
      const setupTasks = await Task.find({ title: 'Set up project repository' });
      expect(setupTasks.length).toBe(1);
    });
  });
  
  describe('seedActivities', () => {
    it('should require users to exist first', async () => {
      const result = await SeedService.seedActivities();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Required users not found. Run seedUsers first.');
    });
    
    it('should require tasks to exist first', async () => {
      // Seed users but not tasks
      await SeedService.seedUsers();
      
      const result = await SeedService.seedActivities();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('No tasks found. Run seedTasks first.');
    });
    
    it('should seed predefined activities when users and tasks exist', async () => {
      // Seed users and tasks first
      await SeedService.seedUsers();
      await SeedService.seedTasks();
      
      const result = await SeedService.seedActivities();
      
      // Verify result
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Activities seeded successfully');
      
      // Verify activities were created
      const activities = await Activity.find();
      expect(activities.length).toBe(8); // Based on the number of predefined activities
      
      // Check specific activity types
      const loginActivities = activities.filter(a => a.action === 'login');
      const taskCreateActivities = activities.filter(a => a.action === 'create' && a.entityType === 'task');
      
      expect(loginActivities.length).toBeGreaterThan(0);
      expect(taskCreateActivities.length).toBeGreaterThan(0);
    });
    
    it('should handle errors gracefully', async () => {
      // Seed users and tasks first
      await SeedService.seedUsers();
      await SeedService.seedTasks();
      
      // Mock Activity.insertMany to throw an error
      jest.spyOn(Activity, 'insertMany').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const result = await SeedService.seedActivities();
      
      // Verify result
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('seedAll', () => {
    it('should run all seed methods in the correct order', async () => {
      // Spy on individual seed methods
      const seedUsersSpy = jest.spyOn(SeedService, 'seedUsers');
      const seedTasksSpy = jest.spyOn(SeedService, 'seedTasks');
      const seedActivitiesSpy = jest.spyOn(SeedService, 'seedActivities');
      
      await SeedService.seedAll();
      
      // Verify all methods were called
      expect(seedUsersSpy).toHaveBeenCalled();
      expect(seedTasksSpy).toHaveBeenCalled();
      expect(seedActivitiesSpy).toHaveBeenCalled();
      
      // Verify the order (implicitly by checking that users, tasks, and activities exist)
      const users = await User.find();
      const tasks = await Task.find();
      const activities = await Activity.find();
      
      expect(users.length).toBeGreaterThan(0);
      expect(tasks.length).toBeGreaterThan(0);
      expect(activities.length).toBeGreaterThan(0);
      
      // Verify success message
      expect(console.log).toHaveBeenCalledWith('All data seeded successfully');
    });
  });
});