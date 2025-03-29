/**
 * Hook for managing notifications
 * Provides access to notifications and methods for interacting with them
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { NotificationSocket } from '../utils/socket';
import { 
  notificationApi, 
  Notification, 
  GetNotificationsResponse,
  NotificationUpdateResponse
} from '../api/notification.api';
import { createToaster } from '@chakra-ui/react/toast';

// Context interface
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
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
  isLoading: false,
  isError: false,
  isConnected: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotification: async () => {},
  clearAllNotifications: async () => {},
  refreshNotifications: async () => {},
});

// Options for the provider
interface NotificationProviderProps {
  children: React.ReactNode;
  authToken?: string | null;
  showToasts?: boolean;
}

/**
 * Provider component for notifications
 */
export function NotificationProvider({
  children,
  authToken,
  showToasts = true,
}: NotificationProviderProps) {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // References
  const socket = NotificationSocket.getInstance();
  const toast = createToaster();
  
  // Fetch notifications
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
  
  // Connect to WebSocket
  useEffect(() => {
    if (authToken) {
      socket.setAuthToken(authToken);
      socket.connect();
    }
    
    // Set up event listeners
    const onConnectUnsubscribe = socket.onConnect(() => {
      console.log('Notification WebSocket connected');
      setIsConnected(true);
      fetchNotifications();
    });
    
    const onDisconnectUnsubscribe = socket.onDisconnect(() => {
      console.log('Notification WebSocket disconnected');
      setIsConnected(false);
    });
    
    const onErrorUnsubscribe = socket.onError((error) => {
      console.error('Notification WebSocket error:', error);
      setIsError(true);
    });
    
    const onNotificationUnsubscribe = socket.onNotification((data) => {
      console.log('Notification received:', data);
      
      // Handle different notification events
      switch (data.type as string) {
        case 'new_notification':
          // Add new notification to the list
          if (data.notification) {
            // Ensure notification is always defined in the array
            setNotifications(prev => data.notification ? [data.notification, ...prev] : prev);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification if enabled
            if (showToasts) {
              toast.show({
                title: data.notification.title,
                description: data.notification.message,
                status: (data.notification.type.toLowerCase() as string) as 'info' | 'warning' | 'success' | 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
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
          // Remove cleared notification or all notifications
          if (data.notificationId) {
            // Get current notifications to determine if the cleared one was unread
            // We use a callback to get the current state within the setState call
            setNotifications(prev => {
              // Check if the notification was unread before filtering
              const notificationToCheck = prev.find(n => n._id === data.notificationId);
              const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
              
              // Update unread count if needed
              if (wasUnread) {
                setUnreadCount(count => Math.max(0, count - 1));
              }
              
              // Filter out the cleared notification
              return prev.filter(n => n._id !== data.notificationId);
            });
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
          break;
          
        default:
          // Refresh notifications for other events
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
      socket.disconnect();
    };
  }, [authToken, fetchNotifications, socket, toast, showToasts]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Get a snapshot of the current notifications state
    const currentNotifications = notifications;
    try {
      if (isConnected) {
        // Use WebSocket if connected
        socket.markAsRead(notificationId);
      } else {
        // Fallback to REST API
        await notificationApi.markAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      const notificationToCheck = currentNotifications.find(n => n._id === notificationId);
      const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setIsError(true);
    }
  }, [isConnected, socket, notifications]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (isConnected) {
        // Use WebSocket if connected
        socket.markAllAsRead();
      } else {
        // Fallback to REST API
        await notificationApi.markAllAsRead();
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setIsError(true);
    }
  }, [isConnected, socket]);
  
  // Clear notification
  const clearNotification = useCallback(async (notificationId: string) => {
    // Get a snapshot of the current notifications state
    const currentNotifications = notifications;
    try {
      if (isConnected) {
        // Use WebSocket if connected
        socket.clearNotification(notificationId);
      } else {
        // Fallback to REST API
        await notificationApi.clearNotification(notificationId);
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if the cleared notification was unread
      const notificationToCheck = currentNotifications.find(n => n._id === notificationId);
      const wasUnread = notificationToCheck ? notificationToCheck.read === false : false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
      setIsError(true);
    }
  }, [isConnected, socket, notifications]);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      if (isConnected) {
        // Use WebSocket if connected - reuse existing endpoint
        // (Backend probably has a separate endpoint for this)
        await notificationApi.clearAllNotifications();
      } else {
        // Fallback to REST API
        await notificationApi.clearAllNotifications();
      }
      
      // Update local state
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
    isLoading,
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
 * Hook for using notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
