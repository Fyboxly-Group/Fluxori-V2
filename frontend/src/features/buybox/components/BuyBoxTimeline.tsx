/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { BuyBoxHistory, BuyBoxSnapshot, BuyBoxOwnershipStatus } from '../types/buybox.types';
import { formatPrice, formatDate } from '../utils/format-utils';


interface BuyBoxTimelineProps {
  history: BuyBoxHistory;
}

export function BuyBoxTimeline({ history }: BuyBoxTimelineProps) {
  const { colorMode } = useColorMode();
  
  // For the timeline, we need the snapshots in reverse chronological order
  const snapshots = [...history.snapshots].reverse();
  
  if (!snapshots || snapshots.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">No history data available</Text>
      </Box>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <Text fontSize="lg" fontWeight="bold">Buy Box History</Text>
      </CardHeader>
      <CardBody>
        <VStack gap={4} align="stretch">
          {snapshots.map((snapshot: any, index: any) => (
            <TimelineEntry 
              key={snapshot.timestamp}
              snapshot={snapshot}
              isLatest={index === 0}
              history={history}
            />
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

interface TimelineEntryProps {
  snapshot: BuyBoxSnapshot;
  isLatest: boolean;
  history: BuyBoxHistory;
}

function TimelineEntry({ snapshot, isLatest, history }: TimelineEntryProps) {
  const { colorMode } = useColorMode();
  
  // Get the ownership status
  const ownershipStatus = snapshot.ownBuyBoxStatus;
  
  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case BuyBoxOwnershipStatus.OWNED:
        return 'green';
      case BuyBoxOwnershipStatus.NOT_OWNED:
        return 'red';
      default:
        return 'gray';
    }
  };
  
  const statusColor = getStatusColor(ownershipStatus);
  
  return (
    <Box 
      p={4} 
      borderRadius="md" 
      borderWidth="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      borderLeftWidth="4px"
      borderLeftColor={`${statusColor}.500`}
      bg={isLatest ? (colorMode === 'light' ? 'gray.50' : 'gray.700') : undefined}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Flex alignItems="center">
          <Badge colorScheme={statusColor}>
            {ownershipStatus.replace('_', ' ')}
          </Badge>
          {isLatest && (
            <Badge ml={2} colorScheme="blue">Latest</Badge>
          )}
        </Flex>
        <Text fontSize="sm" color="gray.500">
          {formatDate(snapshot.timestamp)}
        </Text>
      </Flex>
      
      <Flex justifyContent="space-between" mt={3}>
        <Box>
          <Text fontSize="sm" color="gray.500">Your Price</Text>
          <Text fontWeight="bold">
            {formatPrice(snapshot.ownSellerPrice)}
          </Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color="gray.500">Buy Box Price</Text>
          <Text fontWeight="bold">
            {formatPrice(snapshot.buyBoxPrice)}
          </Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color="gray.500">Price Diff</Text>
          <Text 
            fontWeight="bold" 
            color={
              snapshot.ownSellerPrice > snapshot.buyBoxPrice ? 'red.500' : 
              snapshot.ownSellerPrice < snapshot.buyBoxPrice ? 'green.500' : 'gray.500'
            }
          >
            {snapshot.ownSellerPrice === snapshot.buyBoxPrice ? 
              'None' : 
              formatPrice(Math.abs(snapshot.ownSellerPrice - snapshot.buyBoxPrice))
            }
          </Text>
        </Box>
      </Flex>
      
      {snapshot.reason && (
        <Text fontSize="sm" mt={3} color="gray.500">
          {snapshot.reason}
        </Text>
      )}
    </Box>
  );
}

export default BuyBoxTimeline;