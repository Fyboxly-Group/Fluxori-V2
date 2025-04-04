'use client';

import React from 'react';
import { 
  Container, 
  Grid, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Button, 
  Box, 
  Card, 
  SimpleGrid,
  ThemeIcon
} from '@mantine/core';
import { 
  IconRocket, 
  IconPackage, 
  IconTruck, 
  IconChartBar, 
  IconArrowDown, 
  IconDeviceAnalytics, 
  IconBuildingStore, 
  IconSettings
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

// Simple version without complex animations
export default function Home() {
  const router = useRouter();
  
  // Features data
  const features = [
    {
      title: 'Inventory Management',
      description: 'Track and manage your inventory across multiple warehouses with real-time updates.',
      icon: IconPackage,
      color: 'blue'
    },
    {
      title: 'Order Processing',
      description: 'Streamline your order fulfillment process with automated workflows and tracking.',
      icon: IconBuildingStore,
      color: 'green'
    },
    {
      title: 'Shipment Tracking',
      description: 'Monitor shipments in real-time with comprehensive tracking and alerts.',
      icon: IconTruck,
      color: 'violet'
    },
    {
      title: 'Advanced Analytics',
      description: 'Gain insights into your business performance with detailed reports and dashboards.',
      icon: IconChartBar,
      color: 'orange'
    },
    {
      title: 'Marketplace Integration',
      description: 'Seamlessly connect with major marketplaces to synchronize inventory and orders.',
      icon: IconDeviceAnalytics,
      color: 'pink'
    },
    {
      title: 'Customizable Workflows',
      description: 'Configure the system to match your unique business processes and requirements.',
      icon: IconSettings,
      color: 'cyan'
    }
  ];
  
  return (
    <main>
      {/* Hero Section */}
      <Box
        sx={(theme) => ({
          position: 'relative',
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[8] 
            : theme.fn.linearGradient(45, theme.colors.blue[0], theme.colors.cyan[0]),
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: `${theme.spacing.xl * 2}px 0`
        })}
      >
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Grid>
            <Grid.Col md={6}>
              <Stack spacing="xl">
                <div>
                  <Title
                    order={1}
                    sx={(theme) => ({
                      fontSize: '3rem',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      marginBottom: theme.spacing.md,
                      [theme.fn.smallerThan('sm')]: {
                        fontSize: '2.5rem',
                      },
                    })}
                  >
                    Modern Inventory Management for Growing Businesses
                  </Title>
                  
                  <Text
                    size="xl"
                    color="dimmed"
                    mb="xl"
                  >
                    Streamline your operations with our powerful inventory management platform. 
                    Track stock, manage orders, and analyze performance in real-time.
                  </Text>
                  
                  <Group mt="xl">
                    <Button 
                      size="lg"
                      onClick={() => router.push('/dashboard')}
                      sx={{ padding: '0 32px' }}
                    >
                      Get Started
                    </Button>
                    
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => router.push('/login')}
                      sx={{ padding: '0 32px' }}
                    >
                      Log In
                    </Button>
                  </Group>
                </div>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                fontSize: '5rem', 
                fontWeight: 'bold', 
                color: '#228be6',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                FLUXORI
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box
        py={100}
        sx={(theme) => ({
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[7] 
            : theme.white,
        })}
      >
        <Container size="xl">
          <Stack spacing={50}>
            <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
              <Title order={2} mb="md">
                Everything you need to manage your inventory
              </Title>
              <Text size="lg" color="dimmed">
                Fluxori provides a comprehensive set of tools to help you track, manage, 
                and optimize your inventory across multiple sales channels.
              </Text>
            </div>
            
            <SimpleGrid
              cols={3}
              spacing="xl"
              breakpoints={[
                { maxWidth: 'md', cols: 2 },
                { maxWidth: 'xs', cols: 1 },
              ]}
            >
              {features.map((feature, index) => (
                <Card
                  key={index}
                  p="xl"
                  withBorder
                  radius="md"
                  shadow="sm"
                >
                  <ThemeIcon
                    size={60}
                    radius="md"
                    variant="light"
                    color={feature.color}
                    mb="md"
                  >
                    <feature.icon size={28} />
                  </ThemeIcon>
                  
                  <Text size="lg" weight={500} mb="xs">
                    {feature.title}
                  </Text>
                  
                  <Text size="sm" color="dimmed">
                    {feature.description}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
      
      {/* Navigation Section */}
      <Box
        py={50}
        sx={(theme) => ({
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[8]
            : theme.fn.linearGradient(45, theme.colors.blue[1], theme.colors.cyan[1]),
        })}
      >
        <Container size="lg">
          <Title order={3} mb="lg" align="center">Explore Demo Pages</Title>
          <SimpleGrid cols={3} spacing="md" breakpoints={[{ maxWidth: 'xs', cols: 1 }]}>
            <Button size="lg" onClick={() => router.push('/buybox')}>
              BuyBox Dashboard
            </Button>
            <Button size="lg" onClick={() => router.push('/reports')}>
              Reports
            </Button>
            <Button size="lg" onClick={() => router.push('/orders/1')}>
              Sample Order
            </Button>
          </SimpleGrid>
          <Text size="sm" mt="md" align="center" color="dimmed">
            These pages use mock data and should work without the backend server
          </Text>
        </Container>
      </Box>
    </main>
  );
}