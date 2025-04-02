/**
 * Notification Demo Component
 * Demonstrates the notification system with test controls
 */
/// <reference path="../../types/module-declarations.d.ts" />


import React from 'react';
import { useState } from 'react';
import { Divider } from '@/utils/chakra-compat';;;
;
;
;
;
;
;
;
;
;
;
;
;
import { NotificationBell } from './NotificationBell';
import { NotificationCenter } from './NotificationCenter';
import { NotificationType, NotificationCategory } from '../api/notification.api';
import { useNotifications } from '../hooks/useNotifications';
import { VStack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { FormControl  } from '@/utils/chakra-compat';
import { FormLabel  } from '@/utils/chakra-compat';
import { Input  } from '@/utils/chakra-compat';
import { Textarea  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { CardFooter  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';

interface NotificationDemoProps {}

export function NotificationDemo() {
  // State for the test notification
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test notification message');
  const [type, setType] = useState<NotificationType>(NotificationType.INFO);
  const [category, setCategory] = useState<NotificationCategory>(NotificationCategory.SYSTEM);
  
  // Toast for feedback
  const toast = createToaster();
  
  // Create a test notification using the WebSocket connection
  const handleCreateNotification = () => {
    // In a real implementation, this would be handled by the backend
    // For demo purposes, we'll just show a toast
    toast.show({
      title: 'Notification Created',
      description: 'The notification would be sent via WebSocket in a real implementation.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    
    // In a real implementation, the backend would send the notification
    // via WebSocket, which would be picked up by the NotificationProvider
    // and displayed in the NotificationBell and NotificationCenter
  };

  return (
    <VStack gap={8} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Notification System Demo</Heading>
        <NotificationBell />
      </HStack>
      
      <HStack gap={6} align="flex-start">
        <Card flex="1">
          <CardHeader>
            <Heading size="md">Create Test Notification</Heading>
          </CardHeader>
          
          <CardBody>
            <VStack gap={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input 
                  value={title} 
                  onChange={(e: any) => setTitle(e.target.value)} 
                  placeholder="Notification title" 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea 
                  value={message} 
                  onChange={(e: any) => setMessage(e.target.value)} 
                  placeholder="Notification message" 
                  rows={3} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select 
                  value={type} 
                  onChange={(e: any) => setType(e.target.value as NotificationType)}
                >
                  {Object.values(NotificationType).map((value: any) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select 
                  value={category} 
                  onChange={(e: any) => setCategory(e.target.value as NotificationCategory)}
                >
                  {Object.values(NotificationCategory).map((value: any) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
          
          <CardFooter>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateNotification}
            >
              Create Notification
            </Button>
          </CardFooter>
        </Card>
        
        <Box flex="1">
          <Card mb={4}>
            <CardHeader>
              <Heading size="md">How It Works</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" gap={4}>
                <Text>
                  The notification system provides real-time updates from the backend via WebSockets.
                </Text>
                
                <Text>
                  <strong>Features:</strong>
                </Text>
                
                <VStack align="stretch" gap={2} pl={4}>
                  <Text>• Real-time notifications via WebSocket</Text>
                  <Text>• Notification bell with unread count</Text>
                  <Text>• Notification center for managing all notifications</Text>
                  <Text>• Toast notifications for immediate alerts</Text>
                  <Text>• Support for different notification types and categories</Text>
                  <Text>• Mark as read functionality</Text>
                  <Text>• Notification clearing</Text>
                </VStack>
                
                <Divider   />
                
                <Text fontSize="sm" color="gray.600">
                  Note: This demo showcases the UI components. In a real implementation, 
                  notifications would be pushed from the backend via WebSocket.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </HStack>
      
      <Box pt={4}>
        <Heading size="md" mb={4}>Notification Center</Heading>
        <NotificationCenter />
      </Box>
    </VStack>
  );
}