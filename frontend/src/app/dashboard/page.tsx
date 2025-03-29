'use client'

import { Heading } from '@chakra-ui/react/heading'
import { Text } from '@chakra-ui/react/text'
import { Grid, GridItem } from '@chakra-ui/react/grid'
import { Card, CardBody, CardHeader } from '@chakra-ui/react/card'
import { Box } from '@chakra-ui/react/box'
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react/stat'
import { useColorMode } from '@chakra-ui/react/color-mode'

export default function Dashboard() {
  const { colorMode } = useColorMode()
  
  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>Dashboard</Heading>
      <Text fontSize="lg" mb={8} color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
        Welcome to your Fluxori dashboard. Here's an overview of your key metrics.
      </Text>
      
      <Grid 
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        gap={6}
        mb={8}
      >
        {/* Stats cards */}
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Projects</StatLabel>
                <StatNumber>12</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  23.36%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Users</StatLabel>
                <StatNumber>45</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  9.05%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber>78%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.67%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Storage Used</StatLabel>
                <StatNumber>432 GB</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  3.19%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Grid 
        templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
        gap={6}
      >
        {/* Activity card */}
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Recent Activity</Heading>
            </CardHeader>
            <CardBody>
              <Text>Project "Marketing Campaign" was updated 2 hours ago</Text>
              <Text mt={2}>User "John Doe" joined the workspace yesterday</Text>
              <Text mt={2}>3 tasks were completed in "Website Redesign" project</Text>
              <Text mt={2}>New comments on "Customer Feedback" document</Text>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Performance card */}
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">System Performance</Heading>
            </CardHeader>
            <CardBody>
              <Text>API Response Time: 42ms (avg)</Text>
              <Text mt={2}>Frontend Load Time: 0.8s</Text>
              <Text mt={2}>Database Queries: 1.2k/min</Text>
              <Text mt={2}>System Status: Operational</Text>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}