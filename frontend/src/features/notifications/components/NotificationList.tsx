/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React, { useState } from 'react';
;
;
import { Button  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Divider  } from '@/utils/chakra-compat';
import { List, ListItem  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { HStack, VStack  } from '@/utils/chakra-compat';
import { IconButton  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { Bell, X, Settings, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification, NotificationType } from '../types/notification.types';
import { Box, Text } from '@/utils/chakra-compat';
;

interface NotificationListProps {
  maxItems?: number;
  onNotificationClick?: (notification: Notification) => void;
  showSettings?: boolean;
  showClearAll?: boolean;
  onSettingsClick?: () => void;
}

export function NotificationList({
  maxItems = 5,
  onNotificationClick,
  showSettings = true,
  showClearAll = true,
  onSettingsClick
}: NotificationListProps) {
  const { colorMode } = useColorMode();
  const { 
    notifications, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();
  
  const [expanded, setExpanded] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };
  
  // Get icon for notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Info:
        return <Info size={16} />;
      case NotificationType.Warning:
        return <AlertTriangle size={16} />;
      case NotificationType.Success:
        return <CheckCircle size={16} />;
      case NotificationType.Error:
        return <AlertTriangle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };
  
  // Get color for notification type
  const getColorScheme = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Info: return 'blue';
      case NotificationType.Warning: return 'orange';
      case NotificationType.Success: return 'green';
      case NotificationType.Error: return 'red';
      default: return 'gray';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };
  
  // Get notifications to display
  const displayNotifications = expanded 
    ? notifications 
    : notifications.slice(0, maxItems);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack>
          <Text fontWeight="bold">Notifications</Text>
          {unreadCount > 0 && (
            <Badge colorScheme="red" borderRadius="full">
              {unreadCount}
            </Badge>
          )}
        </HStack>
        
        <HStack gap={1}>
          {showClearAll && notifications.length > 0 && (
            <IconButton
              aria-label="Mark all as read"
              icon={<CheckCircle size={14}  />}
              size="xs"
              variant="ghost"
              onClick={() => markAllAsRead()}
            />
          )}
          
          {showSettings && (
            <IconButton
              aria-label="Notification settings"
              icon={<Settings size={14}  />}
              size="xs"
              variant="ghost"
              onClick={onSettingsClick}
            />
          )}
        </HStack>
      </Flex>
      
      <Divider mb={2}  />
      
      {/* Loading state */}
      {loading && (
        <Box py={4} textAlign="center">
          <Spinner size="sm"  />
          <Text mt={2} fontSize="sm" color="gray.500">
            Loading notifications...
          </Text>
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Box 
          py={3} 
          px={4} 
          bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
          color={colorMode === 'light' ? 'red.500' : 'red.200'}
          borderRadius="md"
          mb={2}
        >
          <Text fontSize="sm">Error loading notifications</Text>
        </Box>
      )}
      
      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <Box 
          py={6} 
          textAlign="center" 
          bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
          borderRadius="md"
        >
          <Bell size={24} opacity={0.5} stroke={colorMode === 'light' ? '#718096' : '#A0AEC0'} />
          <Text mt={2} fontSize="sm" color="gray.500">
            No notifications yet
          </Text>
        </Box>
      )}
      
      {/* Notification list */}
      {!loading && !error && notifications.length > 0 && (
        <List gap={1}>
          {displayNotifications.map(notification => (
            <ListItem 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              cursor="pointer"
              borderRadius="md"
              p={2}
              bg={notification.isRead 
                ? 'transparent' 
                : colorMode === 'light' ? 'blue.50' : 'blue.900'
              }
              _hover={{
                bg: colorMode === 'light' ? 'gray.50' : 'gray.700'
              }}
              transition="background-color 0.2s"
            >
              <Flex>
                <Box 
                  mr={3}
                  color={getColorScheme(notification.type)}
                  mt={1}
                >
                  {getIcon(notification.type)}
                </Box>
                
                <Box flex={1}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text 
                      fontSize="sm" 
                      fontWeight={notification.isRead ? 'normal' : 'medium'}
                    >
                      {notification.title}
                    </Text>
                    
                    <IconButton
                      aria-label="Delete notification"
                      icon={<X size={12}  />}
                      size="xs"
                      variant="ghost"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    />
                  </Flex>
                  
                  <Text 
                    fontSize="xs" 
                    color={colorMode === 'light' ? 'gray.600' : 'gray.400'}
                    mb={1}
                    noOfLines={2}
                  >
                    {notification.message}
                  </Text>
                  
                  <Text 
                    fontSize="xs" 
                    color={colorMode === 'light' ? 'gray.500' : 'gray.500'}
                  >
                    {formatDate(notification.createdAt)}
                  </Text>
                </Box>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Show more/less button */}
      {!loading && !error && notifications.length > maxItems && (
        <Button 
          variant="ghost" 
          size="xs"
          width="full"
          mt={2}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : `Show More (${notifications.length - maxItems})`}
        </Button>
      )}
      
      {/* Clear all button */}
      {showClearAll && !loading && !error && notifications.length > 0 && (
        <Button 
          variant="outline" 
          size="xs"
          width="full"
          mt={2}
          onClick={() => deleteAllNotifications()}
        >
          Clear All
        </Button>
      )}
    </Box>
  );
}