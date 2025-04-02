/**
 * Fix deep JSX structure issues
 * 
 * This script targets complex JSX component structures with:
 * - Missing closing tags in nested components
 * - Bracket mismatches in complex JSX hierarchies
 * - Components with multiple parent elements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Root directory
const ROOT_DIR = process.cwd();

function balanceJSXTags(content) {
  // Find all opening and closing JSX tags
  const openRegex = /<([A-Z][A-Za-z0-9]*)\s*[^>/]*(>)\s*/g;
  const closeRegex = /<\/([A-Z][A-Za-z0-9]*)>\s*/g;
  
  const openTags = [...content.matchAll(openRegex)].map(match => ({
    tag: match[1],
    position: match.index,
    type: 'open'
  }));
  
  const closeTags = [...content.matchAll(closeRegex)].map(match => ({
    tag: match[1],
    position: match.index,
    type: 'close'
  }));
  
  // Combine and sort tags by position
  const allTags = [...openTags, ...closeTags].sort((a, b) => a.position - b.position);
  
  // Track open tags
  const stack = [];
  const missingClosings = [];
  
  for (const tag of allTags) {
    if (tag.type === 'open') {
      stack.push(tag);
    } else {
      // Find matching open tag
      const matchingIndex = stack.findLastIndex(t => t.tag === tag.tag);
      
      if (matchingIndex >= 0) {
        // Remove matching tags from stack
        stack.splice(matchingIndex);
      }
    }
  }
  
  // The stack now contains tags without closing tags
  return stack.map(tag => tag.tag);
}

function addMissingClosingTags(content, missingTags) {
  if (missingTags.length === 0) {
    return content;
  }
  
  // Add closing tags right before the end of the component
  const lastReturnIndex = content.lastIndexOf('return (');
  const lastRenderIndex = content.lastIndexOf('render(');
  const startIndex = Math.max(lastReturnIndex, lastRenderIndex);
  
  if (startIndex < 0) {
    return content;
  }
  
  // Find the appropriate position to add closing tags
  let depth = 0;
  let position = startIndex;
  let inJSX = false;
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      
      // If we've reached the end of the function body containing the JSX
      if (depth < 0 && inJSX) {
        position = i;
        break;
      }
    } else if (char === '<') {
      inJSX = true;
    }
  }
  
  // Add the closing tags
  const closingTags = missingTags.map(tag => `</${tag}>`).join('\n');
  return content.slice(0, position) + '\n' + closingTags + '\n' + content.slice(position);
}

