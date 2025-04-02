const fs = require('fs');
const path = require('path');

console.log('🚀 Starting NotificationCenter fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/notifications/components/NotificationCenter.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
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

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/notifications/components/NotificationCenter.tsx');
} catch (error) {
  console.error('❌ Error fixing NotificationCenter.tsx:', error);
}

console.log('✅ All fixes applied');