const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Remaining TypeScript Errors Fix Script');

// Fix useConversation hook
function fixUseConversationHook() {
  const filePath = path.resolve(__dirname, '../src/features/ai-cs-agent/hooks/useConversation.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ useConversation.ts not found');
    return false;
  }
  
  const fixedContent = `import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatSocket } from '../utils/socket';
import { Message, ChatRole, ConversationState } from '../types/chat.types';

interface UseConversationOptions {
  autoConnect?: boolean;
  onNewMessage?: (message: Message) => void;
}

export function useConversation(options: UseConversationOptions = {}) {
  const { autoConnect = true, onNewMessage } = options;
  
  // State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConversationState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const onNewMessageRef = useRef(onNewMessage);
  
  // Update ref when callback changes
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);
  
  // Handle socket connection
  useEffect(() => {
    if (autoConnect) {
      chatSocket.connect();
    }
    
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleError = (err: Error) => {
      setError(err);
      setStatus('error');
    };
    
    // Set up socket event handlers
    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('error', handleError);
    chatSocket.on('message', handleNewMessage);
    
    // Cleanup listeners when unmounting
    return () => {
      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('error', handleError);
      chatSocket.off('message', handleNewMessage);
      
      if (autoConnect) {
        chatSocket.disconnect();
      }
    };
  }, [autoConnect]);
  
  // Handle new incoming messages
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    setStatus('idle');
    
    // Call the onNewMessage callback if provided
    if (onNewMessageRef.current) {
      onNewMessageRef.current(message);
    }
  }, []);
  
  // Start a new conversation
  const startConversation = useCallback(() => {
    // Generate a new conversation ID
    const newConversationId = uuidv4();
    setConversationId(newConversationId);
    
    // Clear messages
    setMessages([]);
    
    // Send initialization message to server
    chatSocket.emit('start_conversation', { conversationId: newConversationId });
    
    return newConversationId;
  }, []);
  
  // Send a message to the conversation
  const sendMessage = useCallback((content: string) => {
    if (!conversationId) {
      throw new Error('No active conversation. Call startConversation first.');
    }
    
    if (!content || content.trim() === '') {
      return;
    }
    
    // Create the message object
    const message: Message = {
      id: uuidv4(),
      conversationId,
      content,
      role: ChatRole.USER,
      timestamp: new Date().toISOString(),
    };
    
    // Add message to local state
    setMessages(prev => [...prev, message]);
    
    // Set status to loading while waiting for response
    setStatus('loading');
    
    // Send message to server
    chatSocket.emit('message', message);
    
    return message;
  }, [conversationId]);
  
  // Load a specific conversation by ID
  const loadConversation = useCallback(async (id: string) => {
    try {
      setStatus('loading');
      
      // TODO: Implement API call to load conversation history
      const response = await fetch(\`/api/conversations/\${id}\`);
      
      if (!response.ok) {
        throw new Error(\`Failed to load conversation: \${response.statusText}\`);
      }
      
      const data = await response.json();
      
      setConversationId(id);
      setMessages(data.messages);
      setStatus('idle');
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('error');
      throw err;
    }
  }, []);
  
  // Clear the current conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
  }, []);
  
  return {
    conversationId,
    messages,
    status,
    error,
    isConnected,
    startConversation,
    sendMessage,
    loadConversation,
    clearConversation,
  };
}

export default useConversation;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed useConversation hook');
  return true;
}

// Fix ErrorMonitoringDashboard component
function fixErrorMonitoringDashboard() {
  const filePath = path.resolve(__dirname, '../src/components/admin/ErrorMonitoringDashboard.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ErrorMonitoringDashboard.tsx not found');
    return false;
  }
  
  const fixedContent = `import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Grid } from '@chakra-ui/react/layout';
import { GridItem } from '@chakra-ui/react/layout';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Flex } from '@chakra-ui/react/flex';
import { Stack } from '@chakra-ui/react/stack';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { Table } from '@chakra-ui/react/table';
import { Thead } from '@chakra-ui/react/table';
import { Tbody } from '@chakra-ui/react/table';
import { Tr } from '@chakra-ui/react/table';
import { Th } from '@chakra-ui/react/table';
import { Td } from '@chakra-ui/react/table';
import { Badge } from '@chakra-ui/react/badge';
import { Select } from '@chakra-ui/react/select';
import { Tabs } from '@chakra-ui/react/tabs';
import { TabList } from '@chakra-ui/react/tabs';
import { TabPanels } from '@chakra-ui/react/tabs';
import { TabPanel } from '@chakra-ui/react/tabs';
import { Tab } from '@chakra-ui/react/tabs';
import { Alert } from '@chakra-ui/react/alert';
import { AlertIcon } from '@chakra-ui/react/alert';
import { AlertTitle } from '@chakra-ui/react/alert';
import { AlertDescription } from '@chakra-ui/react/alert';
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
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={6}>
        <GridItem>
          <Card>
            <CardBody>
              <HStack>
                <Box p={2} bg="red.50" borderRadius="md">
                  <AlertCircle size={24} color="red" />
                </Box>
                <VStack align="start" spacing={0}>
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
                <VStack align="start" spacing={0}>
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
                <VStack align="start" spacing={0}>
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
                <VStack align="start" spacing={0}>
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
                  <AlertIcon />
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
                  <AlertIcon />
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

