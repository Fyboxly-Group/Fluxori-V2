import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Group, Tabs, Card, Badge, Button, Grid, Stack, createStyles, Loader, LoadingOverlay, ActionIcon, Menu, Select } from '@mantine/core';
import { IconBell, IconFilter, IconEye, IconCheck, IconClockHour4, IconSortAscending, IconSortDescending, IconX, IconMessageCircle, IconTag } from '@tabler/icons-react';
import { Notification } from './NotificationBell';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import gsap from 'gsap';

// Create styles for the component
const useStyles = createStyles((theme) => ({
  container: {
    position: 'relative',
  },
  header: {
    marginBottom: theme.spacing.md,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
  },
  notificationItem: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.sm,
    },
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filterBadge: {
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
    '&:hover': {
      opacity: 0.7,
    },
  },
}));

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  loading?: boolean;
  onFilterChange?: (filters: {
    type?: string[];
    readStatus?: 'all' | 'read' | 'unread';
    category?: string[];
  }) => void;
  categories?: string[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  loading = false,
  onFilterChange,
  categories = [],
}) => {
  const { classes } = useStyles();
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [readStatus, setReadStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Animation hooks
  const headerRef = useAnimatedMount('fadeInUp', { duration: 0.4 });
  const listRef = useStaggerAnimation({ stagger: 0.05, duration: 0.4 });
  
  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = [...notifications];
    
    // Filter by tab (type)
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => n.type === activeTab);
    }
    
    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(n => selectedTypes.includes(n.type));
    }
    
    // Filter by read status
    if (readStatus === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (readStatus === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(n => n.category && selectedCategories.includes(n.category));
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  }, [notifications, activeTab, selectedTypes, readStatus, selectedCategories, sortDirection]);
  
  // Call onFilterChange when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
        readStatus,
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
    }
  }, [selectedTypes, readStatus, selectedCategories, onFilterChange]);
  
  // Format notification date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  // Get notification type label
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Info';
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    // Find the notification element
    const notificationEl = document.getElementById(`notification-${id}`);
    
    if (notificationEl) {
      // Create read animation
      gsap.to(notificationEl, {
        backgroundColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          onMarkAsRead(id);
        }
      });
    } else {
      onMarkAsRead(id);
    }
  };
  
  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setReadStatus('all');
    setSelectedCategories([]);
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  return (
    <Box className={classes.container}>
      <LoadingOverlay visible={loading} />
      
      <Box className={classes.header} ref={headerRef}>
        <Group position="apart" mb="md">
          <Title order={3}>Notifications</Title>
          
          {notifications.filter(n => !n.read).length > 0 && (
            <Button 
              variant="subtle" 
              leftIcon={<IconCheck size={16} />}
              onClick={onMarkAllAsRead}
              size="sm"
            >
              Mark all as read
            </Button>
          )}
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all" icon={<IconBell size={16} />}>
              All
            </Tabs.Tab>
            <Tabs.Tab 
              value="info" 
              icon={<IconBell size={16} />} 
              color="blue"
              rightSection={
                <Badge size="sm" p={0} w={16} h={16} variant="filled" radius="xl">
                  {notifications.filter(n => n.type === 'info').length}
                </Badge>
              }
            >
              Info
            </Tabs.Tab>
            <Tabs.Tab 
              value="success" 
              icon={<IconBell size={16} />}
              color="green"
              rightSection={
                <Badge size="sm" p={0} w={16} h={16} variant="filled" radius="xl" color="green">
                  {notifications.filter(n => n.type === 'success').length}
                </Badge>
              }
            >
              Success
            </Tabs.Tab>
            <Tabs.Tab 
              value="warning" 
              icon={<IconBell size={16} />}
              color="yellow"
              rightSection={
                <Badge size="sm" p={0} w={16} h={16} variant="filled" radius="xl" color="yellow">
                  {notifications.filter(n => n.type === 'warning').length}
                </Badge>
              }
            >
              Warning
            </Tabs.Tab>
            <Tabs.Tab 
              value="error" 
              icon={<IconBell size={16} />}
              color="red"
              rightSection={
                <Badge size="sm" p={0} w={16} h={16} variant="filled" radius="xl" color="red">
                  {notifications.filter(n => n.type === 'error').length}
                </Badge>
              }
            >
              Error
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        <Box className={classes.controls}>
          <Group spacing="xs">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button 
                  variant="light"
                  leftIcon={<IconFilter size={16} />}
                  size="xs"
                  color={selectedTypes.length > 0 ? 'blue' : 'gray'}
                >
                  Type
                  {selectedTypes.length > 0 && ` (${selectedTypes.length})`}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Filter by type</Menu.Label>
                {['info', 'success', 'warning', 'error'].map(type => (
                  <Menu.Item
                    key={type}
                    icon={
                      <Badge size="xs" color={getNotificationTypeColor(type)} variant="dot" />
                    }
                    rightSection={
                      selectedTypes.includes(type) ? <IconCheck size={14} /> : null
                    }
                    onClick={() => toggleTypeFilter(type)}
                  >
                    {getNotificationTypeLabel(type)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            
            <Select
              placeholder="Read Status"
              data={[
                { value: 'all', label: 'All' },
                { value: 'read', label: 'Read' },
                { value: 'unread', label: 'Unread' },
              ]}
              value={readStatus}
              onChange={(value) => setReadStatus(value as 'all' | 'read' | 'unread')}
              size="xs"
              icon={<IconEye size={14} />}
              style={{ width: 120 }}
            />
            
            {categories.length > 0 && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button 
                    variant="light"
                    leftIcon={<IconTag size={16} />}
                    size="xs"
                    color={selectedCategories.length > 0 ? 'blue' : 'gray'}
                  >
                    Category
                    {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Filter by category</Menu.Label>
                  {categories.map(category => (
                    <Menu.Item
                      key={category}
                      rightSection={
                        selectedCategories.includes(category) ? <IconCheck size={14} /> : null
                      }
                      onClick={() => toggleCategoryFilter(category)}
                    >
                      {category}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
            
            <ActionIcon 
              variant="light" 
              onClick={toggleSortDirection} 
              title={`Sort ${sortDirection === 'desc' ? 'oldest' : 'newest'} first`}
              size="md"
            >
              {sortDirection === 'desc' ? (
                <IconSortDescending size={18} />
              ) : (
                <IconSortAscending size={18} />
              )}
            </ActionIcon>
            
            {(selectedTypes.length > 0 || readStatus !== 'all' || selectedCategories.length > 0) && (
              <Button 
                variant="subtle" 
                leftIcon={<IconX size={16} />}
                onClick={clearFilters}
                size="xs"
                color="gray"
              >
                Clear filters
              </Button>
            )}
          </Group>
        </Box>
      </Box>
      
      {loading ? (
        <Box p="xl" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Card p="xl" withBorder mt="md">
          <Stack align="center" spacing="sm">
            <IconBell size={48} strokeWidth={1} color="gray" />
            <Text align="center" color="dimmed" size="lg">
              No notifications found
            </Text>
            <Text align="center" color="dimmed" size="sm">
              {selectedTypes.length > 0 || readStatus !== 'all' || selectedCategories.length > 0 ? (
                'Try adjusting your filters to see more notifications'
              ) : (
                'You\'ll see notifications here when they arrive'
              )}
            </Text>
          </Stack>
        </Card>
      ) : (
        <Box ref={listRef}>
          {filteredNotifications.map(notification => (
            <Box
              key={notification.id}
              id={`notification-${notification.id}`}
              className={classes.notificationItem}
              style={{
                backgroundColor: notification.read ? undefined : 'rgba(51, 154, 240, 0.05)',
              }}
            >
              {!notification.read && (
                <div 
                  className={classes.unreadIndicator} 
                  style={{ backgroundColor: getNotificationTypeColor(notification.type) }}
                />
              )}
              
              <Grid>
                <Grid.Col span={12}>
                  <Group position="apart" noWrap>
                    <Group spacing="xs">
                      <Badge color={getNotificationTypeColor(notification.type)}>
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                      {notification.category && (
                        <Badge variant="outline">
                          {notification.category}
                        </Badge>
                      )}
                    </Group>
                    <Group spacing="xs" noWrap>
                      <Text size="xs" color="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        <IconClockHour4 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {formatDate(notification.date)}
                      </Text>
                    </Group>
                  </Group>
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Text 
                    weight={notification.read ? 400 : 600}
                    size="sm"
                    mb="xs"
                  >
                    {notification.message}
                  </Text>
                  
                  {!notification.read && (
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleMarkAsRead(notification.id)}
                      mt="xs"
                    >
                      Mark as read
                    </Button>
                  )}
                </Grid.Col>
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NotificationCenter;