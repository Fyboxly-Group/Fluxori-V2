import { useEffect, useRef, useState } from 'react';
import { 
  Paper, Title, Stack, Group, Text, Badge, Button,
  ThemeIcon, Select, TextInput, PasswordInput, Switch,
  Collapse, Divider, Accordion, ActionIcon, Box, Progress
} from '@mantine/core';
import { 
  IconPlug, IconPlugConnected, IconShoppingCart, 
  IconArrowsShuffle, IconRefresh, IconAlertCircle,
  IconCircleCheck, IconShield, IconKey, IconTrash
} from '@tabler/icons-react';
import { gsap } from 'gsap';

// Marketplace types
export type MarketplaceType = 'amazon' | 'shopify' | 'takealot' | 'woocommerce' | 'ebay';

interface MarketplaceInfo {
  id: string;
  name: string;
  type: MarketplaceType;
  description: string;
  icon: React.ReactNode;
  color: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'select';
    required: boolean;
    options?: { value: string; label: string }[];
  }[];
}

// Available marketplaces
const MARKETPLACES: MarketplaceInfo[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    type: 'amazon',
    description: 'Connect your Amazon Seller Central account',
    icon: <IconShoppingCart size={18} />,
    color: 'orange',
    fields: [
      { name: 'sellerId', label: 'Seller ID', type: 'text', required: true },
      { name: 'accessKey', label: 'Access Key', type: 'text', required: true },
      { name: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { name: 'region', label: 'Marketplace Region', type: 'select', required: true, 
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'eu', label: 'Europe' },
          { value: 'au', label: 'Australia' }
        ]
      }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    type: 'shopify',
    description: 'Connect your Shopify store',
    icon: <IconShoppingCart size={18} />,
    color: 'green',
    fields: [
      { name: 'shopUrl', label: 'Shop URL', type: 'text', required: true },
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiPassword', label: 'API Password', type: 'password', required: true }
    ]
  },
  {
    id: 'takealot',
    name: 'Takealot',
    type: 'takealot',
    description: 'Connect your Takealot seller account',
    icon: <IconShoppingCart size={18} />,
    color: 'blue',
    fields: [
      { name: 'sellerId', label: 'Seller ID', type: 'text', required: true },
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    type: 'woocommerce',
    description: 'Connect your WooCommerce store',
    icon: <IconShoppingCart size={18} />,
    color: 'indigo',
    fields: [
      { name: 'siteUrl', label: 'Site URL', type: 'text', required: true },
      { name: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
      { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'ebay',
    name: 'eBay',
    type: 'ebay',
    description: 'Connect your eBay seller account',
    icon: <IconShoppingCart size={18} />,
    color: 'red',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refreshToken', label: 'Refresh Token', type: 'text', required: true }
    ]
  }
];

export interface MarketplaceConnection {
  id: string;
  type: MarketplaceType;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastSync?: Date;
  credentials: Record<string, string>;
  error?: string;
}

export interface MarketplaceConnectorProps {
  connections: MarketplaceConnection[];
  onConnect?: (type: MarketplaceType, credentials: Record<string, string>) => Promise<void>;
  onDisconnect?: (connectionId: string) => Promise<void>;
  onRefresh?: (connectionId: string) => Promise<void>;
  className?: string;
}

export const MarketplaceConnector: React.FC<MarketplaceConnectorProps> = ({
  connections,
  onConnect,
  onDisconnect,
  onRefresh,
  className
}) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);
  
  // Reset form when marketplace changes
  useEffect(() => {
    setFormValues({});
  }, [selectedMarketplace]);
  
  // Update field value
  const handleFieldChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle connect button click
  const handleConnect = async () => {
    if (!selectedMarketplace) return;
    
    const marketplace = MARKETPLACES.find(m => m.id === selectedMarketplace);
    if (!marketplace) return;
    
    // Check if all required fields are filled
    const missingFields = marketplace.fields
      .filter(field => field.required && !formValues[field.name]);
    
    if (missingFields.length > 0) {
      // Shake the form to indicate validation error
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
          duration: 0.6,
          ease: 'power1.inOut'
        });
      }
      return;
    }
    
    // Show connecting animation
    setConnecting(true);
    
    // Animate the connector icon to show connection in progress
    if (formRef.current) {
      const connectButton = formRef.current.querySelector('.connect-button');
      if (connectButton) {
        gsap.to(connectButton, {
          scale: 0.95,
          duration: 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }
    
    try {
      if (onConnect) {
        await onConnect(marketplace.type, formValues);
      }
      
      // Success animation
      if (formRef.current) {
        const successIcon = formRef.current.querySelector('.success-icon');
        if (successIcon) {
          gsap.fromTo(successIcon,
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.5, 
              ease: 'back.out(1.7)' 
            }
          );
        }
      }
      
      // Reset form
      setSelectedMarketplace(null);
      setFormValues({});
      setFormVisible(false);
    } catch (error) {
      // Error animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
          duration: 0.6,
          ease: 'power1.inOut'
        });
      }
    } finally {
      setConnecting(false);
      
      // Stop button animation
      if (formRef.current) {
        const connectButton = formRef.current.querySelector('.connect-button');
        if (connectButton) {
          gsap.killTweensOf(connectButton);
          gsap.to(connectButton, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out'
          });
        }
      }
    }
  };
  
  // Handle disconnect button click
  const handleDisconnect = async (connectionId: string) => {
    if (onDisconnect) {
      const connectionEl = document.getElementById(`connection-${connectionId}`);
      
      if (connectionEl) {
        // Start shaking animation
        gsap.to(connectionEl, {
          x: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
          duration: 0.5,
          ease: 'power1.inOut'
        });
        
        // Animate status badge
        const statusBadge = connectionEl.querySelector('.status-badge');
        if (statusBadge) {
          gsap.to(statusBadge, {
            backgroundColor: 'var(--mantine-color-red-6)',
            color: 'white',
            duration: 0.3
          });
        }
      }
      
      try {
        await onDisconnect(connectionId);
        
        // Success animation - fade out the connection
        if (connectionEl) {
          gsap.to(connectionEl, {
            opacity: 0,
            height: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.5,
            ease: 'power2.inOut'
          });
        }
      } catch (error) {
        // Error animation - reset the connection
        if (connectionEl) {
          gsap.to(connectionEl, {
            opacity: 1,
            duration: 0.3
          });
          
          // Reset status badge
          const statusBadge = connectionEl.querySelector('.status-badge');
          if (statusBadge) {
            gsap.to(statusBadge, {
              backgroundColor: 'var(--mantine-color-green-6)',
              duration: 0.3
            });
          }
        }
      }
    }
  };
  
  // Handle refresh button click
  const handleRefresh = async (connectionId: string) => {
    if (onRefresh) {
      const refreshButton = document.getElementById(`refresh-${connectionId}`);
      
      if (refreshButton) {
        // Start rotating animation
        gsap.to(refreshButton, {
          rotation: 360,
          duration: 1,
          ease: 'power1.inOut',
          repeat: -1
        });
      }
      
      try {
        await onRefresh(connectionId);
        
        // Success animation
        if (refreshButton) {
          gsap.killTweensOf(refreshButton);
          gsap.to(refreshButton, {
            rotation: 0,
            duration: 0.5,
            ease: 'power1.out'
          });
          
          // Pulse the connection
          const connectionEl = document.getElementById(`connection-${connectionId}`);
          if (connectionEl) {
            gsap.fromTo(connectionEl,
              { boxShadow: '0 0 0 0 rgba(0,200,0,0)' },
              { 
                boxShadow: '0 0 0 0 rgba(0,200,0,0)',
                duration: 1.5,
                ease: 'elastic.out(1, 0.3)',
                background: 'linear-gradient(to right, rgba(0,255,0,0.03), transparent)',
                onComplete: () => {
                  gsap.to(connectionEl, {
                    background: 'transparent',
                    duration: 0.5
                  });
                }
              }
            );
          }
        }
      } catch (error) {
        // Error animation
        if (refreshButton) {
          gsap.killTweensOf(refreshButton);
          gsap.to(refreshButton, {
            rotation: 0,
            duration: 0.5,
            ease: 'power1.out'
          });
          
          // Shake the connection
          const connectionEl = document.getElementById(`connection-${connectionId}`);
          if (connectionEl) {
            gsap.to(connectionEl, {
              x: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
              duration: 0.5,
              ease: 'power1.inOut'
            });
          }
        }
      }
    }
  };
  
  // Toggle form visibility
  const toggleForm = () => {
    setFormVisible(!formVisible);
    
    // Animate form visibility
    if (formRef.current) {
      if (!formVisible) {
        // Show form with animation
        gsap.fromTo(formRef.current,
          { height: 0, opacity: 0, overflow: 'hidden' },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.4, 
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(formRef.current, { clearProps: 'overflow,height' });
            }
          }
        );
      } else {
        // Hide form with animation
        gsap.to(formRef.current, {
          height: 0,
          opacity: 0,
          overflow: 'hidden',
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            setSelectedMarketplace(null);
            setFormValues({});
          }
        });
      }
    }
  };
  
  // Get marketplace info by type
  const getMarketplaceInfo = (type: MarketplaceType) => {
    return MARKETPLACES.find(m => m.type === type);
  };
  
  // Format date as relative time
  const formatRelativeTime = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
  
  // Get color and icon for connection status
  const getStatusInfo = (status: MarketplaceConnection['status']) => {
    switch (status) {
      case 'connected':
        return { color: 'green', icon: <IconCircleCheck size={16} /> };
      case 'disconnected':
        return { color: 'gray', icon: <IconPlug size={16} /> };
      case 'error':
        return { color: 'red', icon: <IconAlertCircle size={16} /> };
      case 'connecting':
        return { color: 'blue', icon: <IconArrowsShuffle size={16} /> };
    }
  };
  
  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      const header = containerRef.current.querySelector('.connector-header');
      
      gsap.fromTo(header,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      // Animate existing connections
      if (connectionsRef.current) {
        const connectionItems = connectionsRef.current.querySelectorAll('.connection-item');
        
        gsap.fromTo(connectionItems,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
          }
        );
      }
    }
  }, []);
  
  return (
    <Paper ref={containerRef} p="md" withBorder shadow="sm" className={className}>
      <Stack spacing="lg">
        <div className="connector-header">
          <Group position="apart">
            <div>
              <Title order={3}>Marketplace Connections</Title>
              <Text size="sm" color="dimmed">
                Connect to marketplaces to sync inventory, orders, and pricing
              </Text>
            </div>
            
            <Button 
              onClick={toggleForm}
              leftIcon={formVisible ? <IconTrash size={16} /> : <IconPlug size={16} />}
            >
              {formVisible ? 'Cancel' : 'Add Connection'}
            </Button>
          </Group>
        </div>
        
        {/* Connection Form */}
        <div 
          ref={formRef} 
          style={{ 
            display: formVisible ? 'block' : 'none',
            overflow: 'hidden'
          }}
        >
          <Paper withBorder p="md" radius="sm">
            <Stack spacing="md">
              <Select
                label="Select Marketplace"
                placeholder="Choose a marketplace to connect"
                data={MARKETPLACES.map(m => ({
                  value: m.id,
                  label: (
                    <Group>
                      <ThemeIcon color={m.color} size="sm">
                        {m.icon}
                      </ThemeIcon>
                      <span>{m.name}</span>
                    </Group>
                  )
                }))}
                itemComponent={({ label }) => label}
                value={selectedMarketplace}
                onChange={setSelectedMarketplace}
                size="md"
              />
              
              {selectedMarketplace && (
                <>
                  <Divider />
                  
                  {(() => {
                    const marketplace = MARKETPLACES.find(m => m.id === selectedMarketplace);
                    if (!marketplace) return null;
                    
                    return (
                      <Stack spacing="sm">
                        <Group position="apart">
                          <Group>
                            <ThemeIcon color={marketplace.color} size="lg">
                              {marketplace.icon}
                            </ThemeIcon>
                            <div>
                              <Text weight={500}>{marketplace.name}</Text>
                              <Text size="xs" color="dimmed">{marketplace.description}</Text>
                            </div>
                          </Group>
                          
                          <ThemeIcon color="blue" size="md" radius="xl">
                            <IconShield size={16} />
                          </ThemeIcon>
                        </Group>
                        
                        <Text size="sm" weight={500} mt="md">Connection Details</Text>
                        
                        {marketplace.fields.map(field => (
                          <div key={field.name}>
                            {field.type === 'password' ? (
                              <PasswordInput
                                label={field.label}
                                required={field.required}
                                value={formValues[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.currentTarget.value)}
                              />
                            ) : field.type === 'select' ? (
                              <Select
                                label={field.label}
                                required={field.required}
                                data={field.options || []}
                                value={formValues[field.name] || ''}
                                onChange={(value) => handleFieldChange(field.name, value || '')}
                              />
                            ) : (
                              <TextInput
                                label={field.label}
                                required={field.required}
                                value={formValues[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.currentTarget.value)}
                              />
                            )}
                          </div>
                        ))}
                        
                        <Group position="right" mt="md">
                          <Button
                            className="connect-button"
                            leftIcon={<IconPlugConnected size={16} />}
                            onClick={handleConnect}
                            loading={connecting}
                          >
                            Connect
                          </Button>
                        </Group>
                      </Stack>
                    );
                  })()}
                </>
              )}
            </Stack>
          </Paper>
        </div>
        
        {/* Existing Connections */}
        <div ref={connectionsRef} style={{ marginTop: formVisible ? 20 : 0 }}>
          {connections.length === 0 ? (
            <Paper withBorder p="xl" radius="sm" style={{ textAlign: 'center' }}>
              <Stack spacing="md" align="center">
                <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
                  <IconPlug size={24} />
                </ThemeIcon>
                
                <div>
                  <Text weight={500}>No marketplace connections</Text>
                  <Text size="sm" color="dimmed">
                    Add your first marketplace connection to start syncing data
                  </Text>
                </div>
                
                <Button 
                  variant="light" 
                  onClick={toggleForm}
                  style={{ marginTop: 10 }}
                >
                  Add Connection
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Stack spacing="md">
              {connections.map(connection => {
                const marketplaceInfo = getMarketplaceInfo(connection.type);
                const statusInfo = getStatusInfo(connection.status);
                
                return (
                  <Paper
                    key={connection.id}
                    id={`connection-${connection.id}`}
                    withBorder
                    p="md"
                    radius="sm"
                    className="connection-item"
                  >
                    <Stack spacing="sm">
                      <Group position="apart">
                        <Group>
                          <ThemeIcon 
                            color={marketplaceInfo?.color || 'gray'} 
                            size="lg"
                            style={{ transition: 'all 0.3s ease' }}
                          >
                            {marketplaceInfo?.icon || <IconShoppingCart size={18} />}
                          </ThemeIcon>
                          
                          <div>
                            <Group spacing="xs">
                              <Text weight={500}>{connection.name}</Text>
                              <Badge 
                                color={statusInfo.color}
                                className="status-badge"
                                style={{ transition: 'all 0.3s ease' }}
                              >
                                {connection.status}
                              </Badge>
                            </Group>
                            <Text size="xs" color="dimmed">
                              {marketplaceInfo?.description || 'Marketplace connection'}
                            </Text>
                          </div>
                        </Group>
                        
                        <Group spacing="xs">
                          <ActionIcon
                            id={`refresh-${connection.id}`}
                            color="blue"
                            variant="light"
                            onClick={() => handleRefresh(connection.id)}
                            disabled={connection.status !== 'connected'}
                          >
                            <IconRefresh size={16} />
                          </ActionIcon>
                          
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => handleDisconnect(connection.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                      
                      <Group position="apart" mt="xs">
                        <Text size="xs" color="dimmed">
                          Last synced: {formatRelativeTime(connection.lastSync)}
                        </Text>
                        
                        {connection.status === 'error' && (
                          <Text size="xs" color="red">
                            Error: {connection.error || 'Unknown error'}
                          </Text>
                        )}
                        
                        {connection.status === 'connected' && (
                          <Text size="xs" color="green">
                            Connected successfully
                          </Text>
                        )}
                      </Group>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </div>
      </Stack>
    </Paper>
  );
};

export default MarketplaceConnector;