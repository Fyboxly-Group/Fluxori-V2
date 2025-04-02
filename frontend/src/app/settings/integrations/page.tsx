/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React, { useState } from 'react';
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
;
;
;
;
;
import { ConnectionList } from '@/features/connections/components/ConnectionList';
import { ConnectionForm } from '@/features/connections/components/ConnectionForm';

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box, Heading, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, useToast } from '@/utils/chakra/components';



// Mock data
const mockConnections = [
  {
    id: '1',
    name: 'API Connection',
    type: 'api',
    apiKey: 'sk_test_12345',
    url: 'https://api.example.com',
  },
  {
    id: '2',
    name: 'Database Connection',
    type: 'database',
    apiKey: '',
    url: 'postgres://user:password@localhost:5432/db',
  }
];

export default function IntegrationsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connections, setConnections] = useState(mockConnections);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const toast = useToast();
  
  const handleAddClick = () => {
    setSelectedConnection(null);
    onOpen();
  };
  
  const handleEditClick = (connection: any) => {
    setSelectedConnection(connection);
    onOpen();
  };
  
  const handleDeleteClick = async (connection: any) => {
    // In a real app, you would call an API to delete the connection
    
    // Update local state
    setConnections(prev => prev.filter(c => c.id !== connection.id));
    
    // Show toast
    toast({
      title: 'Connection deleted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleTestClick = async (connection: any) => {
    // In a real app, you would call an API to test the connection
    
    // Show toast
    toast({
      title: 'Connection test successful',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleSubmit = async (connectionData: any) => {
    // In a real app, you would call an API to create/update the connection
    
    if (selectedConnection) {
      // Update existing connection
      setConnections(prev => 
        prev.map(c => c.id === selectedConnection.id 
          ? { ...c, ...connectionData }
          : c
        )
      );
    } else {
      // Create new connection
      const newConnection = {
        id: Date.now().toString(),
        ...connectionData,
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };
  
  return (
    <Box p={6}>
      <Heading mb={6}>Integrations</Heading>
      
      <Tabs>
        <TabList mb={6}>
          <Tab>Connections</Tab>
          <Tab>Webhooks</Tab>
          <Tab>API Keys</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <ConnectionList 
              connections={connections}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onTestClick={handleTestClick}
            />
          </TabPanel>
          
          <TabPanel>
            <VStack gap={4} align="stretch">
              <Text>Webhook configuration would appear here</Text>
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack gap={4} align="stretch">
              <Text>API keys management would appear here</Text>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Connection Form Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedConnection ? 'Edit Connection' : 'Add Connection'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ConnectionForm
              onClose={onClose}
              onSubmit={handleSubmit}
              connection={selectedConnection}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}