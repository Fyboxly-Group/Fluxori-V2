'use client';

import { useState } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Card, CardHeader, CardBody } from '@chakra-ui/react/card';
import { Button } from '@chakra-ui/react/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react/tabs';
import { Switch } from '@chakra-ui/react/switch';
import { FormControl, FormLabel } from '@chakra-ui/react/form-control';
import { Grid, GridItem } from '@chakra-ui/react/grid';
import { VStack, HStack } from '@chakra-ui/react/stack';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react/alert';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { createToaster } from '@chakra-ui/react/toast';

import { AIChatInterface } from './AIChatInterface';
import { ConversationList } from './ConversationList';

/**
 * Demo component to showcase the AI Customer Service Agent features
 */
export function AICustomerServiceDemo() {
  const { colorMode } = useColorMode();
  const toast = createToaster();
  
  // State
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [useWebSocket, setUseWebSocket] = useState(true);
  const [escalationInfo, setEscalationInfo] = useState<{
    isEscalated: boolean;
    reason: string;
    conversationId: string;
  } | null>(null);
  
  // Handle escalation
  const handleEscalation = (reason: string, conversationId: string) => {
    setEscalationInfo({
      isEscalated: true,
      reason,
      conversationId
    });
    
    toast.show({
      title: 'Conversation Escalated',
      description: reason,
      status: 'warning',
      duration: 10000,
      isClosable: true
    });
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };
  
  // Handle WebSocket toggle
  const handleWebSocketToggle = () => {
    setUseWebSocket(!useWebSocket);
  };
  
  // Handle starting a new conversation
  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
    setEscalationInfo(null);
  };
  
  return (
    <Card width="100%" height="100%" overflow="hidden">
      <CardHeader bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}>
        <HStack justifyContent="space-between">
          <Heading size="md">AI Customer Service Demo</Heading>
          <Button size="sm" onClick={handleNewConversation}>New Conversation</Button>
        </HStack>
      </CardHeader>
      
      <CardBody p={4}>
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={4} height="100%">
          {/* Sidebar with conversation list and settings */}
          <GridItem>
            <VStack align="stretch" height="100%" spacing={6}>
              {/* Settings section */}
              <Card variant="outline">
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Heading size="sm">Settings</Heading>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="websocket-toggle" mb="0" fontSize="sm">
                        Use WebSocket (streaming)
                      </FormLabel>
                      <Switch
                        id="websocket-toggle"
                        colorScheme="blue"
                        isChecked={useWebSocket}
                        onChange={handleWebSocketToggle}
                      />
                    </FormControl>
                    
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                      {useWebSocket
                        ? 'Using WebSocket for real-time responses'
                        : 'Using REST API for standard responses'}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              
              {/* Escalation info */}
              {escalationInfo && escalationInfo.isEscalated && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Escalation Required</AlertTitle>
                    <AlertDescription fontSize="sm">
                      {escalationInfo.reason}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {/* Conversation list */}
              <Box flex="1" overflow="auto">
                <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                  <TabList>
                    <Tab>Active</Tab>
                    <Tab>Escalated</Tab>
                    <Tab>Closed</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel px={0} py={4}>
                      <ConversationList
                        onSelectConversation={handleSelectConversation}
                        selectedConversationId={selectedConversationId}
                        status="active"
                      />
                    </TabPanel>
                    <TabPanel px={0} py={4}>
                      <ConversationList
                        onSelectConversation={handleSelectConversation}
                        selectedConversationId={selectedConversationId}
                        status="escalated"
                      />
                    </TabPanel>
                    <TabPanel px={0} py={4}>
                      <ConversationList
                        onSelectConversation={handleSelectConversation}
                        selectedConversationId={selectedConversationId}
                        status="closed"
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </GridItem>
          
          {/* Main chat interface */}
          <GridItem>
            <Box height="100%">
              <AIChatInterface
                userId="demo-user-id" // In a real app, get this from auth context
                initialConversationId={selectedConversationId}
                useWebSocket={useWebSocket}
                height="600px"
                onEscalation={handleEscalation}
              />
            </Box>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
}