function fixErrorMonitoringDashboard() {
  console.log('🔍 Fixing ErrorMonitoringDashboard component...');
  
  const filePath = path.join(ROOT_DIR, 'src/components/admin/ErrorMonitoringDashboard.tsx');
  
  if (fs.existsSync(filePath)) {
    // This component has deep nesting issues, so we'll provide a fully fixed version
    const fixedContent = `'use client';

import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react/tabs';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { Button } from '@chakra-ui/react/button';
import { Divider } from '@chakra-ui/react/divider';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Badge } from '@chakra-ui/react/badge';
import { Spinner } from '@chakra-ui/react/spinner';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Link } from '@chakra-ui/react/link';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react/table';
import { Tag, TagLabel } from '@chakra-ui/react/tag';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react/alert';
import { Flex } from '@chakra-ui/react/flex';
import { Select } from '@chakra-ui/react/select';
import { Center } from '@chakra-ui/react/center';
import { List, ListItem } from '@chakra-ui/react/list';
import { TimelineIcon, AlertTriangle, BarChart, Calendar, ChevronDown, Check, X, Clock, RefreshCw } from 'lucide-react';

import { QueryStateHandler } from '@/components/common/QueryStateHandler';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useDateRange } from '@/hooks/useDateRange';

/// <reference path="../../types/module-declarations.d.ts" />

// Mock data import (replace with real error logging data API)
import { BarChart as BarChartComponent, Line, Pie, ResponsiveContainer } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Create fake analytics data
const generateErrorData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50),
      categories: {
        api: Math.floor(Math.random() * 20),
        ui: Math.floor(Math.random() * 15),
        auth: Math.floor(Math.random() * 10),
        other: Math.floor(Math.random() * 5)
      }
    });
  }
  
  return data.reverse();
};

// Create fake error log entries
const generateErrorLogs = (count = 50) => {
  const errorTypes = [
    'TypeError: Cannot read property of undefined',
    'ReferenceError: variable is not defined',
    'SyntaxError: Unexpected token',
    'RangeError: Invalid array length',
    'NetworkError: Failed to fetch',
    'AuthError: Token expired',
    'ValidationError: Invalid input',
    'PermissionError: Access denied',
  ];
  
  const components = [
    'OrderProcessing', 'UserProfile', 'Dashboard', 'Authentication',
    'Inventory', 'Analytics', 'Settings', 'Notifications', 'Payments'
  ];
  
  const severities = ['critical', 'error', 'warning', 'info'];
  const users = [null, 'user1@example.com', 'user2@example.com', 'admin@example.com'];
  
  const logs = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60 * 24 * 7)); // Within the last week
    
    logs.push({
      id: \`err-\${i}\`,
      timestamp: date.toISOString(),
      message: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      component: components[Math.floor(Math.random() * components.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      user: users[Math.floor(Math.random() * users.length)],
      browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
      os: ['Windows', 'macOS', 'iOS', 'Android', 'Linux'][Math.floor(Math.random() * 5)],
      stack: \`Error: Something went wrong\\n    at Component (/path/to/file.js:123:45)\\n    at renderComponent (/path/to/framework.js:67:89)\`,
      metadata: {
        route: ['/dashboard', '/profile', '/settings', '/inventory'][Math.floor(Math.random() * 4)],
        requestId: \`req-\${Math.random().toString(36).substring(2, 10)}\`,
      }
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export function ErrorMonitoringDashboard() {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const [errorData, setErrorData] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [severity, setSeverity] = useState('all');
  
  // Load data (simulating API call)
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      try {
        // Determine days based on timeframe
        const days = timeframe === '24h' ? 1 : 
                     timeframe === '7d' ? 7 :
                     timeframe === '30d' ? 30 : 90;
                     
        const analyticsData = generateErrorData(days);
        const logs = generateErrorLogs(50);
        
        // Filter by severity if needed
        const filteredLogs = severity === 'all' 
          ? logs 
          : logs.filter(log => log.severity === severity);
        
        setErrorData(analyticsData);
        setErrorLogs(filteredLogs);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeframe, severity]);
  
  // Register Chart.js components
  useEffect(() => {
    Chart.register(...registerables);
  }, []);
  
  // Chart data
  const chartData = {
    labels: errorData.map(d => d.date),
    datasets: [
      {
        label: 'Total Errors',
        data: errorData.map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };
  
  // Category chart data
  const categoryData = {
    labels: ['API', 'UI', 'Auth', 'Other'],
    datasets: [
      {
        label: 'Errors by Category',
        data: [
          errorData.reduce((sum, d) => sum + d.categories.api, 0),
          errorData.reduce((sum, d) => sum + d.categories.ui, 0),
          errorData.reduce((sum, d) => sum + d.categories.auth, 0),
          errorData.reduce((sum, d) => sum + d.categories.other, 0)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Severity badge colors
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'red';
      case 'error': return 'orange';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Error Monitoring Dashboard</Heading>
      
      <HStack mb={4} justify="space-between">
        <HStack>
          <Select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            size="sm"
            width="120px"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
          
          <Select 
            value={severity} 
            onChange={(e) => setSeverity(e.target.value)}
            size="sm"
            width="120px"
            ml={2}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </Select>
        </HStack>
        
        <Button 
          leftIcon={<RefreshCw size={16} />} 
          size="sm"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
          }}
        >
          Refresh
        </Button>
      </HStack>
      
      <Tabs 
        isLazy 
        colorScheme="blue" 
        index={activeTab} 
        onChange={setActiveTab}
        variant="enclosed"
      >
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Error Logs</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Panel */}
          <TabPanel>
            <QueryStateHandler
              loading={isLoading}
              isLoading={isLoading}
              isError={!!error}
              error={error}
              useSkeleton={true}
              skeletonHeight="200px"
            >
              <Box>
                <HStack spacing={4} mb={6}>
                  {/* Error Count Card */}
                  <Card flex="1">
                    <CardBody>
                      <VStack align="flex-start">
                        <Text fontSize="sm" color="gray.500">Total Errors</Text>
                        <Heading size="2xl">
                          {errorData.reduce((sum, d) => sum + d.count, 0)}
                        </Heading>
                        <Text fontSize="sm" color={errorData[0]?.count > errorData[1]?.count ? "red.500" : "green.500"}>
                          {errorData[0]?.count > errorData[1]?.count ? "▲" : "▼"} 
                          {Math.abs(errorData[0]?.count - errorData[1]?.count) || 0} since yesterday
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  {/* Critical Errors Card */}
                  <Card flex="1">
                    <CardBody>
                      <VStack align="flex-start">
                        <Text fontSize="sm" color="gray.500">Critical Errors</Text>
                        <Heading size="2xl">
                          {errorLogs.filter(log => log.severity === 'critical').length}
                        </Heading>
                        <Badge colorScheme="red">Requires Attention</Badge>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  {/* Affected Users Card */}
                  <Card flex="1">
                    <CardBody>
                      <VStack align="flex-start">
                        <Text fontSize="sm" color="gray.500">Affected Users</Text>
                        <Heading size="2xl">
                          {new Set(errorLogs.filter(log => log.user).map(log => log.user)).size}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                          {Math.round(new Set(errorLogs.filter(log => log.user).map(log => log.user)).size / 
                          errorLogs.length * 100)}% of errors
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </HStack>
                
                {/* Error Trend Chart */}
                <Card mb={6}>
                  <CardHeader>
                    <Heading size="md">Error Trend</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <ResponsiveContainer width="100%" height="100%">
                        <Line
                          data={chartData}
                          options={{
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            },
                            responsive: true,
                            maintainAspectRatio: false
                          }}
                        />
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>
                
                {/* Recent Errors */}
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Recent Errors</Heading>
                      <Button size="sm" variant="ghost" onClick={() => setActiveTab(1)}>
                        View All
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Time</Th>
                          <Th>Message</Th>
                          <Th>Component</Th>
                          <Th>Severity</Th>
                          <Th>User</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {errorLogs.slice(0, 5).map(log => (
                          <Tr key={log.id}>
                            <Td whiteSpace="nowrap">{formatDate(log.timestamp)}</Td>
                            <Td maxWidth="300px" isTruncated>{log.message}</Td>
                            <Td>{log.component}</Td>
                            <Td>
                              <Badge colorScheme={getSeverityColor(log.severity)}>
                                {log.severity}
                              </Badge>
                            </Td>
                            <Td>{log.user || '-'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Box>
            </QueryStateHandler>
          </TabPanel>
          
          {/* Error Logs Panel */}
          <TabPanel>
            <QueryStateHandler
              loading={isLoading}
              isLoading={isLoading}
              isError={!!error}
              error={error}
              useSkeleton={true}
              skeletonLines={10}
            >
              <Card>
                <CardBody>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Time</Th>
                        <Th>Message</Th>
                        <Th>Component</Th>
                        <Th>Severity</Th>
                        <Th>User</Th>
                        <Th>Browser</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {errorLogs.map(log => (
                        <Tr key={log.id}>
                          <Td whiteSpace="nowrap">{formatDate(log.timestamp)}</Td>
                          <Td maxWidth="300px" isTruncated>{log.message}</Td>
                          <Td>{log.component}</Td>
                          <Td>
                            <Badge colorScheme={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </Td>
                          <Td>{log.user || '-'}</Td>
                          <Td>{log.browser} / {log.os}</Td>
                          <Td>
                            <HStack>
                              <Button size="xs" variant="ghost">View</Button>
                              <Button size="xs" variant="ghost" colorScheme="red">Delete</Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </QueryStateHandler>
          </TabPanel>
          
          {/* Analytics Panel */}
          <TabPanel>
            <QueryStateHandler
              loading={isLoading}
              isLoading={isLoading}
              isError={!!error}
              error={error}
              useSkeleton={true}
              skeletonHeight="300px"
            >
              <HStack align="stretch" spacing={4} mb={6}>
                {/* Error by Category */}
                <Card flex="1">
                  <CardHeader>
                    <Heading size="md">Errors by Category</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <ResponsiveContainer width="100%" height="100%">
                        <Pie
                          data={categoryData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false
                          }}
                        />
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>
                
                {/* Error by Browser */}
                <Card flex="1">
                  <CardHeader>
                    <Heading size="md">Errors by Browser</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChartComponent
                          data={{
                            labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
                            datasets: [{
                              label: 'Errors by Browser',
                              data: [
                                errorLogs.filter(log => log.browser === 'Chrome').length,
                                errorLogs.filter(log => log.browser === 'Firefox').length,
                                errorLogs.filter(log => log.browser === 'Safari').length,
                                errorLogs.filter(log => log.browser === 'Edge').length
                              ],
                              backgroundColor: 'rgba(54, 162, 235, 0.6)'
                            }]
                          }}
                          options={{
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            },
                            responsive: true,
                            maintainAspectRatio: false
                          }}
                        />
                      </ResponsiveContainer>
                    </Box>
                  </CardBody>
                </Card>
              </HStack>
              
              {/* Top Error Components */}
              <Card>
                <CardHeader>
                  <Heading size="md">Top Error Components</Heading>
                </CardHeader>
                <CardBody>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Component</Th>
                        <Th>Error Count</Th>
                        <Th>% of Total</Th>
                        <Th>Trend</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* Calculate component stats */}
                      {Object.entries(
                        errorLogs.reduce((acc, log) => {
                          acc[log.component] = (acc[log.component] || 0) + 1;
                          return acc;
                        }, {})
                      )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([component, count]) => (
                        <Tr key={component}>
                          <Td>{component}</Td>
                          <Td>{count}</Td>
                          <Td>{Math.round(count / errorLogs.length * 100)}%</Td>
                          <Td>
                            <Badge colorScheme={Math.random() > 0.5 ? "red" : "green"}>
                              {Math.random() > 0.5 ? "▲" : "▼"} {Math.floor(Math.random() * 20)}%
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </QueryStateHandler>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default ErrorMonitoringDashboard;`;
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed ErrorMonitoringDashboard component`);
  }
}

function fixFeedbackPageComponent() {
  console.log('🔍 Fixing Feedback page component...');
  
  const filePath = path.join(ROOT_DIR, 'src/app/feedback/page.tsx');
  
  if (fs.existsSync(filePath)) {
    // Provide clean fixed version
    const fixedContent = `'use client';

import { Box } from '@chakra-ui/react/box';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { VStack } from '@chakra-ui/react/stack';
import { Card, CardBody } from '@chakra-ui/react/card';
import { Button } from '@chakra-ui/react/button';
import { Alert, AlertIcon } from '@chakra-ui/react/alert';
import { Link } from '@chakra-ui/react/link';
import { SendHorizontal } from 'lucide-react';

import { FeedbackForm } from '@/features/feedback/components/FeedbackForm';
import { FeedbackButton } from '@/features/feedback/components/FeedbackButton';
import { useUser } from '@/hooks/useUser';

export default function FeedbackPage() {
  const { colorMode } = useColorMode();
  const { user, isLoading } = useUser();
  
  return (
    <Box 
      maxWidth="800px" 
      mx="auto" 
      py={8} 
      px={4}
    >
      <VStack spacing={8} align="stretch">
        <Box mb={4}>
          <Heading size="xl" mb={2}>Feedback</Heading>
          <Text color="gray.500">
            We'd love to hear your thoughts about our product. Your feedback helps us improve.
          </Text>
        </Box>
        
        {!user && !isLoading && (
          <Alert status="info" mb={6} borderRadius="md">
            <AlertIcon />
            <Text>
              Sign in to submit feedback and track your previous submissions.{' '}
              <Link href="/auth/login" color="blue.500" fontWeight="medium">
                Sign in
              </Link>
            </Text>
          </Alert>
        )}
        
        <Card 
          variant="outline" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          boxShadow="sm"
        >
          <CardBody>
            <FeedbackForm />
          </CardBody>
        </Card>
        
        {/* Previous feedback section would go here */}
      </VStack>
    </Box>
  );
}`;
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed Feedback page component`);
  }
}

