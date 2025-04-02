/**
 * Notification Center Component
 * A centralized notification management UI
 */
/// <reference path="../../types/module-declarations.d.ts" />


import React, { useState, useCallback } from 'react';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { ButtonGroup  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Tabs  } from '@/utils/chakra-compat';
import { TabList  } from '@/utils/chakra-compat';
import { TabPanels  } from '@/utils/chakra-compat';
import { TabPanel  } from '@/utils/chakra-compat';
import { Tab  } from '@/utils/chakra-compat';
import { RefreshCcw } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { Notification, NotificationCategory } from '../api/notification.api';

interface NotificationCenterProps {}

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
  const uniqueCategories = notifications.reduce<NotificationCategory[]>((acc: any, notification: any) => {
    if (!acc.includes(notification.category)) {
      acc.push(notification.category);
    }
    return acc;
  }, []);
  
  // Handler to refresh notifications
  const handleRefresh = useCallback(async (_: any) => {
    await refreshNotifications();
  }, [refreshNotifications]);
  
  // Handler to mark all notifications as read
  const handleMarkAllAsRead = useCallback(async (_: any) => {
    await markAllAsRead();
  }, [markAllAsRead]);
  
  // Handler to clear all notifications
  const handleClearAll = useCallback(async (_: any) => {
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
        <Tabs index={activeTab} onChange={index => setActiveTab(index)}>
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
                isLoading={loading}
              />
            </TabPanel>
            <TabPanel p={0}>
              <NotificationList
                notifications={filteredNotifications} 
                isLoading={loading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
}

export default NotificationCenter;