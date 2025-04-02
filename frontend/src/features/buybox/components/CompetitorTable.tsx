/// <reference path="../../types/module-declarations.d.ts" />
import React from 'react';
import { Box  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Table  } from '@/utils/chakra-compat';
import { Thead  } from '@/utils/chakra-compat';
import { Tbody  } from '@/utils/chakra-compat';
import { Tr  } from '@/utils/chakra-compat';
import { Th  } from '@/utils/chakra-compat';
import { Td  } from '@/utils/chakra-compat';
import { TableContainer  } from '@/utils/chakra-compat';
import { Tooltip  } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
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
  const sortedCompetitors = [...competitors].sort((a: any, b: any) => a.price - b.price);
  
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
          {sortedCompetitors.map((competitor: any, index: any) => {
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

export default CompetitorTable;