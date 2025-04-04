'use client';

// This is a simplified version of the home page that you can use
// Copy this to src/app/page.tsx on your machine to fix the Internal Server Error

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
  ThemeIcon,
  useMantineTheme
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

export default function Home() {
  const router = useRouter();
  const theme = useMantineTheme();
  
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
        sx={{
          position: 'relative',
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[8] 
            : theme.fn.linearGradient(45, theme.colors.blue[0], theme.colors.cyan[0]),
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: `${theme.spacing.xl * 2}px 0`
        }}
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
                      color="blue"
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
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: theme.colors.blue[6] }}>
                FLUXORI
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box
        py={100}
        sx={{
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[7] 
            : theme.white,
        }}
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
      
      {/* CTA Section */}
      <Box
        py={100}
        sx={{
          background: theme.colorScheme === 'dark' 
            ? theme.fn.linearGradient(45, theme.colors.dark[6], theme.colors.dark[8])
            : theme.fn.linearGradient(45, theme.colors.blue[6], theme.colors.cyan[6]),
          color: 'white',
        }}
      >
        <Container size="md" style={{ textAlign: 'center' }}>
          <Title order={2} mb="xl" color="white">
            Ready to streamline your inventory management?
          </Title>
          
          <Text size="lg" mb="xl" sx={{ opacity: 0.9 }}>
            Start managing your inventory efficiently today. No credit card required.
          </Text>
          
          <Group position="center">
            <Button
              size="xl"
              color={theme.colorScheme === 'dark' ? 'gray' : 'white'}
              sx={{ 
                color: theme.colors.blue[7], 
                padding: '0 48px',
                height: 54,
              }}
              onClick={() => router.push('/register')}
            >
              Get Started Now
            </Button>
          </Group>
        </Container>
      </Box>
    </main>
  );
}