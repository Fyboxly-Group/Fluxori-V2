/// <reference path="../../types/module-declarations.d.ts" />
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../utils/chakra-utils';
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../utils/chakra-utils';
'use client';

import React, { useState, useEffect } from 'react';
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
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
;

// Fix for Next.js module resolution
import { ChakraProvider } from "@chakra-ui/react";
import { Box, Flex, VStack, Stack, Heading, Text, Button, Card, CardBody, Image, useColorMode, Link as ChakraLink } from '@/utils/chakra/components';



export default function Home() {
  const { colorMode } = useColorMode();
  const [loaded, setLoaded] = useState(false);
  
  // Simulate loading state
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 1500);
  }, []);
  
  const features = [
    {
      title: 'Inventory Management',
      description: 'Track and manage your inventory across multiple warehouses and locations.',
      image: 'https://via.placeholder.com/300',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Gain insights into your business with powerful analytics and reporting tools.',
      image: 'https://via.placeholder.com/300',
    },
    {
      title: 'Customer Management',
      description: 'Manage your customers and their orders in one centralized platform.',
      image: 'https://via.placeholder.com/300',
    },
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg={colorMode === 'light' ? 'blue.50' : 'blue.900'} 
        py={20}
      >
        <Box maxW="1200px" mx="auto" px={6}>
          <Flex
            direction={{
            base: 'column',
            md: 'row'
          } as any}
            align="center"
            justify="space-between"
            gap={10}
          >
            <VStack align="flex-start" gap={6} maxW="600px">
              <Heading size="2xl">
                Streamline Your Business Operations
              </Heading>
              <Text fontSize="xl" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                An all-in-one platform for managing inventory, customers, and analytics
                to help your business grow.
              </Text>
              <Link href="/dashboard" passHref>
                <Button 
                  size="lg" 
                  colorScheme="blue" 
                  rightIcon={<ArrowRight />}
                >
                  Get Started
                </Button>
              </Link>
            </VStack>
            
            <Box 
              boxSize={{ base: '300px', md: '400px', lg: '500px' }}
              display={loaded ? 'block' : 'none'}
            >
              <Image 
                src="https://via.placeholder.com/500" 
                alt="Platform preview" 
                borderRadius="md"
                shadow="xl"
               />
            </Box>
          </Flex>
        </Box>
      </Box>
      
      {/* Features Section */}
      <Box py={20} maxW="1200px" mx="auto" px={6}>
        <VStack gap={16}>
          <VStack gap={4} textAlign="center" maxW="800px">
            <Heading>Key Features</Heading>
            <Text fontSize="lg" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              Our platform provides everything you need to manage your business efficiently.
            </Text>
          </VStack>
          
          <Stack direction={{
            base: 'column',
            md: 'row'
          } as any} gap={8} align="stretch">
            {features.map((feature, index) => (
              <Card key={index} width="100%">
                <CardBody>
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    borderRadius="md" 
                    mb={4}
                   />
                  <Heading size="md" mb={2}>{feature.title}</Heading>
                  <Text>{feature.description}</Text>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </VStack>
      </Box>
      
      {/* CTA Section */}
      <Box 
        bg={colorMode === 'light' ? 'gray.100' : 'gray.800'} 
        py={16}
      >
        <Box maxW="1200px" mx="auto" px={6} textAlign="center">
          <VStack gap={6}>
            <Heading>Ready to get started?</Heading>
            <Text fontSize="lg" maxW="600px">
              Join thousands of businesses already using our platform to streamline their operations.
            </Text>
            <Link href="/dashboard" passHref>
              <Button 
                size="lg" 
                colorScheme="blue" 
                rightIcon={<ArrowRight />}
              >
                Get Started Now
              </Button>
            </Link>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}