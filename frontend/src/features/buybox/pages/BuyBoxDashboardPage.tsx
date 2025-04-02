import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

import React, { useEffect, useState } from 'react';
import { HStack  } from '@/utils/chakra-compat';
import { VStack  } from '@/utils/chakra-compat';
import { Grid  } from '@/utils/chakra-compat';
import { GridItem  } from '@/utils/chakra-compat';
import { Card  } from '@/utils/chakra-compat';
import { CardHeader  } from '@/utils/chakra-compat';
import { CardBody  } from '@/utils/chakra-compat';
import { Box  } from '@/utils/chakra-compat';
import { Container  } from '@/utils/chakra-compat';
import { Flex  } from '@/utils/chakra-compat';
import { Heading  } from '@/utils/chakra-compat';
import { Text  } from '@/utils/chakra-compat';
import { Badge  } from '@/utils/chakra-compat';
import { Button  } from '@/utils/chakra-compat';
import { Select  } from '@/utils/chakra-compat';
import { Spinner  } from '@/utils/chakra-compat';
import { SimpleGrid  } from '@/utils/chakra-compat';
import { Tabs  } from '@/utils/chakra-compat';
import { TabList  } from '@/utils/chakra-compat';
import { TabPanels  } from '@/utils/chakra-compat';
import { TabPanel  } from '@/utils/chakra-compat';
import { Tab  } from '@/utils/chakra-compat';
import { Stat  } from '@/utils/chakra-compat';
import { StatLabel  } from '@/utils/chakra-compat';
import { StatNumber  } from '@/utils/chakra-compat';
import { StatHelpText  } from '@/utils/chakra-compat';
import { StatArrow  } from '@/utils/chakra-compat';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCcw,
  Plus
} from 'lucide-react';
import { useColorMode } from '@/components/stubs/ChakraStubs';;
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
  useEffect((_: any) => {
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
    ? filteredHistories.reduce((sum: any, h: any) => sum + (h.buyBoxWinPercentage || 0), 0) / filteredHistories.length
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
            onChange={(e: any) => setSelectedMarketplace(e.target.value)}
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
            <Spinner size="xl"                                                                                       />
            <Text mt={4}>Loading Buy Box data...</Text>
          </VStack>
        </Flex>
      ) : (
        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' } as ResponsiveValue<string>} gap={6}>
          {/* Product List */}
          <GridItem>
            <Card bg={bgColor} shadow="md" height="700px" overflowY="auto">
              <CardHeader>
                <Heading size="md">Products</Heading>
              </CardHeader>
              <CardBody p={0}>
                <VStack gap={0} align="stretch">
                  {filteredHistories.map((history: any) => (
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

export default BuyBoxDashboardPage;