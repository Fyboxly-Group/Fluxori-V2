/**
 * API client for notifications
 * Provides REST endpoints for notifications when WebSockets are not available
 */

// Notification types
export enum NotificationType {
  ALERT = 'ALERT',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SYNC_STATUS = 'SYNC_STATUS',
  SYSTEM = 'SYSTEM'
}

// Notification categories
export enum NotificationCategory {
  INVENTORY = 'INVENTORY',
  MARKETPLACE = 'MARKETPLACE',
  SHIPPING = 'SHIPPING',
  SYSTEM = 'SYSTEM',
  TASK = 'TASK',
  AI = 'AI',
  SECURITY = 'SECURITY',
  BILLING = 'BILLING'
}

// Notification interface
export interface Notification {
  _id: string;
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// Request and response interfaces
export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface NotificationUpdateResponse {
  success: boolean;
  message: string;
}

// API client for notifications
export const notificationApi = {
  /**
   * Get all notifications for the current user
   * @param limit Optional number of notifications to return
   * @param offset Optional offset for pagination
   * @param includeRead Optional flag to include read notifications
   */
  getNotifications: async (
    limit?: number,
    offset?: number,
    includeRead?: boolean
  ): Promise<GetNotificationsResponse> => {
    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (includeRead !== undefined) params.append('includeRead', includeRead.toString());
    
    // Make API request
    const response = await fetch(`/api/notifications?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },
  
  /**
   * Mark a notification as read
   * @param notificationId ID of the notification to mark as read
   */
  markAsRead: async (notificationId: string): Promise<NotificationUpdateResponse> => {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<NotificationUpdateResponse> => {
    const response = await fetch(`/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return response.json();
  },
  
  /**
   * Clear a notification
   * @param notificationId ID of the notification to clear
   */
  clearNotification: async (notificationId: string): Promise<NotificationUpdateResponse> => {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear notification');
    }
    
    return response.json();
  },
  
  /**
   * Clear all notifications
   */
  clearAllNotifications: async (): Promise<NotificationUpdateResponse> => {
    const response = await fetch(`/api/notifications/clear-all`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear all notifications');
    }
    
    return response.json();
  },
};