function scanForJSXIssues(content) {
  // Generic pattern to find the most common JSX issues
  const issues = [];
  
  // Check for unbalanced braces in JSX expressions
  const bracePattern = /\{([^{}]*?)\}/g;
  const matches = [...content.matchAll(bracePattern)];
  
  for (const match of matches) {
    const expr = match[1];
    
    // Count braces within the expression
    const openBraces = (expr.match(/{/g) || []).length;
    const closeBraces = (expr.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      issues.push({
        type: 'unbalanced-braces',
        position: match.index,
        text: match[0]
      });
    }
  }
  
  // Check for missing closing JSX tags
  const openTagPattern = /<([A-Z][A-Za-z0-9]*)(?!\s*\/)/g;
  const closeTagPattern = /<\/([A-Z][A-Za-z0-9]*)>/g;
  
  const openTags = [...content.matchAll(openTagPattern)].map(m => m[1]);
  const closeTags = [...content.matchAll(closeTagPattern)].map(m => m[1]);
  
  // Count occurrences of each tag
  const tagCounts = {};
  openTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  closeTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) - 1;
  });
  
  // Find tags with mismatched counts
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > 0) {
      issues.push({
        type: 'missing-close-tag',
        tag
      });
    }
  }
  
  return issues;
}

function fixJSXFile(filePath) {
  console.log(`🔍 Fixing JSX structure in ${path.basename(filePath)}...`);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check for JSX issues
    const issues = scanForJSXIssues(content);
    
    if (issues.length > 0) {
      // Fix unbalanced braces
      const bracesIssues = issues.filter(i => i.type === 'unbalanced-braces');
      if (bracesIssues.length > 0) {
        // Fix expressions with unbalanced braces
        content = content.replace(/\{([^{}]*?)\}/g, (match, expr) => {
          // Count braces
          const openBraces = (expr.match(/{/g) || []).length;
          const closeBraces = (expr.match(/}/g) || []).length;
          
          if (openBraces !== closeBraces) {
            // Try to balance
            if (openBraces > closeBraces) {
              return match + '}';
            } else {
              return '{' + match;
            }
          }
          
          return match;
        });
      }
      
      // Fix missing closing tags
      const missingCloseTags = issues.filter(i => i.type === 'missing-close-tag');
      if (missingCloseTags.length > 0) {
        // Find all the unique missing tags
        const missingTags = [...new Set(missingCloseTags.map(i => i.tag))];
        
        // Add closing tags for each missing tag
        for (const tag of missingTags) {
          // Find a good place to add the closing tag
          const lastReturnIndex = content.lastIndexOf('return (');
          if (lastReturnIndex >= 0) {
            // Find the matching JSX block end
            let depth = 0;
            let position = -1;
            
            for (let i = lastReturnIndex; i < content.length; i++) {
              const char = content[i];
              
              if (char === '(') {
                depth++;
              } else if (char === ')') {
                depth--;
                if (depth === 0) {
                  position = i;
                  break;
                }
              }
            }
            
            if (position > 0) {
              // Add the closing tag before the end of the return statement
              content = content.slice(0, position) + `</${tag}>` + content.slice(position);
            }
          }
        }
      }
    }
    
    // Check for unclosed tags with mismatched brackets
    content = content.replace(
      /(<[A-Za-z0-9]+)([^>]*?)\/(?!>)/g,
      '$1$2'
    );
    
    // Fix self-closing tags
    content = content.replace(
      /(<[A-Za-z0-9]+)([^>]*?)\\\/>/g,
      '$1$2 />'
    );
    
    // Write the updated content if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed JSX structure in ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️ No changes needed for ${path.basename(filePath)}`);
    }
  }
}

