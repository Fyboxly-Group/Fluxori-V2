/// <reference path="../../types/module-declarations.d.ts" />
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../utils/chakra-utils';
import React, { useState, useEffect } from 'react';
import { ResponsiveValue, GridTemplateColumns } from '../../utils/chakra-utils';
import { Box  } from '@/utils/chakra-compat';
import { Grid  } from '@/utils/chakra-compat';
import { GridItem  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { ButtonGroup  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Stack  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { Table  } from '@/utils/chakra-compat';
import { Thead  } from '@/utils/chakra-compat';
import { Tbody  } from '@/utils/chakra-compat';
import { Tr  } from '@/utils/chakra-compat';
import { Th  } from '@/utils/chakra-compat';
import { Td  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Tabs  } from '@/utils/chakra-compat';
import { TabList  } from '@/utils/chakra-compat';
import { TabPanels  } from '@/utils/chakra-compat';
import { TabPanel  } from '@/utils/chakra-compat';
import { Tab  } from '@/utils/chakra-compat';
import { Alert  } from '@/utils/chakra-compat';
import { AlertIcon  } from '@/utils/chakra-compat';
import { AlertTitle  } from '@/utils/chakra-compat';
import { AlertDescription  } from '@/utils/chakra-compat';
import { 
  AlertCircle, 
  RefreshCw, 
  Calendar,
  Clock, 
  Users, 
  Code, 
  TrendingUp
} from 'lucide-react';

// Mock data for the dashboard
const mockErrorData = [
  { date: '2023-10-01', count: 12, categories: { api: 5, ui: 3, auth: 2, other: 2 } },
  { date: '2023-10-02', count: 8, categories: { api: 3, ui: 2, auth: 1, other: 2 } },
  { date: '2023-10-03', count: 15, categories: { api: 7, ui: 4, auth: 3, other: 1 } },
  { date: '2023-10-04', count: 6, categories: { api: 2, ui: 1, auth: 1, other: 2 } },
  { date: '2023-10-05', count: 9, categories: { api: 4, ui: 2, auth: 1, other: 2 } },
  { date: '2023-10-06', count: 14, categories: { api: 6, ui: 3, auth: 3, other: 2 } },
  { date: '2023-10-07', count: 18, categories: { api: 8, ui: 5, auth: 2, other: 3 } },
];

const mockRecentErrors = [
  { id: '1', message: 'API Connection Timeout', component: 'ApiClient', timestamp: '2023-10-07T15:34:22Z', count: 3, status: 'active', severity: 'high' },
  { id: '2', message: 'Failed to render component', component: 'Dashboard', timestamp: '2023-10-07T14:12:45Z', count: 2, status: 'active', severity: 'medium' },
  { id: '3', message: 'Auth token expired', component: 'AuthProvider', timestamp: '2023-10-07T12:08:11Z', count: 4, status: 'resolved', severity: 'high' },
  { id: '4', message: 'Data fetch failed', component: 'InventoryList', timestamp: '2023-10-07T11:45:03Z', count: 1, status: 'active', severity: 'low' },
  { id: '5', message: 'Uncaught TypeError', component: 'CartWidget', timestamp: '2023-10-06T22:15:38Z', count: 5, status: 'active', severity: 'critical' },
];

interface ErrorMonitoringDashboardProps {
  timeFrame?: 'day' | 'week' | 'month';
}

export function ErrorMonitoringDashboard({ timeFrame = 'week' }: ErrorMonitoringDashboardProps) {
  const [errorData, setErrorData] = useState(mockErrorData);
  const [recentErrors, setRecentErrors] = useState(mockRecentErrors);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrame);
  const [loading, setLoading] = useState(false);
  
  // Calculate summary stats
  const totalErrors = errorData.reduce((sum, day) => sum + day.count, 0);
  const todayErrors = errorData[errorData.length - 1]?.count || 0;
  const yesterdayErrors = errorData[errorData.length - 2]?.count || 0;
  const percentChange = yesterdayErrors
    ? ((todayErrors - yesterdayErrors) / yesterdayErrors) * 100
    : 0;
  
  // Mock fetch data based on time frame
  const fetchData = (timeFrame: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, we would fetch data based on the time frame
      setErrorData(mockErrorData);
      setRecentErrors(mockRecentErrors);
      setLoading(false);
    }, 500);
  };
  
  // Handle time frame change
  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeFrame = e.target.value as 'day' | 'week' | 'month';
    setSelectedTimeFrame(newTimeFrame);
    fetchData(newTimeFrame);
  };
  
  // Refresh data
  const handleRefresh = () => {
    fetchData(selectedTimeFrame);
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchData(selectedTimeFrame);
  }, []);
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Error Monitoring Dashboard</Heading>
        <HStack>
          <Select 
            value={selectedTimeFrame} 
            onChange={handleTimeFrameChange}
            width="150px"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </Select>
          <Button 
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>
      
      {/* Stats Cards */}
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } as ResponsiveValue<string>} gap={6} mb={6}>
        <GridItem>
          <Card>
            <CardBody>
              <HStack>
                <Box p={2} bg="red.50" borderRadius="md">
                  <AlertCircle size={24} color="red" />
                </Box>
                <VStack align="start" gap={0}>
                  <Text color="gray.500">Total Errors</Text>
                  <Heading size="lg">{totalErrors}</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <HStack>
                <Box p={2} bg="blue.50" borderRadius="md">
                  <Clock size={24} color="blue" />
                </Box>
                <VStack align="start" gap={0}>
                  <Text color="gray.500">Today's Errors</Text>
                  <Heading size="lg">{todayErrors}</Heading>
                  <HStack>
                    <TrendingUp size={14} color={percentChange >= 0 ? "red" : "green"} />
                    <Text fontSize="sm" color={percentChange >= 0 ? "red.500" : "green.500"}>
                      {Math.abs(percentChange).toFixed(1)}%
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <HStack>
                <Box p={2} bg="purple.50" borderRadius="md">
                  <Users size={24} color="purple" />
                </Box>
                <VStack align="start" gap={0}>
                  <Text color="gray.500">Affected Users</Text>
                  <Heading size="lg">28</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <HStack>
                <Box p={2} bg="orange.50" borderRadius="md">
                  <Code size={24} color="orange" />
                </Box>
                <VStack align="start" gap={0}>
                  <Text color="gray.500">Unique Error Types</Text>
                  <Heading size="lg">12</Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Tabs variant="enclosed" mb={6}>
        <TabList>
          <Tab>Recent Errors</Tab>
          <Tab>Trends</Tab>
          <Tab>By Category</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            {/* Recent Errors Table */}
            <Card>
              <CardHeader>
                <Heading size="md">Recent Errors</Heading>
              </CardHeader>
              <CardBody overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Error</Th>
                      <Th>Component</Th>
                      <Th>Time</Th>
                      <Th>Count</Th>
                      <Th>Status</Th>
                      <Th>Severity</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentErrors.map((error) => (
                      <Tr key={error.id}>
                        <Td>{error.message}</Td>
                        <Td>{error.component}</Td>
                        <Td>{new Date(error.timestamp).toLocaleTimeString()}</Td>
                        <Td>{error.count}</Td>
                        <Td>
                          <Badge 
                            colorScheme={error.status === 'active' ? 'red' : 'green'}
                          >
                            {error.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              error.severity === 'critical' ? 'red' :
                              error.severity === 'high' ? 'orange' :
                              error.severity === 'medium' ? 'yellow' :
                              'blue'
                            }
                          >
                            {error.severity}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            {/* Trends Chart (Mock) */}
            <Card>
              <CardHeader>
                <Heading size="md">Error Trends</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="info">
                  <AlertIcon  />
                  <AlertTitle>Chart Placeholder</AlertTitle>
                  <AlertDescription>
                    In a real application, a chart library like Recharts or Chart.js would be integrated here to show error trends over time.
                  </AlertDescription>
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            {/* Categories Chart (Mock) */}
            <Card>
              <CardHeader>
                <Heading size="md">Errors by Category</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="info">
                  <AlertIcon  />
                  <AlertTitle>Chart Placeholder</AlertTitle>
                  <AlertDescription>
                    In a real application, a pie or bar chart would be integrated here to show error distribution by category.
                  </AlertDescription>
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default ErrorMonitoringDashboard;