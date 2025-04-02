/// <reference path="../../../types/module-declarations.d.ts" />
'use client'

/**
 * Credit History Table Component
 * Displays the user's credit transaction history in a table
 */

import React from 'react';
import { FormLabel } from '@/utils/chakra-compat';;;
;
;
;
;
;
;
;
import { useState } from 'react';
import { convertChakraProps, withAriaLabel } from '@/utils';

// Basic DummyTable implementation to satisfy TypeScript
const DummyTable = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyThead = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyTbody = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyTr = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyTh = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyTd = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;
const DummyTableContainer = ({ children, ...props }: React.PropsWithChildren<any>) => <div {...props}>{children}</div>;

// Export for use in the component
const Table = DummyTable;
const Thead = DummyThead;
const Tbody = DummyTbody;
const Tr = DummyTr;
const Th = DummyTh;
const Td = DummyTd;
const TableContainer = DummyTableContainer;
import { useCreditHistory } from '../hooks/useCredits';
import { formatCreditAmount, formatDate, getTransactionTypeStyles } from '../utils/formatters';
import { CreditTransactionType } from '../api/credits.api';

interface CreditHistoryTableProps {
  initialLimit?: number
}

export function CreditHistoryTable({ initialLimit = 10 }: CreditHistoryTableProps) {
  // Pagination state
  const [pageSize, setPageSize] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch credit history data
  const { 
    data: creditHistory, 
    loading, 
    isError 
  } = useCreditHistory({ page: currentPage, limit: pageSize });
  
  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get transaction type badge
  const getTransactionTypeBadge = (type: CreditTransactionType) => {
    const styles = getTransactionTypeStyles(type);
    
    return (
      <Badge
        px={2}
        py={1}
        bg={styles.bg}
        color={styles.color}
        rounded="md"
        fontWeight="medium"
        fontSize="xs"
      >
        {styles.icon} {type}
      </Badge>
    );
  };
  
  // If loading, show loading state
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg"   />
      </Box>
    );
  }
  
  // If error, show error state
  if (isError || !creditHistory) {
    return (
      <Box 
        textAlign="center" 
        py={8} 
        px={4} 
        bg="red.50" 
        color="red.500" 
        borderRadius="md"
      >
        <Text>There was an error loading your credit history. Please try again later.</Text>
        <Button mt={4} colorScheme="red" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }
  
  // Safely extract transactions and pagination data
  const transactions = creditHistory?.transactions || [];
  const pagination = creditHistory?.pagination || { 
    pages: 1, 
    page: 1, 
    limit: pageSize, 
    total: 0 
  };
  
  // If no transactions, show empty state
  if (transactions.length === 0) {
    return (
      <Box 
        textAlign="center" 
        py={10} 
        px={4} 
        bg="gray.50" 
        borderRadius="md"
      >
        <Text color="gray.500">You don't have any credit transactions yet.</Text>
      </Box>
    );
  }
  
  return (
    <VStack gap={4} align="stretch" width="100%">
      <Box overflowX="auto">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Balance</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction: any) => (
                <Tr key={transaction.id}>
                  <Td whiteSpace="nowrap">{formatDate(transaction.createdAt)}</Td>
                  <Td>{getTransactionTypeBadge(transaction.type)}</Td>
                  <Td maxW="300px" truncated>{transaction.description}</Td>
                  <Td isNumeric fontWeight="medium" color={transaction.amount >= 0 ? 'green.500' : 'red.500'}>
                    {formatCreditAmount(transaction.amount)}
                  </Td>
                  <Td isNumeric fontWeight="bold">{transaction.balanceAfter.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      
      <HStack justify="space-between" mt={4}>
        <FormControl w="auto">
          <HStack>
            <FormLabel htmlFor="pageSize" mb={0} fontSize="sm">Show</FormLabel>
            <Select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              size="sm"
              w="70px"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Select>
            <Text fontSize="sm">per page</Text>
          </HStack>
        </FormControl>
        
        {/* Simple pagination */}
        <HStack gap={2}>
          <Button 
            size="sm" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <Text fontSize="sm">
            Page {currentPage} of {pagination.pages || 1}
          </Text>
          
          <Button 
            size="sm" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (pagination.pages || 1)}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
}

export default CreditHistoryTable;