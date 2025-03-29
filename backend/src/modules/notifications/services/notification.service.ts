import Notification, { 
  INotification, 
  INotificationDocument, 
  NotificationType,
  NotificationCategory
} from '../models/notification.model';
import { NotificationWebSocketManager } from '../utils/websocket';
import mongoose from 'mongoose';

/**
 * Data structure for creating a notification
 */
export interface CreateNotificationDto {
  userId: string;
  organizationId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  data?: any;
  expiresAt?: Date;
}

/**
 * NotificationService
 * Handles creating, retrieving, and managing notifications
 */
export class NotificationService {
  private wsManager: NotificationWebSocketManager;
  
  /**
   * Constructor
   */
  constructor() {
    this.wsManager = NotificationWebSocketManager.getInstance();
  }
  
  /**
   * Create a notification and send it in real-time
   * @param notificationData Notification data
   * @returns The created notification
   */
  public async createAndSend(notificationData: CreateNotificationDto): Promise<INotificationDocument> {
    try {
      // Create notification in database
      const notification = await this.create(notificationData);
      
      // Send via WebSocket
      this.sendRealTime(notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }
  
  /**
   * Create a notification in the database
   * @param notificationData Notification data
   * @returns The created notification
   */
  public async create(notificationData: CreateNotificationDto): Promise<INotificationDocument> {
    try {
      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(notificationData.userId),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || NotificationType.INFO,
        category: notificationData.category || NotificationCategory.SYSTEM,
        data: notificationData.data,
        expiresAt: notificationData.expiresAt,
        isRead: false
      });
      
      // Add organizationId if provided
      if (notificationData.organizationId) {
        notification.organizationId = new mongoose.Types.ObjectId(notificationData.organizationId);
      }
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification via WebSocket
   * @param notification The notification to send
   * @returns Whether the notification was sent successfully
   */
  public sendRealTime(notification: INotificationDocument): boolean {
    try {
      const notificationData = {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        data: notification.data,
        createdAt: notification.createdAt
      };
      
      // Send to the specific user
      const sent = this.wsManager.sendToUser(
        notification.userId.toString(),
        'new_notification',
        notificationData
      );
      
      return sent;
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      return false;
    }
  }
  
  /**
   * Get notifications for a user
   * @param userId User ID
   * @param limit Maximum number of notifications to return
   * @param offset Offset for pagination
   * @param includeRead Whether to include read notifications
   * @returns List of notifications
   */
  public async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    includeRead: boolean = true
  ): Promise<INotificationDocument[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      // Filter by read status if needed
      if (!includeRead) {
        query.isRead = false;
      }
      
      // Get notifications, sorted by creation date (newest first)
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Get unread notification count for a user
   * @param userId User ID
   * @returns Count of unread notifications
   */
  public async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false
      });
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @param userId User ID (for verification)
   * @returns Updated notification
   */
  public async markAsRead(notificationId: string, userId: string): Promise<INotificationDocument | null> {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(notificationId),
          userId: new mongoose.Types.ObjectId(userId)
        },
        { isRead: true },
        { new: true }
      );
      
      return notification;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Number of notifications updated
   */
  public async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          isRead: false
        },
        { isRead: true }
      );
      
      // Send event via WebSocket to refresh UI immediately
      this.wsManager.sendToUser(
        userId,
        'notifications_read_all',
        { userId, timestamp: new Date() }
      );
      
      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   * @param notificationId Notification ID
   * @param userId User ID (for verification)
   * @returns Whether the deletion was successful
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.deleteOne({
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all notifications for a user
   * @param userId User ID
   * @returns Number of notifications deleted
   */
  public async clearAllNotifications(userId: string): Promise<number> {
    try {
      const result = await Notification.deleteMany({
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      // Send event via WebSocket to refresh UI immediately
      this.wsManager.sendToUser(
        userId,
        'notifications_cleared',
        { userId, timestamp: new Date() }
      );
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }
  
  /**
   * Send a system notification to all users in an organization
   * @param organizationId Organization ID
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   * @param category Notification category
   * @param data Additional data
   * @returns Number of users notified
   */
  public async notifyOrganization(
    organizationId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    category: NotificationCategory = NotificationCategory.SYSTEM,
    data?: any
  ): Promise<number> {
    try {
      // This requires getting all users in the organization
      // For now, just broadcasting via WebSocket without DB entries
      // In a real implementation, you'd query all org users and create notifications
      
      const notificationData = {
        title,
        message,
        type,
        category,
        data,
        organizationId,
        createdAt: new Date()
      };
      
      // Send to all users in the organization
      return this.wsManager.sendToOrganization(
        organizationId,
        'organization_notification',
        notificationData
      );
    } catch (error) {
      console.error('Error notifying organization:', error);
      return 0;
    }
  }
  
  /**
   * Send a system broadcast to all connected users
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   * @returns Number of users the broadcast was sent to
   */
  public broadcastSystemNotification(
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM
  ): number {
    const notificationData = {
      title,
      message,
      type,
      category: NotificationCategory.SYSTEM,
      createdAt: new Date()
    };
    
    return this.wsManager.broadcast('system_broadcast', notificationData);
  }
}