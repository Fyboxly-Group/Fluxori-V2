import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '@/components/Notifications/NotificationBell';
import { showNotification } from '@mantine/notifications';
import { IconBell, IconCheck } from '@tabler/icons-react';

interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

interface UseNotificationsOptions {
  /** Whether to show toast notifications for new items */
  showToasts?: boolean;
  /** Whether to auto-connect WebSocket for real-time updates */
  enableRealtime?: boolean;
  /** URL for the WebSocket connection */
  websocketUrl?: string;
  /** Maximum number of notifications to keep in state */
  maxItems?: number;
  /** Whether to persist notifications in localStorage */
  persistLocally?: boolean;
  /** localStorage key for persisting notifications */
  storageKey?: string;
}

/**
 * Hook for managing notifications with real-time updates and persistence
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    showToasts = true,
    enableRealtime = true,
    websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://api.example.com/ws',
    maxItems = 100,
    persistLocally = true,
    storageKey = 'fluxori_notifications'
  } = options;
  
  // State for notifications
  const [state, setState] = useState<NotificationsState>({
    items: [],
    loading: true,
    error: null,
    unreadCount: 0
  });
  
  // Keep track of connected status
  const [connected, setConnected] = useState(false);
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    if (persistLocally) {
      try {
        const savedNotifications = localStorage.getItem(storageKey);
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications);
          
          // Convert string dates back to Date objects
          const items = parsed.map((notification: any) => ({
            ...notification,
            date: new Date(notification.date)
          })) as Notification[];
          
          setState({
            items,
            loading: false,
            error: null,
            unreadCount: items.filter(item => !item.read).length
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [persistLocally, storageKey]);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    if (persistLocally && state.items.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      } catch (error) {
        console.error('Failed to save notifications to localStorage:', error);
      }
    }
  }, [state.items, persistLocally, storageKey]);
  
  // Connect to WebSocket for real-time notifications
  useEffect(() => {
    if (!enableRealtime) return;
    
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(websocketUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              // Add new notification
              addNotification({
                id: data.id || `notification-${Date.now()}`,
                message: data.message,
                date: new Date(),
                read: false,
                type: data.notificationType || 'info',
                category: data.category,
                link: data.link
              });
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnected(false);
          
          // Reconnect after a delay
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnected(false);
      }
    };
    
    connectWebSocket();
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enableRealtime, websocketUrl]);
  
  // Add a new notification
  const addNotification = useCallback((notification: Notification) => {
    setState(prev => {
      // Check if notification with same ID already exists
      const exists = prev.items.some(item => item.id === notification.id);
      
      if (exists) {
        return prev;
      }
      
      // Add new notification at the beginning and limit total count
      const newItems = [notification, ...prev.items].slice(0, maxItems);
      
      // Calculate new unread count
      const unreadCount = newItems.filter(item => !item.read).length;
      
      return {
        ...prev,
        items: newItems,
        unreadCount
      };
    });
    
    // Show toast notification if enabled
    if (showToasts) {
      showNotification({
        title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
        message: notification.message,
        color: getNotificationColor(notification.type),
        icon: <IconBell size={18} />,
        autoClose: 5000
      });
    }
  }, [maxItems, showToasts]);
  
  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setState(prev => {
      // Find and update the notification
      const items = prev.items.map(item => 
        item.id === id ? { ...item, read: true } : item
      );
      
      // Calculate new unread count
      const unreadCount = items.filter(item => !item.read).length;
      
      return {
        ...prev,
        items,
        unreadCount
      };
    });
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState(prev => {
      // Mark all notifications as read
      const items = prev.items.map(item => ({ ...item, read: true }));
      
      return {
        ...prev,
        items,
        unreadCount: 0
      };
    });
    
    // Show confirmation toast
    showNotification({
      title: 'All notifications marked as read',
      message: 'Your notification center is now clear',
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 3000
    });
  }, []);
  
  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setState(prev => {
      // Remove the notification
      const items = prev.items.filter(item => item.id !== id);
      
      // Calculate new unread count
      const unreadCount = items.filter(item => !item.read).length;
      
      return {
        ...prev,
        items,
        unreadCount
      };
    });
  }, []);
  
  // Clear all notifications
  const clearAll = useCallback(() => {
    setState({
      items: [],
      loading: false,
      error: null,
      unreadCount: 0
    });
    
    if (persistLocally) {
      localStorage.removeItem(storageKey);
    }
  }, [persistLocally, storageKey]);
  
  // Simulate receiving a new notification (for testing)
  const simulateNewNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const types = {
      info: 'New information is available',
      success: 'Operation completed successfully',
      warning: 'Attention required on your account',
      error: 'Error occurred in your recent action'
    };
    
    const categories = ['System', 'Account', 'Inventory', 'Orders', 'Shipments'];
    
    addNotification({
      id: `notification-${Date.now()}`,
      message: types[type],
      date: new Date(),
      read: false,
      type,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }, [addNotification]);
  
  // Helper function to get color based on notification type
  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  return {
    notifications: state.items,
    loading: state.loading,
    error: state.error,
    unreadCount: state.unreadCount,
    connected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    simulateNewNotification
  };
}

export default useNotifications;