export default ErrorMonitoringDashboard;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed ErrorMonitoringDashboard component');
  return true;
}

// Fix socket utility files
function fixSocketUtils() {
  // AI CS agent socket
  const aiCsSocketPath = path.resolve(__dirname, '../src/features/ai-cs-agent/utils/socket.ts');
  
  if (fs.existsSync(aiCsSocketPath)) {
    const fixedContent = `import { io, Socket } from 'socket.io-client';
import { Message } from '../types/chat.types';

// Create a singleton socket instance for the AI chat
class ChatSocket {
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
  
  // Connect to the socket
  connect() {
    if (this.socket) {
      return this.socket;
    }
    
    this.socket = io(this.url, {
      auth: {
        token: this.authToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    return this.socket;
  }
  
  // Disconnect from the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
  
  // Emit an event to the server
  emit(event: string, data: any) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit(event, data);
  }
  
  // Register an event handler for the 'connect' event
  onConnect(callback: () => void) {
    this.socket?.on('connect', callback);
    return () => {
      this.socket?.off('connect', callback);
    };
  }
  
  // Register an event handler for the 'disconnect' event
  onDisconnect(callback: () => void) {
    this.socket?.on('disconnect', callback);
    return () => {
      this.socket?.off('disconnect', callback);
    };
  }
  
  // Register an event handler for the 'error' event
  onError(callback: (error: Error) => void) {
    this.socket?.on('error', callback);
    return () => {
      this.socket?.off('error', callback);
    };
  }
  
  // Register an event handler for incoming messages
  onMessage(callback: (message: Message) => void) {
    this.socket?.on('message', callback);
    return () => {
      this.socket?.off('message', callback);
    };
  }
  
  // Generic event handler registration
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }
  
  // Remove event handler
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

// Export a singleton instance
export const chatSocket = new ChatSocket();
`;
    
    fs.writeFileSync(aiCsSocketPath, fixedContent);
    console.log('✅ Fixed AI CS agent socket.ts');
  }
  
  // Notifications socket
  const notificationSocketPath = path.resolve(__dirname, '../src/features/notifications/utils/socket.ts');
  
  if (fs.existsSync(notificationSocketPath)) {
    const fixedContent = `import { io, Socket } from 'socket.io-client';
import { Notification } from '../api/notification.api';

// Create a singleton socket instance for notifications
class NotificationSocket {
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private url = process.env.NEXT_PUBLIC_NOTIFICATION_WEBSOCKET_URL || 'ws://localhost:3002';
  
  // Connect to the socket
  connect() {
    if (this.socket) {
      return this.socket;
    }
    
    this.socket = io(this.url, {
      auth: {
        token: this.authToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    return this.socket;
  }
  
  // Disconnect from the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
  
  // Mark a notification as read
  markAsRead(notificationId: string) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('mark_as_read', { notificationId });
  }
  
  // Mark all notifications as read
  markAllAsRead() {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('mark_all_as_read');
  }
  
  // Clear a notification
  clearNotification(notificationId: string) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    
    this.socket?.emit('clear_notification', { notificationId });
  }
  
  // Register an event handler for the 'connect' event
  onConnect(callback: () => void) {
    this.socket?.on('connect', callback);
    return () => {
      this.socket?.off('connect', callback);
    };
  }
  
  // Register an event handler for the 'disconnect' event
  onDisconnect(callback: () => void) {
    this.socket?.on('disconnect', callback);
    return () => {
      this.socket?.off('disconnect', callback);
    };
  }
  
  // Register an event handler for the 'error' event
  onError(callback: (error: Error) => void) {
    this.socket?.on('error', callback);
    return () => {
      this.socket?.off('error', callback);
    };
  }
  
  // Register an event handler for incoming notifications
  onNotification(callback: (data: { type: string; notification?: Notification; notificationId?: string }) => void) {
    this.socket?.on('notification', callback);
    return () => {
      this.socket?.off('notification', callback);
    };
  }
  
  // Generic event handler registration
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }
  
  // Remove event handler
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

// Export a singleton instance
export const notificationSocket = new NotificationSocket();
`;
    
    fs.writeFileSync(notificationSocketPath, fixedContent);
    console.log('✅ Fixed Notifications socket.ts');
  }
  
  return true;
}

