import mongoose from 'mongoose';
import Activity, { IActivity } from '../models/activity.model';

/**
 * Service for logging user and system activities
 */
export class ActivityService {
  /**
   * Log a new activity
   */
  static async logActivity(activityData: Omit<IActivity, 'createdAt'>) {
    try {
      const activity = new Activity(activityData);
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to prevent disrupting the main workflow
      return null;
    }
  }

  /**
   * Log user login activity
   */
  static async logUserLogin(userId: mongoose.Types.ObjectId) {
    return this.logActivity({
      description: 'User logged in',
      entityType: 'user',
      entityId: userId,
      action: 'login',
      status: 'completed',
      userId,
    });
  }

  /**
   * Log user logout activity
   */
  static async logUserLogout(userId: mongoose.Types.ObjectId) {
    return this.logActivity({
      description: 'User logged out',
      entityType: 'user',
      entityId: userId,
      action: 'logout',
      status: 'completed',
      userId,
    });
  }

  /**
   * Log task creation activity
   */
  static async logTaskCreate(
    taskId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    taskTitle: string
  ) {
    return this.logActivity({
      description: `Task "${taskTitle}" created`,
      entityType: 'task',
      entityId: taskId,
      action: 'create',
      status: 'completed',
      userId,
    });
  }

  /**
   * Log task update activity
   */
  static async logTaskUpdate(
    taskId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    taskTitle: string,
    changes: Record<string, any>
  ) {
    return this.logActivity({
      description: `Task "${taskTitle}" updated`,
      entityType: 'task',
      entityId: taskId,
      action: 'update',
      status: 'completed',
      userId,
      metadata: { changes },
    });
  }

  /**
   * Log task status change activity
   */
  static async logTaskStatusChange(
    taskId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    taskTitle: string,
    oldStatus: string,
    newStatus: string
  ) {
    return this.logActivity({
      description: `Task "${taskTitle}" status changed from ${oldStatus} to ${newStatus}`,
      entityType: 'task',
      entityId: taskId,
      action: 'update',
      status: 'completed',
      userId,
      metadata: { oldStatus, newStatus },
    });
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit: number = 10, userId?: mongoose.Types.ObjectId) {
    const query = userId ? { userId } : {};
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean();
      
    return activities;
  }
}