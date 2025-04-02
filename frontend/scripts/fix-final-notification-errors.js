const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Final Notification TypeScript Errors Fix Script');

// Fix useNotifications hook
function fixUseNotificationsHook() {
  const filePath = path.resolve(__dirname, '../src/features/notifications/hooks/useNotifications.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ useNotifications.tsx not found');
    return false;
  }
  
  const fixedContent = `/**
 * Notification Hook
 * Provides real-time notifications via WebSocket and REST API
 */

import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react/toast';
import { notificationApi, Notification, GetNotificationsResponse } from '../api/notification.api';
import { notificationSocket } from '../utils/socket';

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
      const response = await notificationApi.getNotifications(100, 0, true);
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
      switch (data.type) {
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

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed useNotifications hook');
  return true;
}

// Fix NotificationCenter component
function fixNotificationCenterComponent() {
  const filePath = path.resolve(__dirname, '../src/features/notifications/components/NotificationCenter.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ NotificationCenter.tsx not found');
    return false;
  }
  
  const fixedContent = `/**
 * Notification Center Component
 * A centralized notification management UI
 */

import React, { useState, useCallback } from 'react';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Box } from '@chakra-ui/react/box';
import { HStack } from '@chakra-ui/react/stack';
import { Flex } from '@chakra-ui/react/flex';
import { Button } from '@chakra-ui/react/button';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Select } from '@chakra-ui/react/select';
import { Tabs } from '@chakra-ui/react/tabs';
import { TabList } from '@chakra-ui/react/tabs';
import { TabPanels } from '@chakra-ui/react/tabs';
import { TabPanel } from '@chakra-ui/react/tabs';
import { Tab } from '@chakra-ui/react/tabs';
import { Badge } from '@chakra-ui/react/badge';
import { RefreshCcw } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { Notification, NotificationCategory } from '../api/notification.api';

export function NotificationCenter() {
  // State for tab and category filters
  const [activeTab, setActiveTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Use notifications hook to get data and actions
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAllAsRead, 
    clearAllNotifications,
    refreshNotifications
  } = useNotifications();
  
  // Filter notifications based on tab and category
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status (tab 1 shows only unread)
    if (activeTab === 1 && notification.read) return false;
    
    // Filter by category
    if (categoryFilter !== 'ALL' && notification.category !== categoryFilter) return false;
    
    return true;
  });
  
  // Get unique categories from notifications
  const uniqueCategories = notifications.reduce<NotificationCategory[]>((acc, notification) => {
    if (!acc.includes(notification.category)) {
      acc.push(notification.category);
    }
    return acc;
  }, []);
  
  // Handler to refresh notifications
  const handleRefresh = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);
  
  // Handler to mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);
  
  // Handler to clear all notifications
  const handleClearAll = useCallback(async () => {
    await clearAllNotifications();
  }, [clearAllNotifications]);
  
  // Handle category filter change
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  }, []);

  return (
    <Card width="full" variant="elevated">
      <CardHeader borderBottomWidth="1px" py={4}>
        <HStack justify="space-between">
          <Heading size="md">Notifications</Heading>
          
          <HStack>
            <Select
              size="sm"
              value={categoryFilter} 
              onChange={handleCategoryChange}
              minWidth="150px"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </Select>
            
            <Button
              size="sm"
              leftIcon={<RefreshCcw size={16} />} 
              onClick={handleRefresh}
              variant="ghost"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
      </CardHeader>
      
      <CardBody p={0}>
        <Tabs index={activeTab} onChange={(index) => setActiveTab(index)}>
          <TabList>
            <Tab>
              All
              {notifications.length > 0 && (
                <Text ml={1} fontSize="xs" fontWeight="bold">
                  ({notifications.length})
                </Text>
              )}
            </Tab>
            <Tab>
              Unread
              {unreadCount > 0 && (
                <Text ml={1} fontSize="xs" fontWeight="bold">
                  ({unreadCount})
                </Text>
              )}
            </Tab>
          </TabList>
          
          <Box mb={4} mt={2} px={4}>
            <Flex justify="flex-end">
              <ButtonGroup size="sm">
                <Button
                  disabled={unreadCount === 0} 
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                >
                  Mark All as Read
                </Button>
                <Button
                  disabled={filteredNotifications.length === 0} 
                  onClick={handleClearAll}
                  colorScheme="red"
                  variant="outline"
                >
                  Clear All
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
          
          <TabPanels>
            <TabPanel p={0}>
              <NotificationList
                notifications={filteredNotifications} 
                loading={loading}
              />
            </TabPanel>
            <TabPanel p={0}>
              <NotificationList
                notifications={filteredNotifications} 
                loading={loading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
}

export default NotificationCenter;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed NotificationCenter component');
  return true;
}

// Main function to fix remaining errors
async function fixFinalErrors() {
  // Fix remaining notification-related errors
  console.log('🔧 Fixing final notification components and hooks:');
  fixUseNotificationsHook();
  fixNotificationCenterComponent();
  
  console.log('\n🎉 Fixed final notification components with TypeScript errors');
}

// Run the fix function
fixFinalErrors().catch(error => {
  console.error('❌ Error fixing final notification TypeScript errors:', error);
});