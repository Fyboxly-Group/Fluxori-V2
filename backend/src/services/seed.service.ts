import mongoose from 'mongoose';
import User from '../models/user.model';
import Task from '../models/task.model';
import Activity from '../models/activity.model';
import { ActivityService } from './activity.service';

/**
 * Service for seeding the database with initial data
 * This is useful for development and testing
 */
export class SeedService {
  /**
   * Seed users
   */
  static async seedUsers() : Promise<void> {
    const users = [
      {
        email: 'admin@fluxori.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
      {
        email: 'user@fluxori.com',
        password: 'password123',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
      },
      {
        email: 'guest@fluxori.com',
        password: 'password123',
        firstName: 'Guest',
        lastName: 'User',
        role: 'guest',
      },
    ];

    try {
      // Using updateOne with upsert to avoid duplicates
      for (const userData of users) {
        await User.updateOne(
          { email: userData.email },
          { $setOnInsert: userData },
          { upsert: true }
        );
      }

      console.log('Users seeded successfully');
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error seeding users:', error);
      return false;
    }
  }

  /**
   * Seed tasks
   */
  static async seedTasks() : Promise<void> {
    try {
      // Get user IDs
      const admin = await User.findOne({ email: 'admin@fluxori.com' });
      const regularUser = await User.findOne({ email: 'user@fluxori.com' });

      if (!admin || !regularUser) {
        console.error('Required users not found. Run seedUsers first.');
        return false;
      }

      const tasks = [
        {
          title: 'Set up project repository',
          description: 'Create GitHub repository and set up initial project structure',
          status: 'completed',
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          assignedTo: admin._id,
          createdBy: admin._id,
          priority: 'high',
          tags: ['setup', 'infrastructure'],
        },
        {
          title: 'Design database schema',
          description: 'Create MongoDB schema for users, tasks, and activities',
          status: 'completed',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          assignedTo: admin._id,
          createdBy: admin._id,
          priority: 'high',
          tags: ['database', 'design'],
        },
        {
          title: 'Implement authentication',
          description: 'Set up JWT authentication with login, register, and password reset',
          status: 'completed',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          assignedTo: admin._id,
          createdBy: admin._id,
          priority: 'high',
          tags: ['auth', 'security'],
        },
        {
          title: 'Create dashboard UI',
          description: 'Implement dashboard UI with stats, activities, and tasks',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          assignedTo: regularUser._id,
          createdBy: admin._id,
          priority: 'medium',
          tags: ['frontend', 'ui'],
        },
        {
          title: 'Set up CI/CD pipeline',
          description: 'Configure GitHub Actions for continuous integration and deployment',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          assignedTo: admin._id,
          createdBy: admin._id,
          priority: 'medium',
          tags: ['devops', 'infrastructure'],
        },
        {
          title: 'Implement task management',
          description: 'Add CRUD operations for tasks with assignments and status updates',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          assignedTo: regularUser._id,
          createdBy: regularUser._id,
          priority: 'high',
          tags: ['backend', 'feature'],
        },
        {
          title: 'Write documentation',
          description: 'Create comprehensive API documentation with examples',
          status: 'pending',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          assignedTo: regularUser._id,
          createdBy: admin._id,
          priority: 'low',
          tags: ['docs'],
        },
      ];

      // Using updateOne with upsert to avoid duplicates
      for (const taskData of tasks) {
        await Task.updateOne(
          { title: taskData.title },
          { $setOnInsert: taskData },
          { upsert: true }
        );
      }

      console.log('Tasks seeded successfully');
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error seeding tasks:', error);
      return false;
    }
  }

  /**
   * Seed activities
   */
  static async seedActivities() : Promise<void> {
    try {
      // Get user IDs
      const admin = await User.findOne({ email: 'admin@fluxori.com' });
      const regularUser = await User.findOne({ email: 'user@fluxori.com' });

      if (!admin || !regularUser) {
        console.error('Required users not found. Run seedUsers first.');
        return false;
      }

      // Get some task IDs
      const tasks = await Task.find().limit(3);
      
      if (tasks.length === 0) {
        console.error('No tasks found. Run seedTasks first.');
        return false;
      }

      const activities = [
        {
          description: 'User registered',
          entityType: 'user',
          entityId: regularUser._id,
          action: 'create',
          status: 'completed',
          userId: regularUser._id,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
        {
          description: 'Project setup completed',
          entityType: 'system',
          action: 'other',
          status: 'completed',
          userId: admin._id,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        },
        {
          description: `Task "${tasks[0].title}" created`,
          entityType: 'task',
          entityId: tasks[0]._id,
          action: 'create',
          status: 'completed',
          userId: admin._id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
          description: `Task "${tasks[0].title}" status changed from pending to completed`,
          entityType: 'task',
          entityId: tasks[0]._id,
          action: 'update',
          status: 'completed',
          userId: admin._id,
          metadata: { oldStatus: 'pending', newStatus: 'completed' },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          description: `Task "${tasks[1].title}" created`,
          entityType: 'task',
          entityId: tasks[1]._id,
          action: 'create',
          status: 'completed',
          userId: admin._id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          description: 'User logged in',
          entityType: 'user',
          entityId: regularUser._id,
          action: 'login',
          status: 'completed',
          userId: regularUser._id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          description: `Task "${tasks[2].title}" created`,
          entityType: 'task',
          entityId: tasks[2]._id,
          action: 'create',
          status: 'completed',
          userId: regularUser._id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          description: `Task "${tasks[2].title}" status changed from pending to in-progress`,
          entityType: 'task',
          entityId: tasks[2]._id,
          action: 'update',
          status: 'completed',
          userId: regularUser._id,
          metadata: { oldStatus: 'pending', newStatus: 'in-progress' },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      ];

      await Activity.deleteMany({}); // Clear existing activities
      await Activity.insertMany(activities);

      console.log('Activities seeded successfully');
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error seeding activities:', error);
      return false;
    }
  }

  /**
   * Run all seed methods
   */
  static async seedAll() : Promise<void> {
    await this.seedUsers();
    await this.seedTasks();
    await this.seedActivities();
    console.log('All data seeded successfully');
  }
}