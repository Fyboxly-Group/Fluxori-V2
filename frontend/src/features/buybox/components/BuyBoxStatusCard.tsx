/// <reference path="../../../types/module-declarations.d.ts" />
import { Flex, Box, Card, CardHeader, CardBody, Heading, Text, Badge, Button, Spinner, Progress, HStack, VStack, Stat, StatLabel, StatNumber, StatHelpText, Tag, TagLabel, TagLeftIcon, Tooltip } from '@/utils/chakra-compat';
import { useColorModeValue } from '@/components/stubs/ChakraStubs';;
import { useColorMode } from '@/components/stubs/ChakraStubs';;;
import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Clock,
  RefreshCcw
} from 'lucide-react';
import { BuyBoxHistory, BuyBoxOwnershipStatus } from '../types/buybox.types';
import { formatDate, formatPrice, formatPercentage } from '../utils/format-utils';

interface BuyBoxStatusCardProps {
  history: BuyBoxHistory;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const BuyBoxStatusCard: React.FC<BuyBoxStatusCardProps> = ({
  history,
  onRefresh,
  isRefreshing
}) => {
  const snapshot = history.lastSnapshot;
  const bgColor = useColorModeValue('white', 'gray.700');
  const winBadgeBg = useColorModeValue('green.100', 'green.700');
  const loseBadgeBg = useColorModeValue('red.100', 'red.700');
  
  // Helper to get status badge
  const getStatusBadge = () => {
    switch (snapshot.ownBuyBoxStatus) {
      case BuyBoxOwnershipStatus.OWNED:
        return (
          <Badge 
            bg={winBadgeBg} 
            color="green.500" 
            p={2} 
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <CheckCircle mr={1} /> You Own the Buy Box
          </Badge>
        );
      case BuyBoxOwnershipStatus.NOT_OWNED:
        return (
          <Badge 
            bg={loseBadgeBg} 
            color="red.500" 
            p={2} 
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <AlertTriangle mr={1} /> Not Owning Buy Box
          </Badge>
        );
      case BuyBoxOwnershipStatus.SHARED:
        return (
          <Badge 
            bg="yellow.100" 
            color="yellow.700" 
            p={2} 
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <Info mr={1} /> Sharing Buy Box
          </Badge>
        );
      case BuyBoxOwnershipStatus.NO_BUY_BOX:
        return (
          <Badge 
            bg="gray.100" 
            color="gray.600" 
            p={2} 
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <Info mr={1} /> No Buy Box Available
          </Badge>
        );
      default:
        return (
          <Badge 
            bg="gray.100" 
            color="gray.600" 
            p={2} 
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <Info mr={1} /> Status Unknown
          </Badge>
        );
    }
  };
  
  return (
    <Card bg={bgColor} shadow="md" borderRadius="lg">
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="md">Buy Box Status</Heading>
            <Text color="gray.500" fontSize="sm">
              Last checked: {formatDate(snapshot.lastChecked.toDate())}
            </Text>
          </Box>
          <Button
            size="sm"
            leftIcon={isRefreshing ? <Spinner size="xs"   /> : <RefreshCcw />}
            onClick={onRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <VStack gap={4} align="stretch">
          {/* Status Badge */}
          <Flex justifyContent="center" py={2}>
            {getStatusBadge()}
          </Flex>
          
          {/* Win Percentage */}
          <Box>
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontWeight="medium">Buy Box Win Rate (30 days)</Text>
              <Text fontWeight="bold">{formatPercentage(history.buyBoxWinPercentage || 0)}</Text>
            </Flex>
            <Progress 
              value={history.buyBoxWinPercentage || 0} 
              colorScheme={history.buyBoxWinPercentage && history.buyBoxWinPercentage > 80 ? 'green' : 
                            history.buyBoxWinPercentage && history.buyBoxWinPercentage > 50 ? 'yellow' : 
                            'red'} 
              borderRadius="full"
              mt={1}
            />
          </Box>
          
          {/* Price Comparison */}
          <HStack gap={4} justify="space-between">
            <Stat>
              <StatLabel>Your Price</StatLabel>
              <StatNumber>{formatPrice(snapshot.ownSellerPrice)}</StatNumber>
              {snapshot.ownSellerPriceWithShipping && snapshot.ownSellerPrice !== snapshot.ownSellerPriceWithShipping && (
                <StatHelpText>
                  {formatPrice(snapshot.ownSellerPriceWithShipping)} with shipping
                </StatHelpText>
              )}
            </Stat>
            
            <Stat>
              <StatLabel>Buy Box Price</StatLabel>
              <StatNumber>
                {snapshot.buyBoxPrice ? formatPrice(snapshot.buyBoxPrice) : '-'}
              </StatNumber>
              {snapshot.buyBoxPriceWithShipping && snapshot.buyBoxPrice !== snapshot.buyBoxPriceWithShipping && (
                <StatHelpText>
                  {formatPrice(snapshot.buyBoxPriceWithShipping)} with shipping
                </StatHelpText>
              )}
            </Stat>
            
            <Stat>
              <StatLabel>Difference</StatLabel>
              <StatNumber>
                {snapshot.priceDifferenceAmount ? 
                  formatPrice(snapshot.priceDifferenceAmount) : 
                  '-'}
              </StatNumber>
              {snapshot.priceDifferencePercentage && (
                <StatHelpText>
                  {formatPercentage(snapshot.priceDifferencePercentage)} 
                  {snapshot.priceDifferenceAmount && snapshot.priceDifferenceAmount > 0 ? 
                    ' higher' : ' lower'}
                </StatHelpText>
              )}
            </Stat>
          </HStack>
          
          {/* Competitors */}
          <Box>
            <Text fontWeight="medium" mb={2}>Competitors ({snapshot.competitorCount})</Text>
            <HStack gap={2} flexWrap="wrap">
              {snapshot.competitors.slice(0, 5).map((competitor: any, index: any) => (
                <Tooltip 
                  key={index}
                  label={`${competitor.name}: ${formatPrice(competitor.price)}${competitor.isCurrentBuyBoxWinner ? ' (Buy Box Winner)' : ''}`}
                >
                  <Tag 
                    size="md" 
                    colorScheme={competitor.isCurrentBuyBoxWinner ? "green" : "gray"}
                    borderRadius="full"
                    mb={2}
                  >
                    {competitor.isCurrentBuyBoxWinner && <TagLeftIcon as={CheckCircle} />}
                    <TagLabel>{competitor.name.length > 15 ? competitor.name.substring(0, 15) + '...' : competitor.name}</TagLabel>
                  </Tag>
                </Tooltip>
              ))}
              {snapshot.competitorCount > 5 && (
                <Tag size="md" borderRadius="full" mb={2}>
                  +{snapshot.competitorCount - 5} more
                </Tag>
              )}
            </HStack>
          </Box>
          
          {/* Pricing Opportunity */}
          {snapshot.hasPricingOpportunity && (
            <Box p={3} bg="yellow.50" borderRadius="md">
              <Flex>
                <Box color="yellow.500" mr={2}>
                  <Info boxSize={5} />
                </Box>
                <Box>
                  <Text fontWeight="bold" color="yellow.700">Pricing Opportunity</Text>
                  <Text color="yellow.700">
                    Suggested price: {formatPrice(snapshot.suggestedPrice || 0)}
                  </Text>
                  {snapshot.suggestedPriceReason && (
                    <Text fontSize="sm" color="yellow.700" mt={1}>
                      {snapshot.suggestedPriceReason}
                    </Text>
                  )}
                </Box>
              </Flex>
            </Box>
          )}
          
          {/* Monitoring Status */}
          <Flex alignItems="center" justifyContent="space-between" mt={2}>
            <HStack>
              <Clock color={history.isMonitoring ? "green.500" : "gray.500"} />
              <Text fontSize="sm">
                {history.isMonitoring 
                  ? `Monitoring every ${history.monitoringFrequency} minutes` 
                  : 'Monitoring disabled'}
              </Text>
            </HStack>
            <Text fontSize="sm">SKU: {history.sku}</Text>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BuyBoxStatusCard;