// Fix ToastNotification component
function fixToastNotification() {
  const filePath = path.resolve(__dirname, '../src/features/notifications/components/ToastNotification.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ToastNotification.tsx not found');
    return false;
  }
  
  const fixedContent = `import React from 'react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Text } from '@chakra-ui/react/text';
import { CloseButton } from '@chakra-ui/react/close-button';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  X
} from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
  isClosable?: boolean;
}

export function ToastNotification({
  title,
  description,
  status = 'info',
  onClose,
  isClosable = true
}: ToastNotificationProps) {
  const { colorMode } = useColorMode();
  
  // Status-based styling
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="green" />;
      case 'error':
        return <AlertCircle size={20} color="red" />;
      case 'warning':
        return <AlertTriangle size={20} color="orange" />;
      case 'info':
      default:
        return <Info size={20} color="blue" />;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return colorMode === 'light' ? 'green.500' : 'green.300';
      case 'error':
        return colorMode === 'light' ? 'red.500' : 'red.300';
      case 'warning':
        return colorMode === 'light' ? 'orange.500' : 'orange.300';
      case 'info':
      default:
        return colorMode === 'light' ? 'blue.500' : 'blue.300';
    }
  };
  
  const getBgColor = () => {
    switch (status) {
      case 'success':
        return colorMode === 'light' ? 'green.50' : 'green.900';
      case 'error':
        return colorMode === 'light' ? 'red.50' : 'red.900';
      case 'warning':
        return colorMode === 'light' ? 'orange.50' : 'orange.900';
      case 'info':
      default:
        return colorMode === 'light' ? 'blue.50' : 'blue.900';
    }
  };
  
  return (
    <Box
      p={4}
      bg={getBgColor()}
      borderLeftWidth="4px"
      borderLeftColor={getStatusColor()}
      borderRadius="md"
      boxShadow="md"
      mb={4}
      maxW="sm"
      w="100%"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Box mr={3}>
            {getStatusIcon()}
          </Box>
          <Box flex="1">
            <Text fontWeight="bold" color={getStatusColor()}>
              {title}
            </Text>
            {description && (
              <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                {description}
              </Text>
            )}
          </Box>
        </Flex>
        {isClosable && (
          <CloseButton 
            size="sm" 
            onClick={onClose} 
            color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
          />
        )}
      </Flex>
    </Box>
  );
}

export default ToastNotification;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed ToastNotification component');
  return true;
}

// Fix AIChatInterface component
function fixAIChatInterface() {
  const filePath = path.resolve(__dirname, '../src/features/ai-cs-agent/components/AIChatInterface.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ AIChatInterface.tsx not found');
    return false;
  }
  
  const fixedContent = `import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Text } from '@chakra-ui/react/text';
import { Input } from '@chakra-ui/react/input';
import { Button } from '@chakra-ui/react/button';
import { IconButton } from '@chakra-ui/react/button';
import { Spinner } from '@chakra-ui/react/spinner';
import { Avatar } from '@chakra-ui/react/avatar';
import { VStack } from '@chakra-ui/react/stack';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { SendHorizontal, Bot, User, RotateCw } from 'lucide-react';
import { useConversation } from '../hooks/useConversation';
import { Message, ChatRole } from '../types/chat.types';

interface AIChatInterfaceProps {
  initialMessages?: Message[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  agentName?: string;
  userName?: string;
  maxHeight?: string | number;
  showAvatar?: boolean;
}

export function AIChatInterface({
  initialMessages = [],
  header,
  footer,
  onSendMessage,
  placeholder = 'Type a message...',
  agentName = 'AI Assistant',
  userName = 'You',
  maxHeight = '600px',
  showAvatar = true
}: AIChatInterfaceProps) {
  const { colorMode } = useColorMode();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hook for managing the conversation
  const {
    messages,
    status,
    sendMessage,
    startConversation
  } = useConversation({
    autoConnect: true
  });
  
  // Combine initial messages with conversation messages
  const allMessages = [...initialMessages, ...messages];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);
  
