'use client';

import React, { useEffect, useRef } from 'react';
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
import LogoAnimation from '@/components/Animations/LogoAnimation';
import AnimatedButton from '@/components/Button/AnimatedButton';
import AnimatedCard from '@/components/Card/AnimatedCard';
import { 
  useAnimatedMount, 
  useStaggerAnimation, 
  useAnimateOnScroll,
  useTextReveal
} from '@/hooks/useAnimation';
import { revealText, scrollTrigger } from '@/animations/gsap';
import gsap from 'gsap';

export default function Home() {
  const router = useRouter();
  const theme = useMantineTheme();
  
  // Refs for animations
  const heroRef = useAnimatedMount('fadeInUp', { duration: 0.8 });
  const headingRef = useTextReveal({ delay: 0.5, duration: 0.8, stagger: 0.03 });
  const subHeadingRef = useTextReveal({ delay: 1.3, duration: 0.6, stagger: 0.02 });
  const cardsRef = useStaggerAnimation({ stagger: 0.1, delay: 1.8 });
  
  // Scroll animation sections
  const { ref: featuresSectionRef, isInView: featuresInView } = useAnimateOnScroll('fadeInUp');
  const { ref: featureCardsRef, isInView: featureCardsInView } = useAnimateOnScroll('fadeInUp');
  const { ref: ctaSectionRef, isInView: ctaInView } = useAnimateOnScroll('fadeInUp');
  
  // Parallax scroll effect
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!parallaxRef.current) return;
    
    // Create parallax effect with ScrollTrigger
    const element = parallaxRef.current;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5
      }
    });
    
    tl.fromTo(
      element.querySelector('.parallax-bg'),
      { y: '-20%' },
      { y: '20%', ease: 'none' }
    );
    
    return () => {
      // Clean up ScrollTrigger
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
    };
  }, []);
  
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
        ref={parallaxRef}
      >
        {/* Parallax Background */}
        <Box
          className="parallax-bg"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.5,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        
        <Container size="xl" ref={heroRef} style={{ position: 'relative', zIndex: 1 }}>
          <Grid>
            <Grid.Col md={6}>
              <Stack spacing="xl">
                <div>
                  <Title
                    order={1}
                    ref={headingRef}
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
                    ref={subHeadingRef}
                    color="dimmed"
                    mb="xl"
                  >
                    Streamline your operations with our powerful inventory management platform. 
                    Track stock, manage orders, and analyze performance in real-time.
                  </Text>
                  
                  <Group mt="xl">
                    <AnimatedButton 
                      size="lg"
                      color="brand"
                      onClick={() => router.push('/dashboard')}
                      sx={{ padding: '0 32px' }}
                    >
                      Get Started
                    </AnimatedButton>
                    
                    <AnimatedButton 
                      size="lg"
                      variant="outline"
                      onClick={() => router.push('/login')}
                      sx={{ padding: '0 32px' }}
                    >
                      Log In
                    </AnimatedButton>
                  </Group>
                </div>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoAnimation delay={0.5} />
            </Grid.Col>
          </Grid>
          
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              opacity: 0.7,
            }}
          >
            <IconArrowDown size={32} stroke={1.5} />
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box
        py={100}
        ref={featuresSectionRef}
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
              ref={featureCardsRef}
            >
              {features.map((feature, index) => (
                <AnimatedCard
                  key={index}
                  p="xl"
                  withBorder
                  radius="md"
                  shadow="sm"
                  entranceAnimation="fadeInUp"
                  animationDelay={index * 0.1}
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
                </AnimatedCard>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box
        py={100}
        ref={ctaSectionRef}
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
            <AnimatedButton
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
            </AnimatedButton>
          </Group>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box
        py={50}
        sx={{
          background: theme.colorScheme === 'dark' 
            ? theme.colors.dark[9] 
            : theme.colors.gray[0],
        }}
      >
        <Container size="xl">
          <Grid>
            <Grid.Col md={4}>
              <Stack spacing="xs">
                <Title order={4} mb="sm">
                  Fluxori
                </Title>
                <Text size="sm" color="dimmed">
                  Modern inventory management for growing businesses. Streamline operations and
                  improve efficiency with our cloud-based platform.
                </Text>
              </Stack>
            </Grid.Col>
            
            <Grid.Col md={8}>
              <Grid>
                <Grid.Col xs={6} md={4}>
                  <Stack spacing="xs">
                    <Title order={6} mb="sm">
                      Product
                    </Title>
                    <Text size="sm" color="dimmed">Features</Text>
                    <Text size="sm" color="dimmed">Pricing</Text>
                    <Text size="sm" color="dimmed">Integrations</Text>
                    <Text size="sm" color="dimmed">Changelog</Text>
                  </Stack>
                </Grid.Col>
                
                <Grid.Col xs={6} md={4}>
                  <Stack spacing="xs">
                    <Title order={6} mb="sm">
                      Resources
                    </Title>
                    <Text size="sm" color="dimmed">Documentation</Text>
                    <Text size="sm" color="dimmed">Tutorials</Text>
                    <Text size="sm" color="dimmed">Blog</Text>
                    <Text size="sm" color="dimmed">API Reference</Text>
                  </Stack>
                </Grid.Col>
                
                <Grid.Col xs={6} md={4}>
                  <Stack spacing="xs">
                    <Title order={6} mb="sm">
                      Company
                    </Title>
                    <Text size="sm" color="dimmed">About Us</Text>
                    <Text size="sm" color="dimmed">Contact</Text>
                    <Text size="sm" color="dimmed">Careers</Text>
                    <Text size="sm" color="dimmed">Legal</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
          
          <Box mt={50}>
            <Text size="sm" color="dimmed" align="center">
              © {new Date().getFullYear()} Fluxori. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </main>
  );
}