/**
 * Toast Notification Component
 * Shows a toast notification for real-time alerts
 */

import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { HStack } from '@chakra-ui/react/stack';
import { Text } from '@chakra-ui/react/text';
import { Icon } from '@chakra-ui/react/icon';
import { CloseButton } from '@chakra-ui/react/close-button';
import { createToaster } from '@chakra-ui/react/toast';
import { 
  CheckCircleIcon, 
  InfoIcon, 
  WarningIcon, 
  WarningTwoIcon 
} from '@chakra-ui/icons';
import { Notification, NotificationType } from '../api/notification.api';
import { useNotifications } from '../hooks/useNotifications';

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

// Map notification type to toast status
function getToastStatus(type: NotificationType): 'info' | 'success' | 'warning' | 'error' {
  switch (type) {
    case NotificationType.INFO:
      return 'info';
    case NotificationType.SUCCESS:
      return 'success';
    case NotificationType.WARNING:
      return 'warning';
    case NotificationType.ERROR:
      return 'error';
    case NotificationType.ALERT:
      return 'error';
    default:
      return 'info';
  }
}

// Custom toast component
export function CustomToast({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  const { markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const IconComponent = getNotificationIcon(notification.type);
  const status = getToastStatus(notification.type);
  
  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      markAsRead(notification._id);
    }, 300);
  };
  
  return (
    <Box
      bg={`${status}.50`}
      borderWidth="1px"
      borderColor={`${status}.300`}
      borderRadius="md"
      padding={3}
      boxShadow="sm"
      opacity={isVisible ? 1 : 0}
      transition="opacity 0.3s ease"
      overflow="hidden"
      _hover={{ boxShadow: 'md' }}
    >
      <HStack spacing={3} align="flex-start">
        <Icon as={IconComponent} color={`${status}.500`} boxSize={5} mt={1} />
        
        <Box flex="1">
          <Text fontWeight="semibold" fontSize="sm">{notification.title}</Text>
          <Text fontSize="xs" mt={1} color="gray.700">{notification.message}</Text>
        </Box>
        
        <CloseButton size="sm" onClick={handleClose} />
      </HStack>
    </Box>
  );
}

// Toast notification hook
export function useToastNotifications(showToasts = true) {
  const toast = createToaster();
  const { notifications } = useNotifications();
  
  // Show toast for new notifications
  useEffect(() => {
    if (!showToasts || notifications.length === 0) return;
    
    // Get the latest notification
    const latestNotification = notifications[0];
    
    // Show toast if it's unread
    if (!latestNotification.read) {
      toast.show({
        position: 'top-right',
        duration: 5000,
        isClosable: true,
        render: ({ onClose }: { onClose: () => void }) => (
          <CustomToast notification={latestNotification} onClose={onClose} />
        ),
      });
    }
  }, [notifications, toast, showToasts]);
  
  return null;
}