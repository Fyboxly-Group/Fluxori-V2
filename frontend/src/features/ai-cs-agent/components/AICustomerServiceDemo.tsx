/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React, { useState, useEffect } from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Grid  } from '@/utils/chakra-compat';
import { GridItem  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { FormControl  } from '@/utils/chakra-compat';
import { FormLabel  } from '@/utils/chakra-compat';
import { Switch  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { AIChatInterface } from './AIChatInterface';
import { ChatHistory } from './ChatHistory';
import { ResponsiveValue } from '@/utils/chakra-utils';

// Mock createToaster function until proper implementation is available

//  function until proper implementation is available
const createToaster = () => {
  return {
    show: (options: any) => {
      console.log('Toast:', options);
    }
  };
};
;;
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

import { ConversationList } from './ConversationList';
import { Alert  } from '@/utils/chakra-compat';
import { Tabs  } from '@/utils/chakra-compat';
import { Tab  } from '@/utils/chakra-compat';
import { AlertIcon  } from '@/utils/chakra-compat';
import { AlertTitle  } from '@/utils/chakra-compat';
import { AlertDescription  } from '@/utils/chakra-compat';
import { TabList  } from '@/utils/chakra-compat';
import { TabPanels  } from '@/utils/chakra-compat';
import { TabPanel  } from '@/utils/chakra-compat';

interface AICustomerServiceDemoProps {}

/**
 * Demo component to showcase the AI Customer Service Agent features
 */
export function AICustomerServiceDemo() {
  const { colorMode } = useColorMode();
  const toast = createToasterFallback();
  
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
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' } as ResponsiveValue<string>} gap={4} height="100%">
          {/* Sidebar with conversation list and settings */}
          <GridItem>
            <VStack align="stretch" height="100%" gap={6}>
              {/* Settings section */}
              <Card variant="outline">
                <CardBody>
                  <VStack align="start" gap={4}>
                    <Heading size="sm">Settings</Heading>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="websocket-toggle" mb="0" fontSize="sm">
                        Use WebSocket (streaming)
                      </FormLabel>
                      <Switch
                        id="websocket-toggle"
                        colorScheme="blue"
                        checked={useWebSocket}
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
                  <AlertIcon   />
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