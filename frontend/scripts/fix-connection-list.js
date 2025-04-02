const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ConnectionList fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/connections/components/ConnectionList.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `'use client';

import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Button } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Heading } from '@chakra-ui/react/heading';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { Stack } from '@chakra-ui/react/stack';
import { Spinner } from '@chakra-ui/react/spinner';
import { SimpleGrid } from '@chakra-ui/react/layout';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { CardFooter } from '@chakra-ui/react/card';
import { Plus } from 'lucide-react';
import { useColorMode } from '@/utils/chakra-compat';
import { ConnectionForm } from './ConnectionForm';
import { DisconnectAlertDialog } from './DisconnectAlertDialog';

interface Connection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSyncDate: string;
  credentials?: Record<string, string>;
  icon?: React.ReactNode;
}

export function ConnectionList() {
  const [loading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { colorMode } = useColorMode();

  // Initialize connection data
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

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/connections/components/ConnectionList.tsx');
} catch (error) {
  console.error('❌ Error fixing ConnectionList.tsx:', error);
}

console.log('✅ All fixes applied');