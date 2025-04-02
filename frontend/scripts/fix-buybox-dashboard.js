const fs = require('fs');
const path = require('path');

console.log('🚀 Starting BuyBox Dashboard Page fix script');

const sourceFilePath = path.resolve(__dirname, '../src/features/buybox/pages/BuyBoxDashboardPage.tsx');

// Completely rebuild the file with proper TypeScript and Chakra UI v3 patterns
const fixedContent = `/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

import React, { useEffect, useState } from 'react';
import { HStack } from '@chakra-ui/react/stack';
import { VStack } from '@chakra-ui/react/stack';
import { Grid } from '@chakra-ui/react/layout';
import { GridItem } from '@chakra-ui/react/layout';
import { Card } from '@chakra-ui/react/card';
import { CardHeader } from '@chakra-ui/react/card';
import { CardBody } from '@chakra-ui/react/card';
import { Box } from '@chakra-ui/react/box';
import { Container } from '@chakra-ui/react/layout';
import { Flex } from '@chakra-ui/react/flex';
import { Heading } from '@chakra-ui/react/heading';
import { Text } from '@chakra-ui/react/text';
import { Badge } from '@chakra-ui/react/badge';
import { Button } from '@chakra-ui/react/button';
import { Select } from '@chakra-ui/react/select';
import { Spinner } from '@chakra-ui/react/spinner';
import { SimpleGrid } from '@chakra-ui/react/layout';
import { Tabs } from '@chakra-ui/react/tabs';
import { TabList } from '@chakra-ui/react/tabs';
import { TabPanels } from '@chakra-ui/react/tabs';
import { TabPanel } from '@chakra-ui/react/tabs';
import { Tab } from '@chakra-ui/react/tabs';
import { Stat } from '@chakra-ui/react/stat';
import { StatLabel } from '@chakra-ui/react/stat';
import { StatNumber } from '@chakra-ui/react/stat';
import { StatHelpText } from '@chakra-ui/react/stat';
import { StatArrow } from '@chakra-ui/react/stat';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCcw,
  Plus
} from 'lucide-react';
import { useColorMode } from '@/utils/chakra-compat';
import { useBuyBox } from '../contexts/BuyBoxContext';
import { BuyBoxStatusCard } from '../components/BuyBoxStatusCard';
import { BuyBoxTimeline } from '../components/BuyBoxTimeline';
import { CompetitorTable } from '../components/CompetitorTable';
import { BuyBoxHistory, BuyBoxOwnershipStatus } from '../types/buybox.types';
import { formatPercentage, formatPrice } from '../utils/format-utils';

interface BuyBoxDashboardProps {}

export const BuyBoxDashboardPage: React.FC<BuyBoxDashboardProps> = () => {
  const {
    buyBoxHistories,
    loading,
    isChecking,
    getBuyBoxHistoriesByMarketplace,
    checkBuyBoxStatus,
    currentProduct,
    setCurrentProduct,
    clearCurrentProduct
  } = useBuyBox();
  
  const [selectedMarketplace, setSelectedMarketplace] = useState('amazon');
  const { colorMode } = useColorMode();
  const statBgColor = colorMode === 'light' ? 'gray.50' : 'gray.700';
  const bgColor = colorMode === 'light' ? 'white' : 'gray.800';
  
  // Load buy box histories when marketplace changes
  useEffect(() => {
    getBuyBoxHistoriesByMarketplace(selectedMarketplace);
  }, [selectedMarketplace, getBuyBoxHistoriesByMarketplace]);
  
  // Calculate filtered histories based on selected marketplace
  const filteredHistories = buyBoxHistories?.filter(
    h => h.marketplaceId === selectedMarketplace
  ) || [];
  
  // Calculate buy box ownership stats
  const ownedCount = filteredHistories.filter(
    h => h.lastSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED
  ).length;
  
  const notOwnedCount = filteredHistories.filter(
    h => h.lastSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.NOT_OWNED
  ).length;
  
  const ownedPercentage = filteredHistories.length > 0
    ? (ownedCount / filteredHistories.length) * 100 
    : 0;
  
  // Get average win percentage across all products
  const averageWinPercentage = filteredHistories.length > 0
    ? filteredHistories.reduce((sum, h) => sum + (h.buyBoxWinPercentage || 0), 0) / filteredHistories.length
    : 0;
  
  // Get products with pricing opportunities
  const pricingOpportunities = filteredHistories.filter(
    h => h.lastSnapshot.hasPricingOpportunity
  );
  
  // Handler for refreshing product buy box status
  const handleRefreshProduct = async (productId: string, marketplaceId: string, marketplaceProductId: string) => {
    await checkBuyBoxStatus(productId, marketplaceId, marketplaceProductId);
  };
  
  // Handler for selecting a product to view details
  const handleSelectProduct = (history: BuyBoxHistory) => {
    setCurrentProduct(history.productId, history.marketplaceId);
  };
  
  return (
    <Container maxW="7xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg">Buy Box Dashboard</Heading>
          <Text color="gray.600">
            Monitor your Buy Box performance
          </Text>
        </Box>
        <HStack>
          <Select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            w="150px"
          >
            <option value="amazon">Amazon</option>
            <option value="takealot">Takealot</option>
          </Select>
          <Button
            leftIcon={<RefreshCcw size={16} />}
            loading={loading}
            onClick={() => getBuyBoxHistoriesByMarketplace(selectedMarketplace)}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>
      
      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={6}>
        <Card>
          <CardBody bg={statBgColor}>
            <Stat>
              <StatLabel>Total Products</StatLabel>
              <StatNumber>{filteredHistories.length}</StatNumber>
              <StatHelpText>Monitored on {selectedMarketplace}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody bg={statBgColor}>
            <Stat>
              <StatLabel>Buy Box Ownership</StatLabel>
              <StatNumber>
                {formatPercentage(ownedPercentage)}
              </StatNumber>
              <StatHelpText>
                {ownedCount} of {filteredHistories.length} products
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody bg={statBgColor}>
            <Stat>
              <StatLabel>Avg. 30-Day Win Rate</StatLabel>
              <StatNumber>
                {formatPercentage(averageWinPercentage)}
              </StatNumber>
              <StatHelpText>
                <StatArrow type={averageWinPercentage > ownedPercentage ? 'increase' : 'decrease'} />
                {formatPercentage(Math.abs(averageWinPercentage - ownedPercentage))} from current
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody bg={statBgColor}>
            <Stat>
              <StatLabel>Pricing Opportunities</StatLabel>
              <StatNumber>{pricingOpportunities.length}</StatNumber>
              <StatHelpText>Products to optimize</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {loading && !filteredHistories.length ? (
        <Flex justifyContent="center" py={10}>
          <VStack>
            <Spinner size="xl" />
            <Text mt={4}>Loading Buy Box data...</Text>
          </VStack>
        </Flex>
      ) : (
        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
          {/* Product List */}
          <GridItem>
            <Card bg={bgColor} shadow="md" height="700px" overflowY="auto">
              <CardHeader>
                <Heading size="md">Products</Heading>
              </CardHeader>
              <CardBody p={0}>
                <VStack gap={0} align="stretch">
                  {filteredHistories.map((history) => (
                    <Box
                      key={history.id}
                      p={4}
                      borderBottomWidth="1px"
                      cursor="pointer"
                      onClick={() => handleSelectProduct(history)}
                      bg={currentProduct?.productId === history.productId &&
                          currentProduct?.marketplaceId === history.marketplaceId
                          ? 'blue.50' : undefined}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <VStack align="start" gap={1}>
                          <Text fontWeight="medium">{history.sku}</Text>
                          {history.lastSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.OWNED ? (
                            <HStack>
                              <CheckCircle size={16} color="green" />
                              <Text fontSize="sm" color="green.500">Owning Buy Box</Text>
                            </HStack>
                          ) : history.lastSnapshot.ownBuyBoxStatus === BuyBoxOwnershipStatus.NOT_OWNED ? (
                            <HStack>
                              <AlertTriangle size={16} color="red" />
                              <Text fontSize="sm" color="red.500">Not Owning Buy Box</Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500">
                              {history.lastSnapshot.ownBuyBoxStatus.replace('_', ' ')}
                            </Text>
                          )}
                        </VStack>
                        
                        <VStack align="end" gap={1}>
                          <Text fontWeight="bold">{formatPrice(history.lastSnapshot.ownSellerPrice)}</Text>
                          {history.lastSnapshot.hasPricingOpportunity && (
                            <Badge colorScheme="yellow">Opportunity</Badge>
                          )}
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                  
                  {filteredHistories.length === 0 && (
                    <Box p={8} textAlign="center">
                      <Text color="gray.500" mb={4}>No products found</Text>
                      <Button leftIcon={<Plus size={16} />} colorScheme="blue">
                        Initialize Products
                      </Button>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          
          {/* Product Details */}
          <GridItem>
            {currentProduct && currentProduct.history ? (
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Competitors</Tab>
                  <Tab>History</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel px={0}>
                    <BuyBoxStatusCard
                      history={currentProduct.history}
                      onRefresh={() => handleRefreshProduct(
                        currentProduct.productId,
                        currentProduct.marketplaceId,
                        currentProduct.history.marketplaceProductId
                      )}
                      isRefreshing={isChecking}
                    />
                  </TabPanel>
                  
                  {/* Competitors Tab */}
                  <TabPanel px={0}>
                    <Card bg={bgColor} shadow="md">
                      <CardHeader>
                        <Heading size="md">Competitor Analysis</Heading>
                      </CardHeader>
                      <CardBody>
                        <CompetitorTable
                          competitors={currentProduct.history.lastSnapshot.competitors}
                          currencyCode={currentProduct.marketplaceId === 'takealot' ? 'ZAR' : 'USD'}
                        />
                      </CardBody>
                    </Card>
                  </TabPanel>
                  
                  {/* History Tab */}
                  <TabPanel px={0}>
                    <BuyBoxTimeline history={currentProduct.history} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : (
              <Card bg={bgColor} shadow="md" height="500px">
                <CardBody>
                  <Flex justifyContent="center" alignItems="center" height="100%">
                    <VStack gap={4}>
                      <Text color="gray.500">Select a product to view details</Text>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            )}
          </GridItem>
        </Grid>
      )}
    </Container>
  );
};

export default BuyBoxDashboardPage;`;

try {
  fs.writeFileSync(sourceFilePath, fixedContent);
  console.log('✅ Fixed src/features/buybox/pages/BuyBoxDashboardPage.tsx');
} catch (error) {
  console.error('❌ Error fixing BuyBoxDashboardPage.tsx:', error);
}

console.log('✅ All fixes applied');