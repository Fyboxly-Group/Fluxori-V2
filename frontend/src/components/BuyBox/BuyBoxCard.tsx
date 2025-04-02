import React, { useEffect, useRef } from 'react';
import { Card, Text, Group, Badge, Title, ThemeIcon, Stack, Tooltip, ActionIcon, Menu, createStyles, useMantineTheme } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconDotsVertical, IconSettings, IconEye, IconRefresh, IconChartLine, IconBuildingStore } from '@tabler/icons-react';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

// Define styles for the component
const useStyles = createStyles((theme) => ({
  card: {
    overflow: 'visible',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows.md,
    },
  },
  statusBadge: {
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  differenceText: {
    fontWeight: 500,
  },
  winIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    transform: 'rotate(45deg)',
    overflow: 'hidden',
    zIndex: 1,
  },
  winIndicatorInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150%',
    height: '20px',
    backgroundColor: theme.colors.green[6],
    transform: 'translateY(15px) translateX(15px)',
    textAlign: 'center',
    lineHeight: '20px',
    color: theme.white,
    fontSize: '10px',
    fontWeight: 700,
  },
}));

export interface BuyBoxCardProps {
  /** Product name */
  productName: string;
  /** Product ID or SKU */
  productId: string;
  /** Current price */
  price: number;
  /** Currency symbol */
  currency?: string;
  /** Marketplace name */
  marketplace: string;
  /** Marketplace icon */
  marketplaceIcon?: React.ReactNode;
  /** Whether you currently own the Buy Box */
  hasWon: boolean;
  /** Distance from winning price (negative if you're cheaper, positive if competitor is cheaper) */
  priceDifference?: number;
  /** Number of competitors */
  competitorCount?: number;
  /** Last updated timestamp */
  lastUpdated?: Date;
  /** Whether data is currently refreshing */
  isRefreshing?: boolean;
  /** Function to refresh data */
  onRefresh?: () => void;
  /** Function to view product details */
  onViewDetails?: () => void;
  /** Function to view price history */
  onViewPriceHistory?: () => void;
  /** Function to view competitors */
  onViewCompetitors?: () => void;
  /** Function to edit repricing rules */
  onEditRules?: () => void;
}

/**
 * BuyBox status card that displays Buy Box win status with animations
 */
