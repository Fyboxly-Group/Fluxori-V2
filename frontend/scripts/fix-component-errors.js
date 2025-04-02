const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Component-specific Error Fix Script');

// Helper function to fully rebuild a specific component with all its imports and structure
function fixErrorDisplayComponent() {
  const filePath = path.resolve(__dirname, '../src/components/common/ErrorDisplay.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ ErrorDisplay.tsx not found');
    return false;
  }
  
  const fixedContent = `import React from 'react';
import { Box } from '@chakra-ui/react/box';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { VStack } from '@chakra-ui/react/stack';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react/alert';

interface ErrorDisplayProps {
  title?: string;
  error: Error | string;
  resetErrorBoundary?: () => void;
  showReset?: boolean;
}

export function ErrorDisplay({ 
  title = 'Something went wrong', 
  error, 
  resetErrorBoundary,
  showReset = true
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Box 
      p={4} 
      borderRadius="md" 
      maxW="container.md" 
      mx="auto"
      my={8}
    >
      <Alert 
        status="error" 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        borderRadius="md"
        p={6}
      >
        <AlertIcon boxSize={10} />
        <AlertTitle mt={4} mb={1} fontSize="xl">
          {title}
        </AlertTitle>
        <AlertDescription maxWidth="md">
          <VStack spacing={4}>
            <Text>{errorMessage}</Text>
            {showReset && resetErrorBoundary && (
              <Button 
                colorScheme="red" 
                onClick={resetErrorBoundary}
              >
                Try Again
              </Button>
            )}
          </VStack>
        </AlertDescription>
      </Alert>
    </Box>
  );
}

export default ErrorDisplay;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed ErrorDisplay component');
  return true;
}

// Fix WarehouseInventory component
function fixWarehouseInventoryComponent() {
  const filePath = path.resolve(__dirname, '../src/features/warehouse/components/WarehouseInventory.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ WarehouseInventory.tsx not found');
    return false;
  }
  
  const fixedContent = `import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react/box';
import { Flex } from '@chakra-ui/react/flex';
import { Text } from '@chakra-ui/react/text';
import { Button } from '@chakra-ui/react/button';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { CardFooter } from '@chakra-ui/react/card';
import { HStack } from '@chakra-ui/react/stack';
import { Input } from '@chakra-ui/react/input';
import { InputGroup } from '@chakra-ui/react/input';
import { InputLeftElement } from '@chakra-ui/react/input';
import { Spinner } from '@chakra-ui/react/spinner';
import { Table } from '@chakra-ui/react/table';
import { Thead } from '@chakra-ui/react/table';
import { Tbody } from '@chakra-ui/react/table';
import { Tr } from '@chakra-ui/react/table';
import { Th } from '@chakra-ui/react/table';
import { Td } from '@chakra-ui/react/table';
import { TableContainer } from '@chakra-ui/react/table';
import { Badge } from '@chakra-ui/react/badge';
import { IconButton } from '@chakra-ui/react/button';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { Search, Edit, Plus, ArrowUpDown } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';

interface WarehouseInventoryProps {
  warehouseId: string;
  showHeader?: boolean;
  limit?: number;
}

