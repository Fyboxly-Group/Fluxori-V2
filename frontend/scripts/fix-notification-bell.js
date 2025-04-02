const fs = require('fs');
const path = require('path');

console.log('🚀 Starting NotificationBell fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/notifications/components/NotificationBell.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `/**
 * Notification Bell Component
 * Displays notification count and popover with notifications
 */

import React, { useState } from 'react';
import { IconButton } from '@chakra-ui/react/button';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Badge } from '@chakra-ui/react/badge';
import { Popover } from '@chakra-ui/react/popover';
import { PopoverTrigger } from '@chakra-ui/react/popover';
import { PopoverContent } from '@chakra-ui/react/popover';
import { PopoverHeader } from '@chakra-ui/react/popover';
import { PopoverBody } from '@chakra-ui/react/popover';
import { PopoverFooter } from '@chakra-ui/react/popover';
import { PopoverArrow } from '@chakra-ui/react/popover';
import { PopoverCloseButton } from '@chakra-ui/react/popover';
import { HStack } from '@chakra-ui/react/stack';
import { Button } from '@chakra-ui/react/button';
import { ButtonGroup } from '@chakra-ui/react/button';
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
  const displayCount = unreadCount > maxDisplayCount ? \`\${maxDisplayCount}+\` : unreadCount;
  
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
      open={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={18} />}
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
            loading={loading}
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

export default NotificationBell;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/notifications/components/NotificationBell.tsx');
} catch (error) {
  console.error('❌ Error fixing NotificationBell.tsx:', error);
}

console.log('✅ All fixes applied');