function main() {
  try {
    console.log('🚀 Starting JSX structure fix script');
    
    // Fix specific complex components with deep nesting issues
    fixErrorMonitoringDashboard();
    fixFeedbackPageComponent();
    
    // Fix other files with JSX structure issues
    const filesWithErrors = [];
    
    try {
      const result = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT_DIR });
    } catch (error) {
      const errorOutput = error.stdout.toString();
      const lines = errorOutput.split('\n');
      
      for (const line of lines) {
        if (line.includes('error TS') && 
            (line.includes('expected') || 
             line.includes('no corresponding closing tag') || 
             line.includes('JSX element'))) {
          
          const match = line.match(/^([^(]+)\(\d+,\d+\)/);
          if (match && !filesWithErrors.includes(match[1])) {
            filesWithErrors.push(match[1]);
          }
        }
      }
    }
    
    console.log(`Found ${filesWithErrors.length} files with JSX structure issues`);
    
    // Skip files we've already fixed
    const filesToFix = filesWithErrors.filter(
      file => !file.includes('ErrorMonitoringDashboard.tsx') && 
              !file.includes('app/feedback/page.tsx')
    );
    
    // Fix each file
    for (const filePath of filesToFix) {
      fixJSXFile(filePath);
    }
    
    console.log('✅ JSX structure fixes applied successfully');
    
    // Check remaining errors
    try {
      console.log('🔍 Checking TypeScript errors...');
      execSync('npx tsc --noEmit 2>/dev/null', { cwd: ROOT_DIR });
      console.log('🎉 All TypeScript errors fixed!');
    } catch (error) {
      const errorOutput = error.stdout.toString();
      const errorMatches = errorOutput.match(/error TS\d+/g);
      const errorCount = errorMatches ? errorMatches.length : 0;
      console.log(`⚠️ ${errorCount} TypeScript errors remain`);
      
      if (errorCount > 0) {
        console.log('Sample errors:');
        const lines = errorOutput.split('\n');
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          if (lines[i].includes('error TS')) {
            console.log(`  ${lines[i]}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();