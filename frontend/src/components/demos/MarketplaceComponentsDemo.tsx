import { useState } from 'react';
import { 
  Container, Title, Grid, Stack, Group, Text, Tabs,
  ThemeIcon, ActionIcon, Button, Switch
} from '@mantine/core';
import { 
  IconShoppingCart, IconRefresh, IconSettings, 
  IconPlugConnected, IconChartBar, IconArrowsShuffle
} from '@tabler/icons-react';
import MarketplaceConnector, { MarketplaceConnection, MarketplaceType } from '../marketplace/MarketplaceConnector';
import MarketplaceStatusDashboard, { MarketplaceStatus, SyncStatus } from '../marketplace/MarketplaceStatusDashboard';
import MarketplaceComparison, { MarketplacePerformance } from '../marketplace/MarketplaceComparison';
import AIProcessingIndicator from '../ai/AIProcessingIndicator';

export const MarketplaceComponentsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('connector');
  const [processing, setProcessing] = useState(false);
  
  // Sample marketplace connections
  const [connections, setConnections] = useState<MarketplaceConnection[]>([
    {
      id: 'amazon-1',
      type: 'amazon',
      name: 'Amazon US',
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      credentials: {
        sellerId: 'AMAZON123',
        accessKey: 'ACCESS123',
        secretKey: 'SECRET123',
        region: 'us'
      }
    },
    {
      id: 'shopify-1',
      type: 'shopify',
      name: 'MyShop Storefront',
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      credentials: {
        shopUrl: 'myshop.myshopify.com',
        apiKey: 'KEY123',
        apiPassword: 'PASS123'
      }
    }
  ]);
  
  // Sample marketplace statuses
  const marketplaceStatuses: MarketplaceStatus[] = [
    {
      id: 'amazon-1',
      name: 'Amazon US',
      type: 'amazon',
      connected: true,
      healthScore: 92,
      syncStatus: [
        {
          type: 'inventory',
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          nextSync: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
          itemsProcessed: 1250,
          totalItems: 1250,
          status: 'success'
        },
        {
          type: 'orders',
          lastSync: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          nextSync: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
          itemsProcessed: 45,
          totalItems: 45,
          status: 'success'
        },
        {
          type: 'prices',
          lastSync: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
          nextSync: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
          itemsProcessed: 800,
          totalItems: 1200,
          status: 'in_progress'
        },
        {
          type: 'products',
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          nextSync: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
          itemsProcessed: 0,
          totalItems: 1250,
          status: 'pending'
        }
      ],
      stats: {
        products: 1250,
        orders: {
          today: 32,
          week: 198,
          month: 842
        },
        revenue: {
          today: 4250,
          week: 27800,
          month: 112500
        },
        inventory: {
          inStock: 1180,
          outOfStock: 25,
          lowStock: 45
        }
      }
    },
    {
      id: 'shopify-1',
      name: 'MyShop Storefront',
      type: 'shopify',
      connected: true,
      healthScore: 87,
      syncStatus: [
        {
          type: 'inventory',
          lastSync: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          nextSync: new Date(Date.now() + 1000 * 60 * 45), // 45 minutes from now
          itemsProcessed: 850,
          totalItems: 850,
          status: 'success'
        },
        {
          type: 'orders',
          lastSync: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          nextSync: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes from now
          itemsProcessed: 15,
          totalItems: 15,
          status: 'success'
        },
        {
          type: 'prices',
          lastSync: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          nextSync: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
          itemsProcessed: 0,
          totalItems: 850,
          status: 'error',
          errorMessage: 'API rate limit exceeded'
        },
        {
          type: 'products',
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          nextSync: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
          itemsProcessed: 0,
          totalItems: 850,
          status: 'pending'
        }
      ],
      stats: {
        products: 850,
        orders: {
          today: 15,
          week: 78,
          month: 320
        },
        revenue: {
          today: 1850,
          week: 9300,
          month: 39500
        },
        inventory: {
          inStock: 792,
          outOfStock: 18,
          lowStock: 40
        }
      }
    }
  ];
  
  // Sample marketplace performance data
  const marketplacePerformance: MarketplacePerformance[] = [
    {
      id: 'amazon-1',
      name: 'Amazon US',
      type: 'amazon',
      ranking: 1,
      metrics: {
        sales: {
          current: 112500,
          previous: 94200,
          change: 19.4
        },
        units: {
          current: 842,
          previous: 765,
          change: 10.1
        },
        conversion: {
          current: 5.8,
          previous: 5.2,
          change: 11.5
        },
        aov: {
          current: 133.6,
          previous: 123.1,
          change: 8.5
        },
        fee: {
          current: 15.0,
          previous: 15.0,
          change: 0
        },
        margin: {
          current: 27.5,
          previous: 28.2,
          change: -2.5
        }
      }
    },
    {
      id: 'shopify-1',
      name: 'MyShop Storefront',
      type: 'shopify',
      ranking: 2,
      metrics: {
        sales: {
          current: 39500,
          previous: 32800,
          change: 20.4
        },
        units: {
          current: 320,
          previous: 278,
          change: 15.1
        },
        conversion: {
          current: 2.8,
          previous: 2.4,
          change: 16.7
        },
        aov: {
          current: 123.4,
          previous: 118.0,
          change: 4.6
        },
        fee: {
          current: 3.5,
          previous: 3.5,
          change: 0
        },
        margin: {
          current: 38.2,
          previous: 37.5,
          change: 1.9
        }
      }
    },
    {
      id: 'takealot-1',
      name: 'Takealot',
      type: 'takealot',
      ranking: 3,
      metrics: {
        sales: {
          current: 22800,
          previous: 19500,
          change: 16.9
        },
        units: {
          current: 195,
          previous: 172,
          change: 13.4
        },
        conversion: {
          current: 3.2,
          previous: 2.9,
          change: 10.3
        },
        aov: {
          current: 116.9,
          previous: 113.4,
          change: 3.1
        },
        fee: {
          current: 12.0,
          previous: 12.0,
          change: 0
        },
        margin: {
          current: 31.5,
          previous: 30.8,
          change: 2.3
        }
      }
    }
  ];
  
  // Handle connect
  const handleConnect = async (type: MarketplaceType, credentials: Record<string, string>) => {
    console.log(`Connecting to ${type}`, credentials);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add new connection
    const newConnection: MarketplaceConnection = {
      id: `${type}-${Date.now()}`,
      type,
      name: type === 'amazon' ? 'Amazon US' : 
            type === 'shopify' ? 'MyShop Storefront' : 
            type === 'takealot' ? 'Takealot' : 
            type === 'woocommerce' ? 'WooCommerce Store' : 'eBay Store',
      status: 'connected',
      lastSync: new Date(),
      credentials
    };
    
    setConnections([...connections, newConnection]);
  };
  
  // Handle disconnect
  const handleDisconnect = async (connectionId: string) => {
    console.log(`Disconnecting ${connectionId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove connection
    setConnections(connections.filter(c => c.id !== connectionId));
  };
  
  // Handle refresh
  const handleRefresh = async (connectionId: string) => {
    console.log(`Refreshing ${connectionId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update lastSync
    setConnections(connections.map(c => c.id === connectionId
      ? { ...c, lastSync: new Date() }
      : c
    ));
  };
  
  // Handle refresh sync
  const handleRefreshSync = async (marketplaceId: string, syncType: SyncStatus['type']) => {
    console.log(`Refreshing ${syncType} sync for ${marketplaceId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  };
  
  return (
    <Container size="xl" py="xl">
      <Stack spacing="xl">
        <Title order={1}>Marketplace Integration</Title>
        
        <Group position="apart" mb="xs">
          <Text size="lg">Connect and monitor your marketplace integrations</Text>
          <Switch 
            label="AI Processing" 
            checked={processing} 
            onChange={(e) => setProcessing(e.currentTarget.checked)}
          />
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab 
              value="connector" 
              icon={<IconPlugConnected size={16} />}
            >
              Connection Manager
            </Tabs.Tab>
            <Tabs.Tab 
              value="status" 
              icon={<IconArrowsShuffle size={16} />}
            >
              Sync Status
            </Tabs.Tab>
            <Tabs.Tab 
              value="comparison" 
              icon={<IconChartBar size={16} />}
            >
              Marketplace Comparison
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="connector" pt="md">
            <AIProcessingIndicator active={processing}>
              <MarketplaceConnector
                connections={connections}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onRefresh={handleRefresh}
              />
            </AIProcessingIndicator>
          </Tabs.Panel>
          
          <Tabs.Panel value="status" pt="md">
            <AIProcessingIndicator active={processing}>
              <MarketplaceStatusDashboard
                marketplaces={marketplaceStatuses}
                onRefreshSync={handleRefreshSync}
              />
            </AIProcessingIndicator>
          </Tabs.Panel>
          
          <Tabs.Panel value="comparison" pt="md">
            <AIProcessingIndicator active={processing}>
              <MarketplaceComparison
                marketplaces={marketplacePerformance}
              />
            </AIProcessingIndicator>
          </Tabs.Panel>
        </Tabs>
        
        <Stack spacing="xs" mt="md">
          <Text weight={500}>Marketplace Integration Components</Text>
          <Text size="sm">
            These components provide a complete solution for managing marketplace connections, 
            monitoring sync status, and comparing performance across different marketplaces.
          </Text>
          
          <Grid mt="md">
            <Grid.Col span={4}>
              <Group spacing="xs">
                <ThemeIcon color="blue" variant="light">
                  <IconPlugConnected size={16} />
                </ThemeIcon>
                <Text weight={500} size="sm">Connection Manager</Text>
              </Group>
              <Text size="xs" color="dimmed">
                Add, configure, and manage marketplace connections with animated state transitions
              </Text>
            </Grid.Col>
            
            <Grid.Col span={4}>
              <Group spacing="xs">
                <ThemeIcon color="teal" variant="light">
                  <IconArrowsShuffle size={16} />
                </ThemeIcon>
                <Text weight={500} size="sm">Sync Status Dashboard</Text>
              </Group>
              <Text size="xs" color="dimmed">
                Monitor sync operations, view statistics, and perform maintenance tasks
              </Text>
            </Grid.Col>
            
            <Grid.Col span={4}>
              <Group spacing="xs">
                <ThemeIcon color="grape" variant="light">
                  <IconChartBar size={16} />
                </ThemeIcon>
                <Text weight={500} size="sm">Marketplace Comparison</Text>
              </Group>
              <Text size="xs" color="dimmed">
                Compare performance metrics across different marketplaces with animated visualizations
              </Text>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
};

export default MarketplaceComponentsDemo;