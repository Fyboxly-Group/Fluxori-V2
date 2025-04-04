import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../../../middleware/error.middleware';
import { NotificationType, NotificationCategory } from '../models/notification.model';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * Controller for handling notification-related requests
 */
export class NotificationController {
  private static notificationService = new NotificationService();
  
  /**
   * Get notifications for authenticated user
   * @route GET /api/notifications
   */
  public static async getUserNotifications(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Get query parameters
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const includeRead = req.query.includeRead !== 'false';
      
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Get notifications
      const notifications = await this.notificationService.getUserNotifications(
        userId,
        limit,
        offset,
        includeRead
      );
      
      // Return them
      return res.status(200).json({
        success: true,
        data: notifications,
        meta: {
          limit,
          offset,
          includeRead
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get unread notification count
   * @route GET /api/notifications/unread-count
   */
  public static async getUnreadCount(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Get unread count
      const count = await this.notificationService.getUnreadCount(userId);
      
      // Return it
      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Mark a notification as read
   * @route PATCH /api/notifications/:id/read
   */
  public static async markAsRead(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const notificationId = req.params.id as any;
      
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Mark notification as read
      const updatedNotification = await this.notificationService.markAsRead(notificationId, userId);
      
      if (!updatedNotification) {
        throw new ApiError(404, 'Notification not found');
      }
      
      // Return success
      return res.status(200).json({
        success: true,
        data: updatedNotification
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Mark all notifications as read
   * @route PATCH /api/notifications/mark-all-read
   */
  public static async markAllAsRead(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Mark all notifications as read
      const count = await this.notificationService.markAllAsRead(userId);
      
      // Return success
      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete a notification
   * @route DELETE /api/notifications/:id
   */
  public static async deleteNotification(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const notificationId = req.params.id as any;
      
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Delete notification
      const success = await this.notificationService.deleteNotification(notificationId, userId);
      
      if (!success) {
        throw new ApiError(404, 'Notification not found');
      }
      
      // Return success
      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Clear all notifications
   * @route DELETE /api/notifications/clear-all
   */
  public static async clearAllNotifications(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      
      // Clear all notifications
      const count = await this.notificationService.clearAllNotifications(userId);
      
      // Return success
      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Send test notification to self (for testing)
   * @route POST /api/notifications/test
   */
  public static async sendTestNotification(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Only available in development
      if (process.env.NODE_ENV !== 'development') {
        throw new ApiError(403, 'Test endpoint only available in development');
      }
      
      // Get user ID from authenticated request
      if (!req.user || !(req.user as any)._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = (req.user as any)._id.toString();
      const organizationId = req.user.organizationId?.toString();
      
      // Get parameters from body
      const { title, message, type, category } = req.body;
      
      // Validate
      if (!title || !message) {
        throw new ApiError(400, 'Title and message are required');
      }
      
      // Create notification
      const notification = await this.notificationService.createAndSend({
        userId,
        organizationId,
        title,
        message,
        type: type || NotificationType.INFO,
        category: category || NotificationCategory.SYSTEM,
        data: { test: true, timestamp: new Date() }
      });
      
      // Return the created notification
      return res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }
}