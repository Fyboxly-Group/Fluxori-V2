import { useEffect, useRef, useState } from 'react';
import { 
  Paper, Title, Grid, Stack, Group, Text, Badge, 
  ThemeIcon, Progress, Card, Tabs, Button, ActionIcon,
  RingProgress, Tooltip
} from '@mantine/core';
import { 
  IconShoppingCart, IconArrowUpRight, IconArrowDownRight, 
  IconDatabase, IconList, IconAlertCircle, IconRefresh,
  IconClock, IconCalendarEvent, IconSettings, IconTruck
} from '@tabler/icons-react';
import { gsap } from 'gsap';
import { MarketplaceType } from './MarketplaceConnector';

export interface SyncStatus {
  type: 'inventory' | 'orders' | 'prices' | 'products';
  lastSync: Date;
  nextSync: Date;
  itemsProcessed: number;
  totalItems: number;
  status: 'success' | 'error' | 'in_progress' | 'pending';
  errorMessage?: string;
}

export interface MarketplaceStats {
  products: number;
  orders: {
    today: number;
    week: number;
    month: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  inventory: {
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
}

export interface MarketplaceStatus {
  id: string;
  name: string;
  type: MarketplaceType;
  connected: boolean;
  syncStatus: SyncStatus[];
  stats: MarketplaceStats;
  healthScore: number; // 0-100
}

export interface MarketplaceStatusDashboardProps {
  marketplaces: MarketplaceStatus[];
  onRefreshSync?: (marketplaceId: string, syncType: SyncStatus['type']) => Promise<void>;
  onViewDetails?: (marketplaceId: string) => void;
  onConfigureSync?: (marketplaceId: string, syncType: SyncStatus['type']) => void;
  className?: string;
}

export const MarketplaceStatusDashboard: React.FC<MarketplaceStatusDashboardProps> = ({
  marketplaces,
  onRefreshSync,
  onViewDetails,
  onConfigureSync,
  className
}) => {
  const [selectedTab, setSelectedTab] = useState<string | null>(marketplaces[0]?.id || null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<HTMLDivElement>(null);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // For past times
    if (diff < 0) {
      const pastDiff = Math.abs(diff);
      const minutes = Math.floor(pastDiff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    }
    
    // For future times
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `in ${days}d`;
    if (hours > 0) return `in ${hours}h`;
    if (minutes > 0) return `in ${minutes}m`;
    return 'Very soon';
  };
  
  // Handle refresh sync
  const handleRefreshSync = async (marketplaceId: string, syncType: SyncStatus['type']) => {
    if (onRefreshSync) {
      const syncElement = document.getElementById(`sync-${marketplaceId}-${syncType}`);
      if (syncElement) {
        // Animate the refresh icon
        const refreshIcon = syncElement.querySelector('.refresh-icon');
        if (refreshIcon) {
          gsap.to(refreshIcon, {
            rotation: 360,
            duration: 1,
            ease: 'power1.inOut',
            repeat: -1
          });
        }
        
        try {
          await onRefreshSync(marketplaceId, syncType);
          
          // Success animation
          if (syncElement) {
            gsap.fromTo(syncElement,
              { boxShadow: '0 0 0 0 rgba(0,200,0,0)' },
              { 
                boxShadow: '0 0 10px 0 rgba(0,200,0,0)',
                duration: 1,
                ease: 'elastic.out(1, 0.3)',
                background: 'linear-gradient(to right, rgba(0,255,0,0.05), transparent)',
                onComplete: () => {
                  gsap.to(syncElement, {
                    background: 'transparent',
                    boxShadow: '0 0 0 0 rgba(0,200,0,0)',
                    duration: 0.5
                  });
                }
              }
            );
          }
          
          // Update progress bar animation
          const progressBar = syncElement.querySelector('.progress-bar');
          if (progressBar) {
            gsap.from(progressBar, {
              width: '0%',
              duration: 0.8,
              ease: 'power2.out'
            });
          }
        } catch (error) {
          // Error animation
          if (syncElement) {
            gsap.to(syncElement, {
              x: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
              duration: 0.5,
              ease: 'power1.inOut'
            });
          }
        } finally {
          // Stop refresh icon animation
          const refreshIcon = syncElement.querySelector('.refresh-icon');
          if (refreshIcon) {
            gsap.killTweensOf(refreshIcon);
            gsap.to(refreshIcon, {
              rotation: 0,
              duration: 0.5,
              ease: 'power1.out'
            });
          }
        }
      }
    }
  };
  
  // Get color for health score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };
  
  // Get icon for sync type
  const getSyncIcon = (type: SyncStatus['type']) => {
    switch (type) {
      case 'inventory':
        return <IconDatabase size={16} />;
      case 'orders':
        return <IconList size={16} />;
      case 'prices':
        return <IconShoppingCart size={16} />;
      case 'products':
        return <IconTruck size={16} />;
    }
  };
  
  // Get status color
  const getStatusColor = (status: SyncStatus['status']) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'yellow';
    }
  };
  
  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      const header = containerRef.current.querySelector('.dashboard-header');
      const tabs = containerRef.current.querySelector('.mantine-Tabs-root');
      
      const tl = gsap.timeline();
      
      tl.fromTo(header,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      tl.fromTo(tabs,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, []);
  
  // Animate stats when tab changes
  useEffect(() => {
    if (statsRef.current && syncRef.current) {
      // Animate stats cards
      const statCards = statsRef.current.querySelectorAll('.stat-card');
      
      gsap.fromTo(statCards,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power2.out' 
        }
      );
      
      // Animate sync items
      const syncItems = syncRef.current.querySelectorAll('.sync-item');
      
      gsap.fromTo(syncItems,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power2.out',
          delay: 0.2
        }
      );
      
      // Animate progress bars
      const progressBars = syncRef.current.querySelectorAll('.progress-bar-container');
      
      gsap.fromTo(progressBars,
        { width: '0%' },
        { 
          width: '100%', 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power2.out',
          delay: 0.4
        }
      );
    }
  }, [selectedTab]);
  
