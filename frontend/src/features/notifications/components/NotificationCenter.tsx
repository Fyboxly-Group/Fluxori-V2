/**
 * Notification Center Component
 * A standalone component for viewing all notifications on a dedicated page
 */

import { useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Heading } from '@chakra-ui/react/heading';
import { Card, CardHeader, CardBody } from '@chakra-ui/react/card';
import { HStack } from '@chakra-ui/react/stack';
import { Button } from '@chakra-ui/react/button';
import { ButtonGroup } from '@chakra-ui/react/button-group';
import { Select } from '@chakra-ui/react/select';
import { 
  Tab, 
  Tabs, 
  TabList, 
  TabPanel, 
  TabPanels 
} from '@chakra-ui/react/tabs';
import { Text } from '@chakra-ui/react/text';
import { Flex } from '@chakra-ui/react/flex';
import { Icon } from '@chakra-ui/react/icon';
import { RepeatIcon } from '@chakra-ui/icons';
import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { Notification, NotificationCategory } from '../api/notification.api';

export function NotificationCenter() {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Notifications
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAllAsRead, 
    clearAllNotifications,
    refreshNotifications
  } = useNotifications();
  
  // Filter notifications by read status and category
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
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
  const categories = uniqueCategories;
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);
  
  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);
  
  // Handle clear all
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </Select>
            
            <Button 
              size="sm" 
              leftIcon={<RepeatIcon />} 
              onClick={handleRefresh}
              variant="ghost"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
      </CardHeader>
      
      <CardBody p={0}>
        <Tabs isFitted index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>All</Tab>
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
                  isDisabled={unreadCount === 0} 
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                >
                  Mark all as read
                </Button>
                <Button 
                  isDisabled={filteredNotifications.length === 0} 
                  onClick={handleClearAll}
                  colorScheme="red"
                  variant="outline"
                >
                  Clear all
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
          
          <TabPanels>
            <TabPanel p={0}>
              <NotificationList 
                notifications={filteredNotifications} 
                isLoading={isLoading} 
              />
            </TabPanel>
            <TabPanel p={0}>
              <NotificationList 
                notifications={filteredNotifications} 
                isLoading={isLoading} 
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
}