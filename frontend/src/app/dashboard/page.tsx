"use client";

import React from 'react';
import { Box, Heading, Text, Grid, GridItem, Flex, Card, CardHeader, CardBody } from '@/utils/chakra-compat';

export default function DashboardPage() {
  return (
    <Box p={4}>
      <Heading mb={6}>Dashboard</Heading>
      
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">Total Sales</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">$12,345</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">Orders</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">85</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">Customers</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">142</Text>
          </CardBody>
        </Card>
      </Grid>
      
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Sales Overview</Heading>
        </CardHeader>
        <CardBody>
          <Box height="200px" display="flex" alignItems="center" justifyContent="center">
            <Text>Chart placeholder - removed recharts dependency</Text>
          </Box>
        </CardBody>
      </Card>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Recent Orders</Heading>
          </CardHeader>
          <CardBody>
            <Text>Order data would go here</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <Heading size="md">Inventory Status</Heading>
          </CardHeader>
          <CardBody>
            <Text>Inventory data would go here</Text>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
}