  // Get the selected marketplace
  const selectedMarketplace = marketplaces.find(m => m.id === selectedTab) || marketplaces[0];
  
  return (
    <Paper ref={containerRef} p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="lg">
        <div className="dashboard-header">
          <Group position="apart">
            <div>
              <Title order={3}>Marketplace Status</Title>
              <Text size="sm" color="dimmed">
                Monitor your marketplace connections and sync status
              </Text>
            </div>
          </Group>
        </div>
        
        {marketplaces.length === 0 ? (
          <Paper withBorder p="xl" radius="sm" style={{ textAlign: 'center' }}>
            <Stack spacing="md" align="center">
              <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                <IconShoppingCart size={24} />
              </ThemeIcon>
              
              <div>
                <Text weight={500}>No marketplaces connected</Text>
                <Text size="sm" color="dimmed">
                  Connect to marketplaces to view their status and performance
                </Text>
              </div>
            </Stack>
          </Paper>
        ) : (
          <>
            <Tabs value={selectedTab} onTabChange={setSelectedTab}>
              <Tabs.List>
                {marketplaces.map(marketplace => (
                  <Tabs.Tab 
                    key={marketplace.id} 
                    value={marketplace.id}
                    icon={<IconShoppingCart size={16} />}
                  >
                    <Group spacing="xs">
                      <span>{marketplace.name}</span>
                      <Badge 
                        size="xs" 
                        color={marketplace.connected ? 'green' : 'red'}
                      >
                        {marketplace.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </Group>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
            
            {selectedMarketplace && (
              <>
                {/* Stats Section */}
                <div ref={statsRef}>
                  <Grid>
                    <Grid.Col span={3}>
                      <Card withBorder p="md" radius="sm" className="stat-card">
                        <Group position="apart" mb="xs">
                          <Text size="xs" color="dimmed" weight={500}>
                            HEALTH SCORE
                          </Text>
                        </Group>
                        
                        <Group position="apart" align="flex-end">
                          <RingProgress
                            size={80}
                            thickness={8}
                            roundCaps
                            sections={[
                              { 
                                value: selectedMarketplace.healthScore, 
                                color: getHealthColor(selectedMarketplace.healthScore) 
                              }
                            ]}
                            label={
                              <Text 
                                align="center" 
                                size="lg" 
                                weight={700}
                                color={getHealthColor(selectedMarketplace.healthScore)}
                              >
                                {selectedMarketplace.healthScore}%
                              </Text>
                            }
                          />
                          
                          <Stack spacing={0} align="flex-end">
                            <Text size="sm" weight={500}>
                              {selectedMarketplace.healthScore >= 80 ? 'Excellent' :
                               selectedMarketplace.healthScore >= 60 ? 'Good' :
                               selectedMarketplace.healthScore >= 40 ? 'Fair' : 'Poor'}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {selectedMarketplace.connected ? 'All systems operational' : 'Connection issues detected'}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={3}>
                      <Card withBorder p="md" radius="sm" className="stat-card">
                        <Group position="apart" mb="xs">
                          <Text size="xs" color="dimmed" weight={500}>
                            INVENTORY STATUS
                          </Text>
                        </Group>
                        
                        <Group position="apart" noWrap>
                          <div>
                            <Text weight={700} size="xl">
                              {selectedMarketplace.stats.inventory.inStock}
                            </Text>
                            <Text size="xs" color="dimmed">
                              In Stock Products
                            </Text>
                          </div>
                          
                          <Stack spacing={6}>
                            <Group spacing="xs">
                              <Badge color="red" size="sm">
                                {selectedMarketplace.stats.inventory.outOfStock}
                              </Badge>
                              <Text size="xs">Out of Stock</Text>
                            </Group>
                            
                            <Group spacing="xs">
                              <Badge color="yellow" size="sm">
                                {selectedMarketplace.stats.inventory.lowStock}
                              </Badge>
                              <Text size="xs">Low Stock</Text>
                            </Group>
                          </Stack>
                        </Group>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={3}>
                      <Card withBorder p="md" radius="sm" className="stat-card">
                        <Group position="apart" mb="xs">
                          <Text size="xs" color="dimmed" weight={500}>
                            ORDERS TODAY
                          </Text>
                          <Badge size="sm" color="gray">
                            24h
                          </Badge>
                        </Group>
                        
                        <Group position="apart">
                          <div>
                            <Text weight={700} size="xl">
                              {selectedMarketplace.stats.orders.today}
                            </Text>
                            <Text size="xs" color="dimmed">
                              Orders
                            </Text>
                          </div>
                          
                          <ThemeIcon 
                            size="xl" 
                            radius="xl"
                            color="blue"
                            variant="light"
                          >
                            <IconList size={20} />
                          </ThemeIcon>
                        </Group>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={3}>
                      <Card withBorder p="md" radius="sm" className="stat-card">
                        <Group position="apart" mb="xs">
                          <Text size="xs" color="dimmed" weight={500}>
                            REVENUE TODAY
                          </Text>
                          <Badge size="sm" color="gray">
                            24h
                          </Badge>
                        </Group>
                        
                        <Group position="apart">
                          <div>
                            <Text weight={700} size="xl">
                              {formatCurrency(selectedMarketplace.stats.revenue.today)}
                            </Text>
                            <Text size="xs" color="dimmed">
                              Revenue
                            </Text>
                          </div>
                          
                          <ThemeIcon 
                            size="xl" 
                            radius="xl"
                            color="green"
                            variant="light"
                          >
                            <IconArrowUpRight size={20} />
                          </ThemeIcon>
                        </Group>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </div>
                
                {/* Sync Status Section */}
                <div ref={syncRef}>
                  <Card withBorder radius="sm" p="md">
                    <Stack spacing="md">
                      <Group position="apart">
                        <Text weight={500}>Sync Status</Text>
                        
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={() => onViewDetails?.(selectedMarketplace.id)}
                          leftIcon={<IconSettings size={14} />}
                        >
                          Configure
                        </Button>
                      </Group>
                      
                      {selectedMarketplace.syncStatus.map(sync => {
                        const progressPercent = sync.status === 'in_progress'
                          ? (sync.itemsProcessed / sync.totalItems) * 100
                          : sync.status === 'success' ? 100 : 0;
                        
                        const statusColor = getStatusColor(sync.status);
                        const icon = getSyncIcon(sync.type);
                        
                        return (
                          <Paper 
                            key={sync.type}
                            id={`sync-${selectedMarketplace.id}-${sync.type}`}
                            withBorder 
                            p="md" 
                            radius="sm"
                            className="sync-item"
                          >
                            <Stack spacing="sm">
                              <Group position="apart">
                                <Group>
                                  <ThemeIcon color="blue" size="md" variant="light">
                                    {icon}
                                  </ThemeIcon>
                                  
                                  <div>
                                    <Text weight={500}>
                                      {sync.type.charAt(0).toUpperCase() + sync.type.slice(1)} Sync
                                    </Text>
                                    <Group spacing="xs">
                                      <Group spacing={4}>
                                        <IconClock size={12} />
                                        <Text size="xs">
                                          Last sync: {formatRelativeTime(sync.lastSync)}
                                        </Text>
                                      </Group>
                                      
                                      <Text size="xs" color="dimmed">•</Text>
                                      
                                      <Group spacing={4}>
                                        <IconCalendarEvent size={12} />
                                        <Text size="xs">
                                          Next sync: {formatRelativeTime(sync.nextSync)}
                                        </Text>
                                      </Group>
                                    </Group>
                                  </div>
                                </Group>
                                
                                <Group spacing="xs">
                                  <Tooltip label="Refresh sync">
                                    <ActionIcon
                                      color="blue"
                                      variant="light"
                                      onClick={() => handleRefreshSync(selectedMarketplace.id, sync.type)}
                                    >
                                      <IconRefresh className="refresh-icon" size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Configure">
                                    <ActionIcon
                                      color="gray"
                                      variant="light"
                                      onClick={() => onConfigureSync?.(selectedMarketplace.id, sync.type)}
                                    >
                                      <IconSettings size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>
                              </Group>
                              
                              <div className="progress-bar-container">
                                <Group position="apart" mb={5}>
                                  <Badge color={statusColor} size="sm">
                                    {sync.status}
                                  </Badge>
                                  
                                  {sync.status === 'in_progress' && (
                                    <Text size="xs" color="dimmed">
                                      {sync.itemsProcessed} / {sync.totalItems} items
                                    </Text>
                                  )}
                                  
                                  {sync.status === 'error' && (
                                    <Group spacing="xs">
                                      <IconAlertCircle size={14} color="red" />
                                      <Text size="xs" color="red">
                                        {sync.errorMessage || 'Sync error'}
                                      </Text>
                                    </Group>
                                  )}
                                </Group>
                                
                                <Progress
                                  value={progressPercent}
                                  color={statusColor}
                                  size="sm"
                                  radius="sm"
                                  className="progress-bar"
                                />
                              </div>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default MarketplaceStatusDashboard;