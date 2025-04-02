#!/usr/bin/env node

/**
 * Fix High Priority Components
 * 
 * This script fixes multiple high-priority components with TypeScript errors
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

// List of components to fix with their implementations
const COMPONENTS_TO_FIX = [
  {
    name: 'FloatingChatButton',
    path: 'src/features/ai-cs-agent/components/FloatingChatButton.tsx',
    implementation: `'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@chakra-ui/react/box';
import { Portal } from '@chakra-ui/react/portal';
import { IconButton } from '@chakra-ui/react/button';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { AIChatInterface } from './AIChatInterface';

// Chat icon component
const ChatIcon = () => (
  <Box p="1" borderRadius="full">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </Box>
);

// Close icon component
const CloseIcon = () => (
  <Box p="1" borderRadius="full">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </Box>
);

interface FloatingChatButtonProps {
  userId: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  zIndex?: number;
  chatWidth?: string;
  chatHeight?: string;
  organizationId?: string;
  initialConversationId?: string;
}

export function FloatingChatButton({
  userId,
  position = 'bottom-right',
  size = 'md',
  zIndex = 100,
  chatWidth = '350px',
  chatHeight = '600px',
  organizationId,
  initialConversationId
}: FloatingChatButtonProps) {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Define position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default:
        return { bottom: '20px', right: '20px' };
    }
  };
  
  // Define chat position based on the position prop
  const getChatPosition = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '80px', right: '20px' };
      case 'bottom-left':
        return { bottom: '80px', left: '20px' };
      case 'top-right':
        return { top: '80px', right: '20px' };
      case 'top-left':
        return { top: '80px', left: '20px' };
      default:
        return { bottom: '80px', right: '20px' };
    }
  };
  
  // Size mapping for different button sizes
  const sizeMapping = {
    sm: { buttonSize: '40px', iconSize: '16px' },
    md: { buttonSize: '50px', iconSize: '20px' },
    lg: { buttonSize: '60px', iconSize: '24px' }
  };
  
  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.ai-chat-container')
      ) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle escalation
  const handleEscalation = (reason: string, conversationId: string) => {
    console.log(\`Conversation \${conversationId} escalated: \${reason}\`);
    // In a real app, you might want to notify a human agent or show a notification
  };
  
  return (
    <>
      {/* Floating Button */}
      <Box
        position="fixed"
        {...getPositionStyles()}
        zIndex={zIndex}
      >
        <IconButton
          ref={buttonRef}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          icon={isOpen ? <CloseIcon /> : <ChatIcon />}
          onClick={onToggle}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          width={sizeMapping[size].buttonSize}
          height={sizeMapping[size].buttonSize}
          fontSize={sizeMapping[size].iconSize}
        />
      </Box>
      
      {/* Chat Interface Portal */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="ai-chat-container"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'fixed',
                ...getChatPosition(),
                zIndex: zIndex - 1,
                width: chatWidth,
                height: chatHeight,
                maxHeight: '80vh',
                boxShadow: colorMode === 'light'
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <AIChatInterface
                userId={userId}
                height="100%"
                width="100%"
                useWebSocket={true}
                onEscalation={handleEscalation}
                title="Customer Support"
                welcomeMessage="👋 Hi there! How can I help you today?"
                organizationId={organizationId}
                initialConversationId={initialConversationId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}`,
  },
  {
    name: 'NotificationList',
    path: 'src/features/notifications/components/NotificationList.tsx',
    implementation: `'use client';

import React, { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { Badge } from '@chakra-ui/react/badge';
import { Divider } from '@chakra-ui/react/divider';
import { List, ListItem } from '@chakra-ui/react/list';
import { Spinner } from '@chakra-ui/react/spinner';
import { Flex } from '@chakra-ui/react/flex';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { IconButton } from '@chakra-ui/react/button';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Bell, X, Settings, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification, NotificationType } from '../types/notification.types';

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
      return \`\${diffMins} min\${diffMins !== 1 ? 's' : ''} ago\`;
    }
    if (diffHours < 24) {
      return \`\${diffHours} hour\${diffHours !== 1 ? 's' : ''} ago\`;
    }
    if (diffDays < 7) {
      return \`\${diffDays} day\${diffDays !== 1 ? 's' : ''} ago\`;
    }
    
    return date.toLocaleDateString();
  };
  
  // Get icon for notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <AlertTriangle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };
  
  // Get color for notification type
  const getColorScheme = (type: NotificationType) => {
    switch (type) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'success': return 'green';
      case 'error': return 'red';
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
        
        <HStack spacing={1}>
          {showClearAll && notifications.length > 0 && (
            <IconButton
              aria-label="Mark all as read"
              icon={<CheckCircle size={14} />}
              size="xs"
              variant="ghost"
              onClick={() => markAllAsRead()}
            />
          )}
          
          {showSettings && (
            <IconButton
              aria-label="Notification settings"
              icon={<Settings size={14} />}
              size="xs"
              variant="ghost"
              onClick={onSettingsClick}
            />
          )}
        </HStack>
      </Flex>
      
      <Divider mb={2} />
      
      {/* Loading state */}
      {loading && (
        <Box py={4} textAlign="center">
          <Spinner size="sm" />
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
        <List spacing={1}>
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
                      icon={<X size={12} />}
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
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
          {expanded ? 'Show Less' : \`Show More (\${notifications.length - maxItems})\`}
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
}`,
  },
];

// Function to fix a component
function fixComponent(componentInfo) {
  console.log(`🔍 Fixing ${componentInfo.name} component...`);
  
  const filePath = path.join(ROOT_DIR, componentInfo.path);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, componentInfo.implementation, { mode: 0o644 });
      console.log(`✅ Fixed ${path.relative(ROOT_DIR, filePath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing to ${filePath}:`, error.message);
      return false;
    }
  } else {
    console.warn(`⚠️ File does not exist: ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('🚀 Starting high priority component fix script');
    
    let fixedCount = 0;
    
    for (const component of COMPONENTS_TO_FIX) {
      if (fixComponent(component)) {
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} out of ${COMPONENTS_TO_FIX.length} components`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();