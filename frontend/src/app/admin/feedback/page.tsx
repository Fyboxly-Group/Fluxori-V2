/// <reference path="../../../types/user.d.ts" />
'use client'

import { Box, Container, Flex, Heading, Select, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@/utils/chakra-compat';
import React, { useState } from 'react';
import { FeedbackList, FeedbackAnalytics } from '@/features/feedback';
import { useAuth } from '@/context/AuthContext';

export default function FeedbackAdminPage() {
  const { user } = useAuth();
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  
  // Mock organizations for demo - in real app this would come from API
  const organizations = [
    { id: 'org1', name: 'Acme Corp' },
    { id: 'org2', name: 'Globex Industries' },
    { id: 'org3', name: 'Initech' }
  ];
  
  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={2}>
            Access Denied
          </Heading>
          <Text color="gray.500">
            You don't have permission to access this page. Please contact an administrator.
          </Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex align="center" mb={6}>
        <Heading size="lg">Feedback Management</Heading>
        <Spacer   />
        <Select
          value={selectedOrganization}
          onChange={(e: any) => setSelectedOrganization(e.target.value)}
          width="250px"
        >
          <option value="all">All Organizations</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </Select>
      </Flex>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Feedback Items</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <FeedbackList
              isAdmin={true}
              organizationId={selectedOrganization === 'all' ? undefined : selectedOrganization}
            />
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <FeedbackAnalytics
              organizationId={selectedOrganization === 'all' ? undefined : selectedOrganization}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}