  // Start a new conversation when the component mounts
  useEffect(() => {
    startConversation();
  }, [startConversation]);
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Send message through our hook
    sendMessage(inputValue);
    
    // Call the external handler if provided
    if (onSendMessage) {
      onSendMessage(inputValue);
    }
    
    // Clear the input
    setInputValue('');
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle pressing Enter to send
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
    >
      {/* Chat Header */}
      {header ? (
        header
      ) : (
        <Flex
          p={4}
          borderBottomWidth="1px"
          bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
          alignItems="center"
        >
          {showAvatar && (
            <Avatar 
              size="sm" 
              bg="blue.500" 
              icon={<Bot size={18} color="white" />} 
              mr={3}
            />
          )}
          <Text fontWeight="medium">{agentName}</Text>
        </Flex>
      )}
      
      {/* Messages Container */}
      <Box 
        p={4} 
        overflowY="auto" 
        maxHeight={maxHeight}
        minHeight="300px"
      >
        <VStack spacing={4} align="stretch">
          {allMessages.map((message, index) => (
            <Flex
              key={message.id || index}
              justifyContent={message.role === ChatRole.USER ? 'flex-end' : 'flex-start'}
            >
              <Flex
                maxWidth="80%"
                bg={message.role === ChatRole.USER 
                  ? (colorMode === 'light' ? 'blue.500' : 'blue.600') 
                  : (colorMode === 'light' ? 'gray.100' : 'gray.700')}
                color={message.role === ChatRole.USER 
                  ? 'white' 
                  : (colorMode === 'light' ? 'gray.800' : 'white')}
                borderRadius="lg"
                px={4}
                py={3}
                alignItems="flex-start"
              >
                {message.role !== ChatRole.USER && showAvatar && (
                  <Avatar 
                    size="xs" 
                    bg="blue.500" 
                    icon={<Bot size={14} color="white" />} 
                    mr={2}
                    mt={1}
                  />
                )}
                <Box>
                  <Text 
                    fontSize="xs" 
                    fontWeight="bold" 
                    mb={1}
                  >
                    {message.role === ChatRole.USER 
                      ? userName 
                      : message.role === ChatRole.SYSTEM 
                        ? 'System' 
                        : agentName}
                  </Text>
                  <Text whiteSpace="pre-wrap">{message.content}</Text>
                </Box>
                {message.role === ChatRole.USER && showAvatar && (
                  <Avatar 
                    size="xs" 
                    bg="gray.500" 
                    icon={<User size={14} color="white" />} 
                    ml={2}
                    mt={1}
                  />
                )}
              </Flex>
            </Flex>
          ))}
          
          {/* Loading indicator */}
          {status === 'loading' && (
            <Flex justifyContent="flex-start">
              <Flex
                bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                color={colorMode === 'light' ? 'gray.800' : 'white'}
                borderRadius="lg"
                px={4}
                py={3}
                alignItems="center"
              >
                {showAvatar && (
                  <Avatar 
                    size="xs" 
                    bg="blue.500" 
                    icon={<Bot size={14} color="white" />} 
                    mr={2}
                  />
                )}
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm">Thinking...</Text>
              </Flex>
            </Flex>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      
      {/* Input Area */}
      <Flex
        p={4}
        borderTopWidth="1px"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
      >
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          mr={2}
          variant="filled"
          disabled={status === 'loading'}
        />
        <IconButton
          icon={<SendHorizontal size={18} />}
          colorScheme="blue"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || status === 'loading'}
          aria-label="Send message"
        />
      </Flex>
      
      {/* Footer */}
      {footer}
    </Box>
  );
}

export default AIChatInterface;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed AIChatInterface component');
  return true;
}

// Fix useUser hook
function fixUserHook() {
  const filePath = path.resolve(__dirname, '../src/hooks/useUser.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ useUser.ts not found');
    return false;
  }
  
  const fixedContent = `import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/client';

export interface UseUserOptions {
  redirectIfNotAuth?: boolean;
  redirectTo?: string;
}

export function useUser(options: UseUserOptions = {}) {
  const { redirectIfNotAuth = false, redirectTo = '/auth/login' } = options;
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch user data from API or localStorage
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user from API
      const response = await apiClient.get('/api/user/me');
      setUser(response.data);
      setError(null);
      
      return response.data;
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      
      if (redirectIfNotAuth) {
        router.push(redirectTo);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [redirectIfNotAuth, redirectTo, router]);
  
  // Update user data
  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      setLoading(true);
      
      // Update user via API
      const response = await apiClient.put('/api/user/me', userData);
      setUser(response.data);
      setError(null);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Logout user
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout API
      await apiClient.post('/api/auth/logout');
      
      // Clear user data
      setUser(null);
      setError(null);
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'));
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Fetch user on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    logout,
  };
}

export default useUser;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed useUser hook');
  return true;
}

// Fix ConnectionList component if it still has issues
function fixConnectionList() {
  const filePath = path.resolve(__dirname, '../src/features/connections/components/ConnectionList.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ConnectionList.tsx not found');
    return false;
  }
  
  const fixedContent = `import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { Stack } from '@chakra-ui/react/stack';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { Spinner } from '@chakra-ui/react/spinner';
