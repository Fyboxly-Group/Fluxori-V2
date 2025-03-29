/**
 * Notification List Component
 * Displays a list of notifications with options to mark as read or clear
 */

import { useCallback } from 'react';
import { Box } from '@chakra-ui/react/box';
import { VStack, HStack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { IconButton } from '@chakra-ui/react/button';
import { Divider } from '@chakra-ui/react/divider';
import { Spinner } from '@chakra-ui/react/spinner';
import { Center } from '@chakra-ui/react/center';
import { Flex } from '@chakra-ui/react/flex';
import { Link } from '@chakra-ui/react/layout';
import { Icon } from '@chakra-ui/react/icon';
import { 
  CheckIcon, 
  CloseIcon, 
  InfoIcon, 
  WarningIcon, 
  CheckCircleIcon, 
  WarningTwoIcon
} from '@chakra-ui/icons';
import { Notification, NotificationType } from '../api/notification.api';
import { useNotifications } from '../hooks/useNotifications';
import NextLink from 'next/link';

// Format date to relative time (e.g. "2 hours ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
}

// Get icon for notification type
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.INFO:
      return InfoIcon;
    case NotificationType.SUCCESS:
      return CheckCircleIcon;
    case NotificationType.WARNING:
      return WarningIcon;
    case NotificationType.ERROR:
      return WarningTwoIcon;
    case NotificationType.ALERT:
      return WarningTwoIcon;
    default:
      return InfoIcon;
  }
}

// Get color scheme for notification type
function getColorScheme(type: NotificationType): string {
  switch (type) {
    case NotificationType.INFO:
      return 'blue';
    case NotificationType.SUCCESS:
      return 'green';
    case NotificationType.WARNING:
      return 'yellow';
    case NotificationType.ERROR:
      return 'red';
    case NotificationType.ALERT:
      return 'red';
    case NotificationType.SYNC_STATUS:
      return 'purple';
    case NotificationType.SYSTEM:
      return 'gray';
    default:
      return 'blue';
  }
}

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

// Individual notification item
function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead, clearNotification } = useNotifications();
  const colorScheme = getColorScheme(notification.type);
  const IconComponent = getNotificationIcon(notification.type);
  
  // Handle mark as read
  const handleMarkAsRead = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification._id);
  }, [markAsRead, notification._id]);
  
  // Handle clear
  const handleClear = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearNotification(notification._id);
  }, [clearNotification, notification._id]);
  
  const NotificationContent = (
    <Box
      px={4}
      py={3}
      _hover={{ bg: 'blackAlpha.50' }}
      cursor={notification.link ? 'pointer' : 'default'}
      bg={!notification.read ? `${colorScheme}.50` : undefined}
      borderLeft={!notification.read ? '3px solid' : undefined}
      borderColor={!notification.read ? `${colorScheme}.500` : undefined}
      width="full"
      onClick={!notification.read ? () => markAsRead(notification._id) : undefined}
    >
      <HStack spacing={3} align="flex-start">
        <Icon as={IconComponent} boxSize={5} color={`${colorScheme}.500`} mt={1} />
        
        <VStack align="flex-start" spacing={1} flex={1}>
          <Text fontWeight={!notification.read ? 'bold' : 'medium'} fontSize="sm" noOfLines={1}>
            {notification.title}
          </Text>
          
          <Text fontSize="xs" color="gray.600" noOfLines={2}>
            {notification.message}
          </Text>
          
          <HStack justify="space-between" width="full">
            <Text fontSize="xs" color="gray.500">
              {formatRelativeTime(notification.createdAt)}
            </Text>
            
            <HStack spacing={1}>
              {!notification.read && (
                <IconButton
                  aria-label="Mark as read"
                  icon={<CheckIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={handleMarkAsRead}
                />
              )}
              
              <IconButton
                aria-label="Clear notification"
                icon={<CloseIcon />}
                size="xs"
                variant="ghost"
                onClick={handleClear}
              />
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
  
  // Wrap in Link if notification has a link
  if (notification.link) {
    return (
      <Link
        as={NextLink}
        href={notification.link}
        _hover={{ textDecoration: 'none' }}
        onClick={() => {
          if (!notification.read) {
            markAsRead(notification._id);
          }
          if (onClose) {
            onClose();
          }
        }}
        width="full"
      >
        {NotificationContent}
      </Link>
    );
  }
  
  return NotificationContent;
}

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onClose?: () => void;
}

export function NotificationList({ 
  notifications, 
  isLoading, 
  onClose 
}: NotificationListProps) {
  // Loading state
  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner />
      </Center>
    );
  }
  
  // Empty state
  if (notifications.length === 0) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        py={10} 
        px={6} 
        textAlign="center"
      >
        <Icon as={InfoIcon} boxSize={10} color="gray.400" mb={3} />
        <Text color="gray.500">No notifications yet</Text>
        <Text fontSize="sm" color="gray.400">
          New notifications will appear here
        </Text>
      </Flex>
    );
  }
  
  return (
    <VStack spacing={0} divider={<Divider />} width="full">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification._id} 
          notification={notification} 
          onClose={onClose}
        />
      ))}
    </VStack>
  );
}