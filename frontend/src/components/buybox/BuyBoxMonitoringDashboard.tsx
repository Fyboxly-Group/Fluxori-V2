import React, { useState } from 'react';
import { 
  Stack,
  Grid,
  Tabs,
  Paper,
  TextInput,
  Group,
  Select,
  ActionIcon,
  Tooltip,
  Badge,
  Switch,
  Text,
  Button,
  Box,
  Skeleton,
  ScrollArea
} from '@mantine/core';
import { 
  IconSearch, 
  IconFilter, 
  IconAdjustments, 
  IconTable, 
  IconLayoutGrid, 
  IconChartLine,
  IconTrophy,
  IconRefresh
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import { BuyBoxProduct, BuyBoxAnalytics, Marketplace } from '@/types/buybox';
import { CompetitorPriceTable } from './CompetitorPriceTable';
import { BuyBoxStatusCard } from './BuyBoxStatusCard';
import { BuyBoxWinRateChart } from './BuyBoxWinRateChart';
import { MarketPositionVisualization } from './MarketPositionVisualization';
import gsap from 'gsap';

export interface BuyBoxMonitoringDashboardProps {
  /** Product data for the dashboard */
  products: BuyBoxProduct[];
  /** Analytics data for the dashboard overview */
  analytics?: BuyBoxAnalytics;
  /** Function to handle search */
  onSearch?: (searchTerm: string) => void;
  /** Function to handle filter changes */
  onFilterChange?: (filters: any) => void;
  /** Function to handle refresh */
  onRefresh?: () => void;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Custom style */
  className?: string;
}

/**
 * Comprehensive Buy Box monitoring dashboard with real-time price tracking,
 * competitor analysis, and performance visualization
 */
export const BuyBoxMonitoringDashboard: React.FC<BuyBoxMonitoringDashboardProps> = ({
  products,
  analytics,
  onSearch,
  onFilterChange,
  onRefresh,
  loading = false,
  className
}) => {
  const containerRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const productsRef = useStaggerAnimation({ stagger: 0.05, y: 10, disabled: loading });
  
  // Local state
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplace, setMarketplace] = useState<string | null>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<BuyBoxProduct | null>(null);
  const [showOnlyBuyBox, setShowOnlyBuyBox] = useState(false);
  
  // Filtered products based on search and filters
  const filteredProducts = products.filter(product => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by marketplace
    const matchesMarketplace = marketplace === "all" || 
      product.marketplace === marketplace;
    
    // Filter by Buy Box status
    const matchesBuyBox = !showOnlyBuyBox || product.hasBuyBox;
    
    return matchesSearch && matchesMarketplace && matchesBuyBox;
  });
  
  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // Handle marketplace filter change
  const handleMarketplaceChange = (value: string | null) => {
    setMarketplace(value);
    if (onFilterChange) {
      onFilterChange({ marketplace: value });
    }
  };
  
  // Handle Buy Box filter toggle
  const handleBuyBoxToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyBuyBox(event.currentTarget.checked);
    if (onFilterChange) {
      onFilterChange({ showOnlyBuyBox: event.currentTarget.checked });
    }
  };
  
  // Handle product selection
  const handleProductSelect = (product: BuyBoxProduct) => {
    // Animate selection change
    if (selectedProduct && selectedProduct.id !== product.id) {
      const productElement = document.querySelector(`[data-product-id="${selectedProduct.id}"]`);
      if (productElement) {
        gsap.to(productElement, {
          scale: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          duration: 0.3
        });
      }
    }
    
    const newProductElement = document.querySelector(`[data-product-id="${product.id}"]`);
    if (newProductElement) {
      gsap.to(newProductElement, {
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        duration: 0.3
      });
    }
    
    setSelectedProduct(product);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    
    // Animate the refresh button
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
      gsap.to(refreshButton, {
        rotation: 360,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(refreshButton, { rotation: 0 });
        }
      });
    }
  };
  
  // Render product grid item
  const renderProductGridItem = (product: BuyBoxProduct) => {
    return (
      <Paper 
        key={product.id}
        withBorder
        p="md"
        radius="md"
        shadow="xs"
        data-product-id={product.id}
        onClick={() => handleProductSelect(product)}
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: selectedProduct?.id === product.id ? 'scale(1.02)' : 'scale(1)',
          boxShadow: selectedProduct?.id === product.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Stack spacing="xs">
          <Group position="apart">
            <Text weight={600} lineClamp={1}>{product.name}</Text>
            {product.hasBuyBox && (
              <Badge color="green" variant="filled">
                <Group spacing={4}>
                  <IconTrophy size={12} />
                  <span>Buy Box</span>
                </Group>
              </Badge>
            )}
          </Group>
          
          <Text size="xs" color="dimmed">SKU: {product.sku}</Text>
          
          <Group position="apart">
            <Text weight={700} size="lg">${product.price.toFixed(2)}</Text>
            <Badge color={product.buyBoxPrice > product.price ? "green" : "red"}>
              {product.buyBoxPrice > product.price ? '+' : ''}
              ${(product.price - product.buyBoxPrice).toFixed(2)}
            </Badge>
          </Group>
          
          <Group position="apart">
            <Text size="xs">Buy Box Win Rate:</Text>
            <Text weight={500} size="sm">{(product.buyBoxWinRate * 100).toFixed(1)}%</Text>
          </Group>
          
          <Group position="apart">
            <Badge color="blue" size="sm">{product.marketplace}</Badge>
            <Text size="xs">{product.competitors.length} competitors</Text>
          </Group>
        </Stack>
      </Paper>
    );
  };
  
  // Render loading skeletons for grid items
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Paper key={`skeleton-${index}`} withBorder p="md" radius="md">
        <Stack spacing="xs">
          <Skeleton height={20} width="70%" mb={4} />
          <Skeleton height={12} width="40%" mb={8} />
          <Skeleton height={24} width="30%" mb={8} />
          <Group position="apart">
            <Skeleton height={14} width="40%" />
            <Skeleton height={14} width="20%" />
          </Group>
          <Group position="apart">
            <Skeleton height={18} width="25%" />
            <Skeleton height={14} width="30%" />
          </Group>
        </Stack>
      </Paper>
    ));
  };
  
  return (
    <Stack ref={containerRef} spacing="md" className={className}>
      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" icon={<IconChartLine size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="products" icon={<IconTable size={16} />}>
            Products
          </Tabs.Tab>
          <Tabs.Tab value="rules" icon={<IconAdjustments size={16} />}>
            Repricing Rules
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          {analytics ? (
            <Stack spacing="md">
              <Grid gutter="md">
                <Grid.Col xs={12} sm={6} md={3}>
                  <Paper withBorder p="md" radius="md">
                    <Stack spacing="xs">
                      <Text size="sm" color="dimmed">Total Products</Text>
                      <Text weight={700} size="xl">{analytics.totalProducts}</Text>
                      <Text size="xs">{analytics.monitoredProducts} monitored</Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col xs={12} sm={6} md={3}>
                  <Paper withBorder p="md" radius="md">
                    <Stack spacing="xs">
                      <Text size="sm" color="dimmed">Buy Box Win Rate</Text>
                      <Text weight={700} size="xl">{(analytics.buyBoxWinRate * 100).toFixed(1)}%</Text>
                      <Text size="xs">{analytics.lastDayWins} wins in last 24h</Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col xs={12} sm={6} md={3}>
                  <Paper withBorder p="md" radius="md">
                    <Stack spacing="xs">
                      <Text size="sm" color="dimmed">Active Rules</Text>
                      <Text weight={700} size="xl">{analytics.activeRules}</Text>
                      <Text size="xs">of {analytics.totalRules} total rules</Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
                
                <Grid.Col xs={12} sm={6} md={3}>
                  <Paper withBorder p="md" radius="md">
                    <Stack spacing="xs">
                      <Text size="sm" color="dimmed">Repricing Events</Text>
                      <Text weight={700} size="xl">{analytics.lastDayEvents}</Text>
                      <Text size="xs">in the last 24 hours</Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              <Grid gutter="md">
                <Grid.Col xs={12} md={8}>
                  <BuyBoxWinRateChart 
                    winRateData={analytics.marketplaceDistribution.map((item, index) => ({
                      date: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000),
                      winRate: item.winRate,
                      totalProducts: item.count
                    }))}
                    currentWinRate={analytics.buyBoxWinRate}
                  />
                </Grid.Col>
                
                <Grid.Col xs={12} md={4}>
                  <Paper withBorder p="md" radius="md">
                    <Stack spacing="md">
                      <Text weight={600}>Top Performing Products</Text>
                      {analytics.topPerformingProducts.map((product, index) => (
                        <Group key={product.id} position="apart">
                          <Group spacing={8}>
                            <Text size="sm" weight={500}>{index + 1}.</Text>
                            <Text size="sm" lineClamp={1}>{product.name}</Text>
                          </Group>
                          <Badge color="green">{(product.winRate * 100).toFixed(1)}%</Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
              
              <Paper withBorder p="md" radius="md">
                <Stack spacing="md">
                  <Text weight={600}>Recent Repricing Events</Text>
                  <ScrollArea style={{ height: 200 }}>
                    <Stack spacing="xs">
                      {analytics.recentEvents.map((event) => (
                        <Group key={event.id} position="apart">
                          <Stack spacing={2}>
                            <Text size="sm" weight={500}>{event.productName}</Text>
                            <Text size="xs" color="dimmed">
                              {event.ruleName} • {new Date(event.timestamp).toLocaleString()}
                            </Text>
                          </Stack>
                          <Group spacing={8}>
                            <Text size="sm" strike={!event.buyBoxWon}>${event.previousPrice.toFixed(2)}</Text>
                            <Text size="sm" weight={600}>${event.newPrice.toFixed(2)}</Text>
                            <Badge color={event.buyBoxWon ? "green" : "gray"} size="sm">
                              {event.buyBoxWon ? "Won" : "Lost"}
                            </Badge>
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Stack>
              </Paper>
            </Stack>
          ) : loading ? (
            <Stack spacing="md">
              <Grid gutter="md">
                {Array(4).fill(0).map((_, i) => (
                  <Grid.Col key={i} xs={12} sm={6} md={3}>
                    <Skeleton height={100} radius="md" />
                  </Grid.Col>
                ))}
              </Grid>
              <Skeleton height={300} radius="md" />
              <Grid gutter="md">
                <Grid.Col xs={12} md={8}>
                  <Skeleton height={200} radius="md" />
                </Grid.Col>
                <Grid.Col xs={12} md={4}>
                  <Skeleton height={200} radius="md" />
                </Grid.Col>
              </Grid>
            </Stack>
          ) : (
            <Text align="center" color="dimmed">No analytics data available</Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="products" pt="md">
          <Stack spacing="md">
            <Group position="apart">
              <Group>
                <TextInput
                  placeholder="Search by name or SKU"
                  icon={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ width: 250 }}
                />
                
                <Select
                  placeholder="Marketplace"
                  value={marketplace}
                  onChange={handleMarketplaceChange}
                  data={[
                    { value: 'all', label: 'All Marketplaces' },
                    { value: 'amazon', label: 'Amazon' },
                    { value: 'takealot', label: 'Takealot' },
                    { value: 'shopify', label: 'Shopify' },
                    { value: 'other', label: 'Other' }
                  ]}
                  icon={<IconFilter size={16} />}
                  style={{ width: 180 }}
                />
                
                <Group spacing={8}>
                  <Switch
                    checked={showOnlyBuyBox}
                    onChange={handleBuyBoxToggle}
                    size="sm"
                  />
                  <Text size="sm">Only Buy Box Winners</Text>
                </Group>
              </Group>
              
              <Group>
                <ActionIcon.Group>
                  <ActionIcon
                    variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                    color={viewMode === 'grid' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <IconLayoutGrid size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant={viewMode === 'table' ? 'filled' : 'subtle'}
                    color={viewMode === 'table' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    <IconTable size={18} />
                  </ActionIcon>
                </ActionIcon.Group>
                
                <Tooltip label="Refresh data">
                  <ActionIcon onClick={handleRefresh} className="refresh-button">
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
            
            <Grid gutter="md">
              <Grid.Col xs={12} md={selectedProduct ? 8 : 12}>
                {viewMode === 'grid' ? (
                  <div ref={productsRef}>
                    <Grid gutter="md">
                      {loading ? (
                        renderSkeletons()
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <Grid.Col key={product.id} xs={12} sm={6} md={selectedProduct ? 6 : 4} lg={selectedProduct ? 4 : 3}>
                            {renderProductGridItem(product)}
                          </Grid.Col>
                        ))
                      ) : (
                        <Grid.Col xs={12}>
                          <Text align="center" color="dimmed" py="xl">No products match the current filters</Text>
                        </Grid.Col>
                      )}
                    </Grid>
                  </div>
                ) : (
                  <Paper withBorder p="md" radius="md">
                    <ScrollArea>
                      <Box ref={productsRef}>
                        {/* Table implementation would go here */}
                        <Text align="center" color="dimmed">Table view is not implemented in this preview</Text>
                      </Box>
                    </ScrollArea>
                  </Paper>
                )}
              </Grid.Col>
              
              {selectedProduct && (
                <Grid.Col xs={12} md={4}>
                  <Stack spacing="md">
                    <BuyBoxStatusCard
                      hasWon={selectedProduct.hasBuyBox}
                      previousOwner={selectedProduct.hasBuyBox ? 'You' : selectedProduct.competitors.find(c => c.hasBuyBox)?.name || 'Unknown'}
                      currentOwner={selectedProduct.hasBuyBox ? 'You' : selectedProduct.competitors.find(c => c.hasBuyBox)?.name || 'Unknown'}
                      yourPrice={selectedProduct.price}
                      competitorPrice={selectedProduct.hasBuyBox ? undefined : selectedProduct.competitors.find(c => c.hasBuyBox)?.price}
                      previousPrice={selectedProduct.previousPrice}
                    />
                    
                    <MarketPositionVisualization
                      product={selectedProduct}
                      width={350}
                      height={180}
                    />
                    
                    <CompetitorPriceTable
                      competitors={selectedProduct.competitors}
                      yourPrice={selectedProduct.price}
                    />
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="rules" pt="md">
          <Text align="center" color="dimmed" py="xl">
            Repricing rules management is not implemented in this preview
          </Text>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default BuyBoxMonitoringDashboard;