export const BuyBoxCard: React.FC<BuyBoxCardProps> = ({
  productName,
  productId,
  price,
  currency = '$',
  marketplace,
  marketplaceIcon,
  hasWon,
  priceDifference = 0,
  competitorCount = 0,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onViewDetails,
  onViewPriceHistory,
  onViewCompetitors,
  onEditRules,
}) => {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const priceRef = useRef<HTMLDivElement>(null);
  const winIndicatorRef = useRef<HTMLDivElement>(null);
  const cardRef = useAnimatedMount('scaleIn', { duration: 0.5 });
  
  // Format price difference
  const formattedDifference = priceDifference === 0 
    ? 'Same price' 
    : `${priceDifference > 0 ? '+' : ''}${currency}${Math.abs(priceDifference).toFixed(2)}`;
  
  // Determine if price difference is positive, negative, or neutral
  const priceStatus = priceDifference === 0 
    ? 'neutral' 
    : (priceDifference < 0 ? 'positive' : 'negative');
  
  // Format last updated time
  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';
  
  // Animate price when it changes
  useEffect(() => {
    if (!priceRef.current) return;
    
    // Create a price change animation
    gsap.fromTo(
      priceRef.current,
      { scale: 1.1, color: hasWon ? theme.colors.green[6] : theme.colors.blue[6] },
      { 
        scale: 1, 
        color: hasWon ? theme.colors.green[7] : theme.colors.dark[7],
        duration: 0.6, 
        ease: 'elastic.out(1.2, 0.5)' 
      }
    );
  }, [price, hasWon, theme.colors]);
  
  // Animate win indicator
  useEffect(() => {
    if (!winIndicatorRef.current || !hasWon) return;
    
    // Create win indicator animation
    gsap.fromTo(
      winIndicatorRef.current,
      { 
        scaleX: 0,
        opacity: 0,
      },
      { 
        scaleX: 1,
        opacity: 1,
        duration: 0.4, 
        ease: 'power3.out',
        delay: 0.2
      }
    );
  }, [hasWon]);
  
  return (
    <Card 
      p="lg" 
      radius="md" 
      withBorder 
      className={classes.card}
      ref={cardRef}
      pos="relative"
    >
      {/* Win indicator ribbon */}
      {hasWon && (
        <div className={classes.winIndicator}>
          <div className={classes.winIndicatorInner} ref={winIndicatorRef}>
            BUY BOX
          </div>
        </div>
      )}
      
      <Card.Section p="md" withBorder>
        <Group position="apart" mb={4}>
          <Badge 
            color={hasWon ? 'green' : 'blue'} 
            variant={hasWon ? 'filled' : 'light'}
            className={classes.statusBadge}
          >
            {hasWon ? 'BUY BOX WINNER' : 'MONITORING'}
          </Badge>
          
          <Group spacing={4}>
            <Tooltip label={`${competitorCount} competitors`}>
              <Badge 
                leftSection={
                  <ThemeIcon 
                    size={14} 
                    radius="xl" 
                    color={competitorCount > 0 ? 'orange' : 'gray'}
                    variant="filled"
                  >
                    <Text size="xs">{competitorCount}</Text>
                  </ThemeIcon>
                }
                variant="outline"
                size="sm"
                color="gray"
              >
                Competitors
              </Badge>
            </Tooltip>
            
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon>
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>Buy Box Options</Menu.Label>
                
                <Menu.Item
                  icon={<IconEye size={16} />}
                  onClick={onViewDetails}
                >
                  View Product
                </Menu.Item>
                
                <Menu.Item
                  icon={<IconChartLine size={16} />}
                  onClick={onViewPriceHistory}
                >
                  Price History
                </Menu.Item>
                
                <Menu.Item
                  icon={<IconBuildingStore size={16} />}
                  onClick={onViewCompetitors}
                >
                  View Competitors
                </Menu.Item>
                
                <Menu.Divider />
                
                <Menu.Item
                  icon={<IconSettings size={16} />}
                  onClick={onEditRules}
                >
                  Edit Pricing Rules
                </Menu.Item>
                
                <Menu.Item
                  icon={<IconRefresh size={16} />}
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  Refresh Data
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        
        <Title order={5} lineClamp={1} title={productName}>
          {productName}
        </Title>
        
        <Text size="xs" color="dimmed">
          {productId}
        </Text>
      </Card.Section>
      
      <Stack spacing="sm" mt="md">
        <Group position="apart" align="baseline">
          <Text size="sm" weight={500}>
            Current Price:
          </Text>
          
          <div ref={priceRef} className={classes.priceText}>
            {currency}{price.toFixed(2)}
          </div>
        </Group>
        
        <Group position="apart">
          <Text size="sm" weight={500}>
            Price Difference:
          </Text>
          
          <Group spacing={4}>
            {priceDifference !== 0 && (
              <ThemeIcon 
                color={priceStatus === 'positive' ? 'green' : (priceStatus === 'negative' ? 'red' : 'gray')} 
                variant="light" 
                size="sm"
              >
                {priceStatus === 'positive' ? (
                  <IconChevronDown size={14} />
                ) : priceStatus === 'negative' ? (
                  <IconChevronUp size={14} />
                ) : null}
              </ThemeIcon>
            )}
            
            <Text 
              className={classes.differenceText}
              color={priceStatus === 'positive' ? 'green' : (priceStatus === 'negative' ? 'red' : 'dimmed')}
              size="sm"
            >
              {formattedDifference}
            </Text>
          </Group>
        </Group>
        
        <Group position="apart">
          <Group spacing={4}>
            {marketplaceIcon || <IconBuildingStore size={16} />}
            <Text size="sm">{marketplace}</Text>
          </Group>
          
          <Text size="xs" color="dimmed">
            Updated: {formattedLastUpdated}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default BuyBoxCard;