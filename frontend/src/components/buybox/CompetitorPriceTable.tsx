import React, { useEffect, useRef } from 'react';
import { 
  Table, 
  Paper, 
  Text, 
  Group, 
  Badge, 
  useMantineTheme, 
  ScrollArea, 
  Box, 
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Title,
  Skeleton,
  Stack
} from '@mantine/core';
import { 
  IconStar, 
  IconTruck, 
  IconChevronUp, 
  IconChevronDown, 
  IconEqual,
  IconInfoCircle,
  IconTrophy,
  IconChecks,
  IconExclamationCircle
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { Competitor } from '@/types/buybox';
import gsap from 'gsap';

export interface CompetitorPriceTableProps {
  /** List of competitors */
  competitors: Competitor[];
  /** Your current price */
  yourPrice: number;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Currency symbol */
  currency?: string;
  /** Your product condition */
  yourCondition?: string;
  /** Your fulfillment type */
  yourFulfillment?: string;
  /** Title for the component */
  title?: string;
  /** Function called when a competitor is selected */
  onSelectCompetitor?: (competitor: Competitor) => void;
  /** Custom style */
  className?: string;
}

/**
 * Displays competitor pricing information in a sortable table
 * with GSAP animations for highlighting changes
 */
export const CompetitorPriceTable: React.FC<CompetitorPriceTableProps> = ({
  competitors,
  yourPrice,
  loading = false,
  currency = '$',
  yourCondition = 'New',
  yourFulfillment = 'FBA',
  title = 'Competitor Prices',
  onSelectCompetitor,
  className
}) => {
  const theme = useMantineTheme();
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const tableRef = useRef<HTMLTableElement>(null);
  const rowsRef = useStaggerAnimation({
    stagger: 0.05,
    delay: 0.3,
    y: 10,
    disabled: loading
  });
  
  // Get sort indicator
  const getSortIndicator = (field: string, direction: 'asc' | 'desc') => {
    return (
      <ActionIcon size="xs" variant="subtle">
        {direction === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </ActionIcon>
    );
  };
  
  // Highlight price differences
  const highlightPriceDiff = (price: number) => {
    const diff = price - yourPrice;
    const color = diff === 0 
      ? theme.colors.blue[6]
      : diff < 0 
        ? theme.colors.red[6] 
        : theme.colors.green[6];
        
    return (
      <Group spacing={4} position="right">
        <Text weight={600}>{currency}{price.toFixed(2)}</Text>
        {diff !== 0 && (
          <Text size="xs" color={diff < 0 ? "red" : "green"} weight={500}>
            {diff < 0 ? '-' : '+'}
            {currency}{Math.abs(diff).toFixed(2)}
          </Text>
        )}
      </Group>
    );
  };
  
  // Get fulfillment badge
  const getFulfillmentBadge = (type?: string) => {
    if (!type) return null;
    
    const color = type === 'FBA' 
      ? 'blue' 
      : type === 'FBM' 
        ? 'orange' 
        : 'gray';
        
    return (
      <Badge 
        color={color} 
        variant="light" 
        size="sm"
      >
        {type}
      </Badge>
    );
  };
  
  // Get condition badge
  const getConditionBadge = (condition?: string) => {
    if (!condition) return null;
    
    const color = condition === 'New' 
      ? 'green' 
      : condition === 'Used - Like New' 
        ? 'blue' 
        : condition === 'Used - Good' 
          ? 'yellow' 
          : condition === 'Used - Acceptable' 
            ? 'orange' 
            : 'gray';
            
    return (
      <Badge 
        color={color} 
        variant="outline" 
        size="sm"
      >
        {condition}
      </Badge>
    );
  };
  
  // Calculate total price with shipping
  const getTotalPrice = (price: number, shipping?: number) => {
    return price + (shipping || 0);
  };
  
  // Animate changes when competitors change
  useEffect(() => {
    if (loading || !tableRef.current) return;
    
    // Find rows with Buy Box
    const buyBoxRow = tableRef.current.querySelector('.buy-box-row');
    if (buyBoxRow) {
      gsap.fromTo(
        buyBoxRow,
        { backgroundColor: 'rgba(34, 139, 34, 0.2)' },
        { 
          backgroundColor: 'rgba(34, 139, 34, 0.05)', 
          duration: 1.5,
          ease: 'power2.out'
        }
      );
    }
  }, [competitors, loading]);
  
  // Render skeletons for loading state
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`}>
        <td><Skeleton height={20} width={30} /></td>
        <td><Skeleton height={20} width={120} /></td>
        <td><Skeleton height={20} width={80} /></td>
        <td><Skeleton height={20} width={60} /></td>
        <td><Skeleton height={20} width={80} /></td>
        <td><Skeleton height={20} width={60} /></td>
        <td><Skeleton height={20} width={80} /></td>
      </tr>
    ));
  };
  
  // Handle row click
  const handleRowClick = (competitor: Competitor) => {
    if (onSelectCompetitor) {
      // Animate the row before selecting
      const row = document.querySelector(`[data-competitor-id="${competitor.id}"]`);
      if (row) {
        gsap.fromTo(
          row,
          { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1] },
          { 
            backgroundColor: 'transparent', 
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => onSelectCompetitor(competitor)
          }
        );
      } else {
        onSelectCompetitor(competitor);
      }
    }
  };
  
  return (
    <Paper ref={containerRef} withBorder p="md" className={className} radius="md">
      <Group position="apart" mb="md">
        <Title order={4}>{title}</Title>
        <Badge size="lg">
          {competitors.length} {competitors.length === 1 ? 'Competitor' : 'Competitors'}
        </Badge>
      </Group>
      
      <ScrollArea>
        <Box ref={rowsRef}>
          <Table striped highlightOnHover ref={tableRef}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Seller</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th>Condition</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Shipping</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Your listing - always shown first */}
              <tr className="your-row" style={{ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0] }}>
                <td>
                  <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                    <IconChecks size={14} />
                  </ThemeIcon>
                </td>
                <td>
                  <Group spacing={4} noWrap>
                    <Text weight={700}>Your Listing</Text>
                  </Group>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Text weight={700}>{currency}{yourPrice.toFixed(2)}</Text>
                </td>
                <td>{getConditionBadge(yourCondition)}</td>
                <td>{getFulfillmentBadge(yourFulfillment)}</td>
                <td style={{ textAlign: 'right' }}>
                  <Text size="sm" color="dimmed">Included</Text>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Text weight={700}>{currency}{yourPrice.toFixed(2)}</Text>
                </td>
              </tr>
              
              {loading ? (
                renderSkeletons()
              ) : competitors.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <Text align="center" color="dimmed" py="md">
                      No competitor data available
                    </Text>
                  </td>
                </tr>
              ) : (
                competitors.map((competitor, index) => (
                  <tr 
                    key={competitor.id}
                    className={competitor.hasBuyBox ? 'buy-box-row' : ''}
                    data-competitor-id={competitor.id}
                    onClick={() => handleRowClick(competitor)}
                    style={{ cursor: onSelectCompetitor ? 'pointer' : 'default' }}
                  >
                    <td>
                      {competitor.hasBuyBox ? (
                        <Tooltip label="Has Buy Box">
                          <ThemeIcon size="sm" radius="xl" color="green">
                            <IconTrophy size={14} />
                          </ThemeIcon>
                        </Tooltip>
                      ) : (
                        <Text>{index + 1}</Text>
                      )}
                    </td>
                    <td>
                      <Group spacing={4} noWrap>
                        <Text weight={500}>{competitor.name}</Text>
                        {competitor.rating && (
                          <Group spacing={2} noWrap>
                            <IconStar size={14} color={theme.colors.yellow[6]} />
                            <Text size="xs">{competitor.rating.toFixed(1)}</Text>
                          </Group>
                        )}
                      </Group>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {highlightPriceDiff(competitor.price)}
                    </td>
                    <td>{getConditionBadge(competitor.condition)}</td>
                    <td>{getFulfillmentBadge(competitor.fulfillmentType)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {competitor.shipping !== undefined ? (
                        <Text>{currency}{competitor.shipping.toFixed(2)}</Text>
                      ) : (
                        <Text size="sm" color="dimmed">Included</Text>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Text weight={600}>
                        {currency}{getTotalPrice(competitor.price, competitor.shipping).toFixed(2)}
                      </Text>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Box>
      </ScrollArea>
      
      <Stack spacing={4} mt="md">
        <Group spacing={4}>
          <ThemeIcon size="xs" radius="xl" color="green">
            <IconTrophy size={12} />
          </ThemeIcon>
          <Text size="xs" color="dimmed">
            Indicates seller with Buy Box
          </Text>
        </Group>
        
        <Group spacing={4}>
          <ThemeIcon size="xs" radius="xl" color="blue" variant="light">
            <IconChecks size={12} />
          </ThemeIcon>
          <Text size="xs" color="dimmed">
            Your listing
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default CompetitorPriceTable;