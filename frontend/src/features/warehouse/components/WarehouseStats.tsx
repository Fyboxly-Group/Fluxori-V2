/// <reference path="../../types/module-declarations.d.ts" />
'use client';

import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Card, CardHeader, CardBody  } from '@/utils/chakra-compat';
import { Grid, GridItem  } from '@/utils/chakra-compat';
import { HStack  } from '@/utils/chakra-compat';
import { Stat, StatLabel, StatNumber, StatHelpText  } from '@/utils/chakra-compat';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer  } from '@/utils/chakra-compat';
import { Progress  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
import { AlertTriangle } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouse';


interface CategoryBreakdown {
  category: string;
  count: number;
  stockQuantity: number;
  value: number;
}

interface WarehouseStats {
  totalItems: number;
  totalStockValue: number;
  lowStockItems: number;
  categoryBreakdown: CategoryBreakdown[];
}

interface WarehouseStatsProps {
  warehouseId: string;
}

export function WarehouseStats({ warehouseId }: WarehouseStatsProps) {
  const { colorMode } = useColorMode();
  const { useWarehouseStats } = useWarehouse();
  const { data: stats, isLoading: loading, error } = useWarehouseStats(warehouseId);
  
  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="md"  />
        <Text mt={2}>Loading warehouse statistics...</Text>
      </Box>
    );
  }
  
  if (error || !stats) {
    return (
      <Box
        p={4} 
        bg={colorMode === 'light' ? 'red.50' : 'red.900'} 
        color={colorMode === 'light' ? 'red.600' : 'red.200'} 
        borderRadius="md"
      >
        <Heading size="md" mb={2}>Error Loading Stats</Heading>
        <Text>There was an error loading warehouse statistics. Please try again.</Text>
      </Box>
    );
  }
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Calculate total stock quantity for percentages
  const totalStockQuantity = stats.categoryBreakdown.reduce((total: any, category: any) => total + category.stockQuantity,
    0
  );
  
  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' } as ResponsiveValue<string>} gap={4} mb={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Items</StatLabel>
                <StatNumber>{stats.totalItems}</StatNumber>
                <StatHelpText>Unique products in inventory</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Stock Value</StatLabel>
                <StatNumber>{formatCurrency(stats.totalStockValue)}</StatNumber>
                <StatHelpText>Based on current prices</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={stats.lowStockItems > 0 ? (colorMode === 'light' ? 'orange.50' : 'orange.900') : undefined}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    {stats.lowStockItems > 0 && <AlertTriangle color="orange.500" size={16} />}
                    <Text>Low Stock Items</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.lowStockItems}</StatNumber>
                <StatHelpText>Below reorder threshold</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Card>
        <CardHeader>
          <Heading size="md">Category Breakdown</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Category</Th>
                  <Th isNumeric>Items</Th>
                  <Th isNumeric>Stock Qty</Th>
                  <Th isNumeric>Value</Th>
                  <Th>Distribution</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.categoryBreakdown.map((category: CategoryBreakdown, index) => (
                  <Tr key={index}>
                    <Td>{category.category}</Td>
                    <Td isNumeric>{category.count}</Td>
                    <Td isNumeric>{category.stockQuantity}</Td>
                    <Td isNumeric>{formatCurrency(category.value)}</Td>
                    <Td>
                      <Box w="100%">
                        <Progress
                          value={(category.stockQuantity / totalStockQuantity) * 100} 
                          size="sm"
                          colorScheme="blue"
                        />
                        <Text fontSize="xs" textAlign="right" mt={1}>
                          {Math.round((category.stockQuantity / totalStockQuantity) * 100)}%
                        </Text>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}

export default WarehouseStats;