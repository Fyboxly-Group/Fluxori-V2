const fs = require('fs');
const path = require('path');

console.log('🚀 Starting useNotifications fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/notifications/hooks/useNotifications.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `/**
 * Hook for managing notifications
 * Provides real-time notifications via WebSocket and REST API
 */

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react/toast';
import { 
  notificationApi, 
  Notification, 
  GetNotificationsResponse,
  NotificationUpdateResponse
} from '../api/notification.api';
import { notificationSocket } from '../services/notification-socket';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isError: boolean;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Create context with default values
const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  isError: false,
  isConnected: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotification: async () => {},
  clearAllNotifications: async () => {},
  refreshNotifications: async () => {},
});

// Provider props interface
interface NotificationProviderProps {
  children: ReactNode;
  authToken: string;
  showToasts?: boolean;
}

// The provider component that wraps your app and provides the notification context
export function NotificationProvider({
  children,
  authToken,
  showToasts = true,
}: NotificationProviderProps) {
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Get toast functionality from Chakra UI
  const toast = useToast();
  
  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: GetNotificationsResponse = await notificationApi.getNotifications(100, 0, true);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Connect to websocket and listen for notifications
  useEffect(() => {
    if (authToken) {
      notificationSocket.setAuthToken(authToken);
      notificationSocket.connect();
    }
    
    // Set up event listeners
    const onConnectUnsubscribe = notificationSocket.onConnect(() => {
      console.log('Notification WebSocket connected');
      setIsConnected(true);
      fetchNotifications();
    });
    
    const onDisconnectUnsubscribe = notificationSocket.onDisconnect(() => {
      console.log('Notification WebSocket disconnected');
      setIsConnected(false);
    });
    
    const onErrorUnsubscribe = notificationSocket.onError((error) => {
      console.error('Notification WebSocket error:', error);
      setIsError(true);
    });
    
    const onNotificationUnsubscribe = notificationSocket.onNotification((data) => {
      console.log('Notification received:', data);
      
      // Handle different notification types
      switch (data.type as string) {
        case 'new_notification':
          // Add new notification to the list
          if (data.notification) {
            // Ensure we don't duplicate notifications
            setNotifications(prev => data.notification ? [data.notification, ...prev] : prev);
            setUnreadCount(prev => prev + 1);
            
            // Show toast if enabled
            if (showToasts) {
              toast({
                title: data.notification.title || 'New Notification',
                description: data.notification.message,
                status: 'info',
                duration: 5000,
                isClosable: true,
                position: 'top-right'
              });
            }
          }
          break;
          
        case 'notifications_read_all':
          // Mark all notifications as read
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
          break;
          
        case 'notifications_cleared':
          // Remove notifications
          if (data.notificationId) {
            // Get notification before removing
            setNotifications(prev => {
              // Check if was unread
              const notificationToCheck = prev.find(n => n._id === data.notificationId);
              const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
              
              // Update unread count
              if (wasUnread) {
                setUnreadCount(count => Math.max(0, count - 1));
              }
              
              // Filter out the removed notification
              return prev.filter(n => n._id !== data.notificationId);
            });
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
          break;
          
        default:
          fetchNotifications();
          break;
      }
    });
    
    // Initial fetch
    fetchNotifications();
    
    // Cleanup
    return () => {
      onConnectUnsubscribe();
      onDisconnectUnsubscribe();
      onErrorUnsubscribe();
      onNotificationUnsubscribe();
      notificationSocket.disconnect();
    };
  }, [authToken, fetchNotifications, toast, showToasts]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Get notification before updating
      const notificationToCheck = notifications.find(n => n._id === notificationId);
      
      if (isConnected) {
        // Use websocket
        notificationSocket.markAsRead(notificationId);
      } else {
        // Use REST API
        await notificationApi.markAsRead(notificationId);
      }
      
      // Update state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setIsError(true);
    }
  }, [isConnected, notifications]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (isConnected) {
        // Use websocket
        notificationSocket.markAllAsRead();
      } else {
        // Use REST API
        await notificationApi.markAllAsRead();
      }
      
      // Update state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setIsError(true);
    }
  }, [isConnected]);
  
  // Clear a single notification
  const clearNotification = useCallback(async (notificationId: string) => {
    try {
      // Get notification before removing
      const notificationToCheck = notifications.find(n => n._id === notificationId);
      
      if (isConnected) {
        // Use websocket
        notificationSocket.clearNotification(notificationId);
      } else {
        // Use REST API
        await notificationApi.clearNotification(notificationId);
      }
      
      // Update state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count
      const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
      setIsError(true);
    }
  }, [isConnected, notifications]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      if (isConnected) {
        // Use API for now, as socket might not support this
        // (Backend probably has a broadcast method for this)
        await notificationApi.clearAllNotifications();
      } else {
        // Use REST API
        await notificationApi.clearAllNotifications();
      }
      
      // Update state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      setIsError(true);
    }
  }, [isConnected]);
  
  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);
  
  // Context value
  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    isError,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notifications in components
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/notifications/hooks/useNotifications.tsx');
} catch (error) {
  console.error('❌ Error fixing useNotifications.tsx:', error);
}

console.log('✅ All fixes applied');