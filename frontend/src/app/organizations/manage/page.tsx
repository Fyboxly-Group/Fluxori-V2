'use client'

import React, { useState } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  useColorModeValue
} from '@/utils/chakra-compat';
import { ChevronRight, Home, Building, Shield } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';
import CreateOrganizationForm from '@/components/organization/CreateOrganizationForm';
import OrganizationSettings from '@/components/organization/OrganizationSettings';
import RoleManagement from '@/components/organization/RoleManagement';
import MemberManagement from '@/components/organization/MemberManagement';
import OrganizationSwitcher from '@/components/organization/OrganizationSwitcher';
import { NextPage } from 'next';

const OrganizationManagePage: NextPage = () => {
  const { currentOrganization, isLoading } = useOrganization();
  const [tabIndex, setTabIndex] = useState(0);
  
  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const tabColorScheme = useColorModeValue('blue', 'blue');
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <Breadcrumb 
          spacing="8px" 
          separator={<ChevronRight size={16} />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <HStack>
                <Home size={16} />
                <Text>Home</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbItem>
            <BreadcrumbLink href="/organizations">
              <HStack>
                <Building size={16} />
                <Text>Organizations</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <Text>Manage</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={8}>
          <Heading as="h1" size="xl">
            Organization Management
          </Heading>
          
          <OrganizationSwitcher 
            showCreateOption={false}
            showManageOption={false}
          />
        </Box>
        
        <Tabs 
          colorScheme={tabColorScheme}
          index={tabIndex} 
          onChange={handleTabChange}
        >
          <TabList>
            <Tab>Settings</Tab>
            <Tab>Members</Tab>
            <Tab>Roles & Permissions</Tab>
            <Tab>Create Organization</Tab>
          </TabList>
          
          <TabPanels>
            {/* Organization Settings */}
            <TabPanel p={4}>
              {currentOrganization && (
                <OrganizationSettings organization={currentOrganization} />
              )}
            </TabPanel>
            
            {/* Member Management */}
            <TabPanel p={4}>
              {currentOrganization && (
                <MemberManagement organizationId={currentOrganization.id} />
              )}
            </TabPanel>
            
            {/* Role Management */}
            <TabPanel p={4}>
              <RoleManagement />
            </TabPanel>
            
            {/* Create Organization */}
            <TabPanel p={4}>
              <CreateOrganizationForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default OrganizationManagePage;