export function WarehouseInventory({ 
  warehouseId, 
  showHeader = true,
  limit
}: WarehouseInventoryProps) {
  const { colorMode } = useColorMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('sku');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { useWarehouseInventory } = useWarehouse();
  const { 
    data: inventoryData, 
    loading, 
    error 
  } = useWarehouseInventory(warehouseId);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort inventory items
  const filteredItems = React.useMemo(() => {
    if (!inventoryData?.items) return [];
    
    // Filter items based on search query
    let items = inventoryData.items.filter(item => 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply limit if specified
    if (limit && items.length > limit) {
      items = items.slice(0, limit);
    }
    
    // Sort items
    return [...items].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [inventoryData?.items, searchQuery, sortField, sortDirection, limit]);
  
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="xl" />
        <Text mt={4}>Loading inventory data...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text>Failed to load inventory: {error.message}</Text>
      </Box>
    );
  }
  
  return (
    <Card variant="outline">
      {showHeader && (
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold">Warehouse Inventory</Text>
            <Button 
              leftIcon={<Plus size={16} />}
              size="sm"
              colorScheme="blue"
            >
              Add Stock
            </Button>
          </Flex>
          <InputGroup mt={4} size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </CardHeader>
      )}
      
      <CardBody p={0}>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('sku')}
                >
                  SKU
                  {sortField === 'sku' && (
                    <ArrowUpDown 
                      size={14} 
                      style={{ 
                        display: 'inline', 
                        marginLeft: '4px',
                        transform: sortDirection === 'desc' ? 'rotate(180deg)' : undefined
                      }} 
                    />
                  )}
                </Th>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('name')}
                >
                  Product
                  {sortField === 'name' && (
                    <ArrowUpDown 
                      size={14} 
                      style={{ 
                        display: 'inline', 
                        marginLeft: '4px',
                        transform: sortDirection === 'desc' ? 'rotate(180deg)' : undefined
                      }} 
                    />
                  )}
                </Th>
                <Th isNumeric>Quantity</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((item) => (
                <Tr key={item.id || item._id}>
                  <Td>{item.sku}</Td>
                  <Td>{item.name}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td>
                    <Badge 
                      colorScheme={item.quantity > 0 ? 'green' : 'red'}
                      fontSize="xs"
                    >
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label="Edit Stock">
                      <IconButton
                        icon={<Edit size={16} />}
                        size="xs"
                        variant="ghost"
                        aria-label="Edit stock"
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
              
              {filteredItems.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    <Text color="gray.500">
                      {searchQuery ? 'No matching items found' : 'No inventory items available'}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
      
      {showHeader && (
        <CardFooter pt={2} justifyContent="space-between">
          <Text fontSize="sm" color="gray.500">
            Showing {filteredItems.length} of {inventoryData?.items?.length || 0} items
          </Text>
          <HStack>
            <Button size="sm" variant="ghost">
              Export
            </Button>
            <Button size="sm" variant="ghost">
              Print
            </Button>
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default WarehouseInventory;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed WarehouseInventory component');
  return true;
}

// Fix CompetitorTable component
function fixCompetitorTableComponent() {
  const filePath = path.resolve(__dirname, '../src/features/buybox/components/CompetitorTable.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ CompetitorTable.tsx not found');
    return false;
  }
  
  const fixedContent = `import React from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Card } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Badge } from '@chakra-ui/react/badge';
import { Table } from '@chakra-ui/react/table';
import { Thead } from '@chakra-ui/react/table';
import { Tbody } from '@chakra-ui/react/table';
import { Tr } from '@chakra-ui/react/table';
import { Th } from '@chakra-ui/react/table';
import { Td } from '@chakra-ui/react/table';
import { TableContainer } from '@chakra-ui/react/table';
import { Tooltip } from '@chakra-ui/react/tooltip';
import { useColorMode } from '@chakra-ui/react/color-mode';
import { TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import { formatPrice } from '../utils/format-utils';
import { BuyBoxCompetitor } from '../types/buybox.types';

interface CompetitorTableProps {
  competitors: BuyBoxCompetitor[];
  currencyCode?: string;
}

export function CompetitorTable({ 
  competitors = [], 
  currencyCode = 'USD'
}: CompetitorTableProps) {
  const { colorMode } = useColorMode();
  
  if (!competitors || competitors.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500">No competitor data available</Text>
      </Box>
    );
  }
  
  // Sort competitors by price
  const sortedCompetitors = [...competitors].sort((a, b) => a.price - b.price);
  
  // Find buy box winner (lowest price)
  const buyBoxWinner = sortedCompetitors[0];
  
  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Seller</Th>
            <Th isNumeric>Price</Th>
            <Th>Fulfillment</Th>
            <Th>Status</Th>
            <Th>Buy Box</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedCompetitors.map((competitor, index) => {
            const isWinning = index === 0;
            const priceDiff = competitor.price - buyBoxWinner.price;
            const priceDiffPercent = (priceDiff / buyBoxWinner.price) * 100;
            
            return (
              <Tr 
                key={competitor.sellerId}
                bg={competitor.isOwnSeller ? (
                  colorMode === 'light' ? 'blue.50' : 'blue.900'
                ) : undefined}
              >
                <Td fontWeight={competitor.isOwnSeller ? 'bold' : 'normal'}>
                  {competitor.sellerName}
                  {competitor.isOwnSeller && (
                    <Badge ml={2} colorScheme="blue" fontSize="xs">You</Badge>
                  )}
                </Td>
                <Td isNumeric>
                  <Text fontWeight="semibold">
                    {formatPrice(competitor.price, currencyCode)}
                  </Text>
                  
                  {!isWinning && priceDiff > 0 && (
                    <Tooltip label="Price difference from Buy Box winner">
                      <Text 
                        fontSize="xs" 
                        color="red.500" 
                        display="flex" 
                        alignItems="center"
                        justifyContent="flex-end"
                      >
                        <TrendingUp size={12} style={{ marginRight: '4px' }} />
                        +{formatPrice(priceDiff, currencyCode)} (+{priceDiffPercent.toFixed(1)}%)
                      </Text>
                    </Tooltip>
                  )}
                </Td>
                <Td>
                  <Badge 
                    colorScheme={
                      competitor.fulfillmentType === 'FBA' ? 'purple' : 
                      competitor.fulfillmentType === 'Prime' ? 'blue' : 'gray'
                    }
                    fontSize="xs"
                  >
                    {competitor.fulfillmentType}
                  </Badge>
                </Td>
                <Td>
                  <Badge 
                    colorScheme={competitor.status === 'active' ? 'green' : 'red'}
                    fontSize="xs"
                  >
                    {competitor.status}
                  </Badge>
                </Td>
                <Td>
                  {isWinning ? (
                    <CheckCircle size={16} color="green" />
                  ) : (
                    <Minus size={16} color="gray" />
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default CompetitorTable;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed CompetitorTable component');
  return true;
}

// Fix BuyBoxTimeline component
function fixBuyBoxTimelineComponent() {
  const filePath = path.resolve(__dirname, '../src/features/buybox/components/BuyBoxTimeline.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ BuyBoxTimeline.tsx not found');
    return false;
  }
  
  const fixedContent = `import React from 'react';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Flex } from '@chakra-ui/react/flex';
import { VStack } from '@chakra-ui/react/stack';
import { Badge } from '@chakra-ui/react/badge';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { useColorMode } from '@chakra-ui/react/color-mode';
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
        <VStack spacing={4} align="stretch">
          {snapshots.map((snapshot, index) => (
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
      borderLeftColor={\`\${statusColor}.500\`}
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

export default BuyBoxTimeline;`;

  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ Fixed BuyBoxTimeline component');
  return true;
}

// Main function to fix all component errors
async function fixComponentErrors() {
  // Fix high-priority components with many errors
  fixErrorDisplayComponent();
  fixWarehouseInventoryComponent();
  fixCompetitorTableComponent();
  fixBuyBoxTimelineComponent();
  
  console.log('\n🎉 Fixed high-priority components with TypeScript errors');
}

// Run the component error fixer
fixComponentErrors().catch(error => {
  console.error('❌ Error fixing component errors:', error);
});