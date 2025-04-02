/// <reference path="../../../types/module-declarations.d.ts" />
import { Box, Button, Text, Heading, Stack, HStack, VStack, Badge, Card, CardHeader, CardBody, CardFooter, Tooltip, Spinner } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;;;
;
;
;
;
;
;
;
;
;
import React, { useState } from 'react';
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
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  Unlink, 
  RotateCw, 
  XCircle, 
  Link 
} from 'lucide-react';

import { MarketplaceIcon } from '../utils/marketplace-icons';
import { ConnectionStatus } from '../../../api/connections.api';
import DisconnectAlertDialog from './DisconnectAlertDialog';

interface MarketplaceCardProps {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  status: ConnectionStatus;
  lastChecked?: Date;
  lastError?: string;
  description?: string;
  onConnect: () => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  isTestLoading: boolean;
  isDeleteLoading: boolean;
}

/**
 * Card component for displaying and interacting with a marketplace connection
 */
export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  id,
  marketplaceId,
  marketplaceName,
  status,
  lastChecked,
  lastError,
  description,
  onConnect,
  onDelete,
  onTest,
  isTestLoading,
  isDeleteLoading,
}) => {
  const { colorMode } = useColorMode();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Status badge and icon
  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return (
          <Badge colorScheme="green" fontSize="sm" px={2} py={1} borderRadius="md">
            <HStack gap={1}>
              <Check size={12} />
              <Text>Connected</Text>
            </HStack>
          </Badge>
        );
      case ConnectionStatus.DISCONNECTED:
        return (
          <Badge colorScheme="gray" fontSize="sm" px={2} py={1} borderRadius="md">
            <HStack gap={1}>
              <XCircle size={12} />
              <Text>Disconnected</Text>
            </HStack>
          </Badge>
        );
      case ConnectionStatus.ERROR:
        return (
          <Badge colorScheme="red" fontSize="sm" px={2} py={1} borderRadius="md">
            <HStack gap={1}>
              <AlertTriangle size={12} />
              <Text>Error</Text>
            </HStack>
          </Badge>
        );
      case ConnectionStatus.PENDING:
        return (
          <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="md">
            <HStack gap={1}>
              <Clock size={12} />
              <Text>Pending</Text>
            </HStack>
          </Badge>
        );
      case ConnectionStatus.EXPIRED:
        return (
          <Badge colorScheme="orange" fontSize="sm" px={2} py={1} borderRadius="md">
            <HStack gap={1}>
              <AlertTriangle size={12} />
              <Text>Expired</Text>
            </HStack>
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Handle connect/disconnect/test
  const handleConnect = () => {
    onConnect();
  };
  
  const handleDisconnect = () => {
    setIsAlertOpen(true);
  };
  
  const confirmDisconnect = () => {
    onDelete(id);
    setIsAlertOpen(false);
  };
  
  const handleTest = () => {
    onTest(id);
  };
  
  // Determine if connected
  const isConnected = status === ConnectionStatus.CONNECTED;
  
  return (
    <>
      <Card
        variant="outline"
        borderWidth="1px"
        borderRadius="lg"
        height="100%"
        boxShadow="sm"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{
          boxShadow: 'md',
        }}
      >
        <CardHeader pb={1}>
          <HStack alignItems="center" gap={3}>
            <MarketplaceIcon marketplaceId={marketplaceId} boxSize={6} />
            <Heading size="md">{marketplaceName}</Heading>
          </HStack>
        </CardHeader>
        
        <CardBody pt={1}>
          <VStack gap={3} align="stretch">
            <Box>
              {description && (
                <Text fontSize="sm" color="gray.500">
                  {description}
                </Text>
              )}
            </Box>
            
            <HStack>
              {getStatusBadge(status)}
              
              {lastChecked && (
                <Text fontSize="xs" color="gray.500">
                  Last checked: {new Date(lastChecked).toLocaleString()}
                </Text>
              )}
            </HStack>
            
            {lastError && (
              <Tooltip label={lastError}>
                <Box 
                  p={2} 
                  bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
                  borderRadius="md"
                >
                  <Text fontSize="xs" color={colorMode === 'light' ? 'red.500' : 'red.200'} noOfLines={2}>
                    Error: {lastError}
                  </Text>
                </Box>
              </Tooltip>
            )}
          </VStack>
        </CardBody>
        
        <CardFooter pt={1}>
          <HStack gap={2} width="100%" justify="flex-end">
            {isConnected ? (
              <>
                <Tooltip label="Test Connection">
                  <Button
                    leftIcon={<RotateCw size={16} />}
                    size="sm"
                    onClick={handleTest}
                    loading={isTestLoading}
                  >
                    Test
                  </Button>
                </Tooltip>
                <Button
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<Unlink size={16} />}
                  size="sm"
                  onClick={handleDisconnect}
                  loading={isDeleteLoading}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                colorScheme="blue"
                leftIcon={<Link size={16} />}
                size="sm"
                onClick={handleConnect}
              >
                Connect
              </Button>
            )}
          </HStack>
        </CardFooter>
      </Card>
      
      <DisconnectAlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} onConfirm={confirmDisconnect} marketplaceName={marketplaceName} isLoading={isDeleteLoading}
      />
    </>
  );
};

export default MarketplaceCard;