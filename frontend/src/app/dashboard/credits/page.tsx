'use client';
import React from 'react';
/// <reference path="../../../types/module-declarations.d.ts" />

/**
 * Credits Page
 * Page displaying credit balance, history, and packages
 */

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from '@/utils/chakra-compat'

import { CreditBalanceDisplay, CreditHistoryTable, CreditPackages } from '@/features/credits'

export default function CreditsPage() {
  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <VStack align="stretch" gap={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Credits & Billing
          </Heading>
          <Text color="gray.600">
            Manage your credits and view your transaction history
          </Text>
        </Box>
        
        <Card>
          <CardHeader>
            <HStack justifyContent="space-between">
              <Heading size="md">Current Balance</Heading>
              <CreditBalanceDisplay size="lg" showLabel={false} />
            </HStack>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Credits are used to perform various operations within Fluxori, such as AI-powered 
              customer service, automated inventory optimization, and data analysis. Monitor your 
              balance and purchase more credits when needed.
            </Text>
            <Button colorScheme="brand" size="md">
              Purchase Credits
            </Button>
          </CardBody>
        </Card>
        
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Transaction History</Tab>
            <Tab>Purchase Credits</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Credit Transaction History</Heading>
                </CardHeader>
                <CardBody>
                  <CreditHistoryTable />
                </CardBody>
              </Card>
            </TabPanel>
            
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Purchase Credits</Heading>
                </CardHeader>
                <CardBody>
                  <CreditPackages 
                    title="" 
                    description="Select a credit package below to enhance your Fluxori experience."
                  />
                </CardBody>
                <CardFooter>
                  <VStack align="stretch" width="100%" gap={4}>
                    <Divider   />
                    <Text fontSize="sm" color="gray.500">
                      Need a custom credits package? <Button variant="link" colorScheme="brand" size="sm">Contact Sales</Button>
                    </Text>
                  </VStack>
                </CardFooter>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}