/**
 * Notification Bell Component
 * Displays notification count and popover with notifications
 */
/// <reference path="../../types/module-declarations.d.ts" />


import React, { useState } from 'react';
import { IconButton  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Popover  } from '@/utils/chakra-compat';
import { PopoverTrigger  } from '@/utils/chakra-compat';
import { PopoverContent  } from '@/utils/chakra-compat';
import { PopoverHeader  } from '@/utils/chakra-compat';
import { PopoverBody  } from '@/utils/chakra-compat';
import { PopoverFooter  } from '@/utils/chakra-compat';
import { PopoverArrow  } from '@/utils/chakra-compat';
import { PopoverCloseButton } from '@/components/stubs/ChakraStubs';;
import { HStack  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { ButtonGroup  } from '@/utils/chakra-compat';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';

interface NotificationBellProps {
  maxDisplayCount?: number;
}

export function NotificationBell({ maxDisplayCount = 99 }: NotificationBellProps) {
  // State for popover
  const [isOpen, setIsOpen] = useState(false);
  
  // Notifications from context
  const { 
    unreadCount, 
    notifications, 
    loading, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotifications();
  
  // Display count calculation
  const displayCount = unreadCount > maxDisplayCount ? `${maxDisplayCount}+` : unreadCount;
  
  // Handle toggle popover
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  // Handle clear all notifications
  const handleClearAll = async () => {
    await clearAllNotifications();
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={18}  />}
            variant="ghost"
            onClick={handleToggle}
            size="md"
          />
          
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              px={1.5}
              py={0.5}
              borderRadius="full"
              bg="red.500"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              transform="scale(0.85)"
              textTransform="none"
            >
              {displayCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent width="350px" maxHeight="500px">
        <PopoverArrow />
        <PopoverCloseButton />
        
        <PopoverHeader fontWeight="semibold">
          <HStack justify="space-between">
            <Text>Notifications</Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={2}>
                {unreadCount} unread
              </Badge>
            )}
          </HStack>
        </PopoverHeader>
        
        <PopoverBody p={0} maxHeight="350px" overflowY="auto">
          <NotificationList
            notifications={notifications} 
            isLoading={loading}
            onClose={() => setIsOpen(false)}
          />
        </PopoverBody>
        
        <PopoverFooter>
          <ButtonGroup size="sm" width="full" justifyContent="space-between">
            <Button
              variant="ghost"
              disabled={unreadCount === 0}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              colorScheme="red"
              disabled={notifications.length === 0}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;