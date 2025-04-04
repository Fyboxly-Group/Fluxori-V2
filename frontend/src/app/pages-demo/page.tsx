'use client';

import React from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function SimpleDemo() {
  const router = useRouter();
  
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Fluxori V2 Demo Page</Title>
      <Text mb="xl">This is a simple demo page to help you navigate the application without errors.</Text>
      
      <Title order={2} mb="md">Available Pages:</Title>
      <Group mb="xl">
        <Button onClick={() => router.push('/buybox')}>Buy Box Dashboard</Button>
        <Button onClick={() => router.push('/reports')}>Reports</Button>
        <Button onClick={() => router.push('/orders/1')}>Sample Order</Button>
      </Group>
      
      <Text>
        These pages use mock data and should work without the backend server.
      </Text>
    </Container>
  );
}