import { SimpleGrid } from '@chakra-ui/react/layout';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { CardFooter } from '@chakra-ui/react/card';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Plus } from 'lucide-react';
import { ConnectionForm } from './ConnectionForm';
import { DisconnectAlertDialog } from './DisconnectAlertDialog';

interface Connection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSyncDate: string;
  credentials?: Record<string, any>;
  icon?: React.ReactNode;
}

export function ConnectionList() {
  const [loading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { colorMode } = useColorMode();

  // Initialize with mock data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setConnections([
        {
          id: '1',
          name: 'Amazon Seller Central',
          type: 'amazon',
          status: 'active',
          lastSyncDate: '2023-10-10T12:00:00Z'
        },
        {
          id: '2',
          name: 'Shopify Store',
          type: 'shopify',
          status: 'inactive',
          lastSyncDate: '2023-10-09T15:30:00Z'
        },
        {
          id: '3',
          name: 'WooCommerce',
          type: 'woocommerce',
          status: 'error',
          lastSyncDate: '2023-10-05T09:45:00Z'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddConnection = () => {
    setSelectedConnection(null);
    setIsFormOpen(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsFormOpen(true);
  };

  const handleDisconnect = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsDisconnectDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedConnection(null);
  };

  const handleDisconnectConfirm = () => {
    // In a real app, we would call an API here
    if (selectedConnection) {
      setConnections(connections.filter(conn => conn.id !== selectedConnection.id));
    }
    setIsDisconnectDialogOpen(false);
    setSelectedConnection(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green.500';
      case 'inactive':
        return 'gray.500';
      case 'error':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontWeight="bold" fontSize="lg">Connections</Text>
        <Button
          leftIcon={<Plus size={16} />} 
          colorScheme="blue"
          size="sm"
          onClick={handleAddConnection}
        >
          Add Connection
        </Button>
      </HStack>

      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <SimpleGrid columns={[1, 1, 2, 3]} spacing={4}>
          {connections.map(connection => (
            <Card
              key={connection.id} 
              variant="outline"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
              shadow="sm"
            >
              <CardHeader pb={2}>
                <HStack>
                  <Text fontWeight="bold">{connection.name}</Text>
                  <Box
                    w={2} 
                    h={2} 
                    borderRadius="full"
                    bg={getStatusColor(connection.status)} 
                    ml={2} 
                  />
                </HStack>
              </CardHeader>
              <CardBody pt={0} pb={2}>
                <Stack gap={2} fontSize="sm">
                  <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
                    Type: {connection.type}<br />
                    Last Synced: {formatDate(connection.lastSyncDate)}
                  </Text>
                </Stack>
              </CardBody>
              <CardFooter pt={0} justifyContent="space-between">
                <Button size="sm" variant="ghost" onClick={() => handleEditConnection(connection)}>
                  Edit
                </Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDisconnect(connection)}>
                  Disconnect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <ConnectionForm
        open={isFormOpen} 
        onClose={handleFormClose} 
        connection={selectedConnection}
      />

      <DisconnectAlertDialog
        open={isDisconnectDialogOpen}
        onClose={() => setIsDisconnectDialogOpen(false)}
        onConfirm={handleDisconnectConfirm}
        connectionName={selectedConnection?.name || ''}
      />
    </Box>
  );
}

export default ConnectionList;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed ConnectionList component');
  return true;
}

// Main function to fix remaining errors
async function fixRemainingErrors() {
  // Fix high-priority components with many errors
  console.log('🔧 Fixing high-priority components and hooks:');
  fixUseConversationHook();
  fixErrorMonitoringDashboard();
  fixSocketUtils();
  fixToastNotification();
  fixAIChatInterface();
  fixUserHook();
  fixConnectionList();
  
  console.log('\n🎉 Fixed remaining high-priority components and hooks with TypeScript errors');
}

// Run the fix function
fixRemainingErrors().catch(error => {
  console.error('❌ Error fixing remaining TypeScript errors:', error);
});