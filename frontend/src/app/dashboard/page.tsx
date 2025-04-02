'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Title,
  Text,
  Group,
  Stack,
  SimpleGrid,
  Paper,
  Tabs,
  Button,
  Card,
  Badge,
  Skeleton,
  Divider,
  ActionIcon,
  Menu,
  useMantineTheme,
  ScrollArea,
  Modal,
  UnstyledButton,
  ThemeIcon,
  Avatar,
  Loader,
  Progress,
  Select,
  Table,
  Checkbox,
  RingProgress,
  Center,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AppShell from '@/components/Layout/AppShell';
import AnimatedStatCard from '@/components/dashboard/AnimatedStatCard';
import StatsChartCard from '@/components/dashboard/StatsChartCard';
import AnimatedChartJS from '@/components/Charts/AnimatedChartJS';
import { PageTransition } from '@/components/PageTransition/PageTransition';
import { useAnimatedMount, useStaggerAnimation, useTextReveal } from '@/hooks/useAnimation';
import { useOptimizedMount, useOptimizedStagger } from '@/hooks/useOptimizedAnimation';
import useAuth from '@/hooks/useAuth';
import useMotionPreference from '@/hooks/useMotionPreference';
import gsap from 'gsap';
import { 
  IconPackage, 
  IconTruck, 
  IconCoin, 
  IconAlert, 
  IconArrowUpRight, 
  IconRefresh, 
  IconSettings, 
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconX,
  IconArrowRight,
  IconShoppingCart,
  IconUsers,
  IconChartBar,
  IconBuildingStore,
  IconClockHour4,
  IconCalendar,
  IconBell,
  IconCheck,
  IconShieldCheck,
  IconExclamationMark,
  IconBrain,
  IconBulb,
  IconGraph,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconEye,
  IconFilter,
  IconStar,
  IconChevronRight,
  IconAward,
  IconChartPie,
  IconDeviceAnalytics,
  IconCaretUp,
  IconCaretDown,
  IconActivity,
  IconHeartbeat,
  IconTargetArrow,
  IconChecklist,
  IconBoxMultiple
} from '@tabler/icons-react';

// Mock data for charts
const generateChartData = (days: number, trend: 'up' | 'down' | 'volatile') => {
  const data = [];
  const labels = [];
  let value = trend === 'up' ? 1000 : trend === 'down' ? 3000 : 2000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    if (trend === 'up') {
      value += Math.random() * 100 - 20;
    } else if (trend === 'down') {
      value -= Math.random() * 100 - 20;
    } else {
      value += Math.random() * 200 - 100;
    }
    
    data.push(Math.max(value, 0));
  }
  
  return { data, labels };
};

// Sales data
const salesData = generateChartData(30, 'up');
const salesChartData = {
  labels: salesData.labels,
  datasets: [
    {
      label: 'Sales',
      data: salesData.data,
      borderColor: '#4dabf7',
      backgroundColor: 'rgba(77, 171, 247, 0.2)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#4dabf7',
      pointRadius: 0,
      pointHoverRadius: 4,
    }
  ]
};

// Revenue data
const revenueData = generateChartData(30, 'up');
const revenueChartData = {
  labels: revenueData.labels,
  datasets: [
    {
      label: 'Revenue',
      data: revenueData.data,
      borderColor: '#37b24d',
      backgroundColor: 'rgba(55, 178, 77, 0.2)',
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#37b24d',
      pointRadius: 0,
      pointHoverRadius: 4,
    }
  ]
};

// Marketplace performance
const marketplaceData = {
  labels: ['Amazon', 'eBay', 'Walmart', 'Shopify', 'Others'],
  datasets: [
    {
      label: 'Sales by Marketplace',
      data: [45, 25, 15, 10, 5],
      backgroundColor: [
        'rgba(77, 171, 247, 0.8)',
        'rgba(240, 140, 0, 0.8)',
        'rgba(55, 178, 77, 0.8)',
        'rgba(134, 142, 150, 0.8)',
        'rgba(173, 120, 211, 0.8)'
      ],
      borderColor: [
        'rgba(77, 171, 247, 1)',
        'rgba(240, 140, 0, 1)',
        'rgba(55, 178, 77, 1)',
        'rgba(134, 142, 150, 1)',
        'rgba(173, 120, 211, 1)'
      ],
      borderWidth: 1,
      hoverOffset: 4
    }
  ]
};

// Inventory status
const inventoryData = {
  labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Incoming'],
  datasets: [
    {
      label: 'Inventory Status',
      data: [65, 15, 5, 15],
      backgroundColor: [
        'rgba(77, 171, 247, 0.8)',
        'rgba(252, 196, 25, 0.8)',
        'rgba(250, 82, 82, 0.8)',
        'rgba(55, 178, 77, 0.8)'
      ],
      borderColor: [
        'rgba(77, 171, 247, 1)',
        'rgba(252, 196, 25, 1)',
        'rgba(250, 82, 82, 1)',
        'rgba(55, 178, 77, 1)'
      ],
      borderWidth: 1,
      hoverOffset: 4
    }
  ]
};

// Recent activity (mock data)
const recentActivities = [
  { id: 1, type: 'order', title: 'New order received', time: '10 minutes ago', description: 'Order #12345 received from John Smith', icon: IconShoppingCart, color: 'blue' },
  { id: 2, type: 'inventory', title: 'Low stock alert', time: '1 hour ago', description: 'Product "Wireless Headphones" is running low', icon: IconAlert, color: 'yellow' },
  { id: 3, type: 'shipment', title: 'Order shipped', time: '2 hours ago', description: 'Order #12340 shipped via FedEx', icon: IconTruck, color: 'green' },
  { id: 4, type: 'marketplace', title: 'Marketplace sync completed', time: '3 hours ago', description: 'Successfully synced with Amazon Marketplace', icon: IconBuildingStore, color: 'indigo' },
  { id: 5, type: 'user', title: 'New user registered', time: '5 hours ago', description: 'Sarah Johnson created a new account', icon: IconUsers, color: 'grape' },
  { id: 6, type: 'system', title: 'System update completed', time: '12 hours ago', description: 'System updated to version 2.4.0', icon: IconRefresh, color: 'cyan' },
];

// Alerts (mock data)
const systemAlerts = [
  { id: 1, type: 'error', title: 'API Connection Error', time: '15 minutes ago', description: 'Failed to connect to eBay API', icon: IconExclamationMark, color: 'red' },
  { id: 2, type: 'warning', title: 'Database Performance', time: '2 hours ago', description: 'Database queries running slower than usual', icon: IconAlert, color: 'yellow' },
  { id: 3, type: 'success', title: 'Backup Completed', time: '6 hours ago', description: 'Daily backup completed successfully', icon: IconCheck, color: 'green' },
];

// Upcoming tasks (mock data)
const upcomingTasks = [
  { id: 1, title: 'Inventory Restock', description: 'Review and approve inventory restock orders', due: 'Today', priority: 'high', completed: false },
  { id: 2, title: 'Performance Review', description: 'Quarterly performance review meeting', due: 'Tomorrow', priority: 'medium', completed: false },
  { id: 3, title: 'Update Product Listings', description: 'Update product descriptions for summer collection', due: 'In 3 days', priority: 'medium', completed: false },
  { id: 4, title: 'Financial Report', description: 'Prepare monthly financial report', due: 'Next week', priority: 'high', completed: false },
];

export default function Dashboard() {
  const router = useRouter();
  const theme = useMantineTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  
  // Animation refs
  const headerRef = useAnimatedMount('fadeInUp', { duration: 0.8 });
  const statsRef = useStaggerAnimation({ stagger: 0.1, delay: 0.3 });
  const chartsRef = useStaggerAnimation({ stagger: 0.15, delay: 0.6 });
  const activityRef = useAnimatedMount('fadeInUp', { delay: 0.8 });
  const insightRef = useOptimizedMount('fadeInUp', { delay: 0.9, duration: 0.7 });
  const titleRef = useTextReveal();
  
  // State for smart insights
  const [insightType, setInsightType] = useState('sales');
  const insightCardRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useMotionPreference();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle refresh with animation
  const handleRefresh = () => {
    setLoading(true);
    setRefresh(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setRefresh(false);
    }, 1500);
  };
  
  // Animate tab change
  const handleTabChange = (value: string) => {
    // Animate content out
    gsap.to('.dashboard-content', {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(value);
        // Animate content in
        gsap.to('.dashboard-content', {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  };
  
  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };
  
  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack spacing="xl">
          <Skeleton height={50} width="60%" />
          <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'xs', cols: 1 }]}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height={120} />
            ))}
          </SimpleGrid>
          <Grid>
            <Grid.Col md={6}><Skeleton height={300} /></Grid.Col>
            <Grid.Col md={6}><Skeleton height={300} /></Grid.Col>
          </Grid>
        </Stack>
      </Container>
    );
  }
  
  return (
    <PageTransition>
      <AppShell title="Dashboard">
        <Container size="xl">
          <Stack spacing="xl">
            {/* Header with welcome message */}
            <Group position="apart" ref={headerRef}>
              <div>
                <Title order={2} mb="sm">
                  Welcome back, {user?.name || 'User'}
                </Title>
                <Text color="dimmed">
                  Here's an overview of your business performance and operations.
                </Text>
              </div>
              
              <Group>
                <Button 
                  leftIcon={<IconRefresh size={16} />} 
                  variant="light"
                  loading={loading}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                <Button leftIcon={<IconSettings size={16} />} variant="subtle" onClick={open}>
                  Customize
                </Button>
              </Group>
            </Group>
            
            {/* Dashboard tabs */}
            <Tabs value={activeTab} onTabChange={handleTabChange} mb="md">
              <Tabs.List>
                <Tabs.Tab value="overview" icon={<IconChartBar size={16} />}>Overview</Tabs.Tab>
                <Tabs.Tab value="sales" icon={<IconCoin size={16} />}>Sales</Tabs.Tab>
                <Tabs.Tab value="inventory" icon={<IconPackage size={16} />}>Inventory</Tabs.Tab>
                <Tabs.Tab value="operations" icon={<IconTruck size={16} />}>Operations</Tabs.Tab>
              </Tabs.List>
            </Tabs>
            
            {/* Dashboard content */}
            <div className="dashboard-content">
              {activeTab === 'overview' && (
                <Stack spacing="xl">
                  {/* Stat cards */}
                  <SimpleGrid
                    cols={4}
                    spacing="lg"
                    breakpoints={[
                      { maxWidth: 'md', cols: 2 },
                      { maxWidth: 'xs', cols: 1 },
                    ]}
                    ref={statsRef}
                  >
                    <AnimatedStatCard
                      title="Total Sales"
                      value={12845}
                      previousValue={10952}
                      format={(val) => `$${val.toLocaleString()}`}
                      icon={<IconCoin size={16} />}
                      color="blue"
                      timeRanges={[
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                        { value: 'quarter', label: 'This Quarter' },
                        { value: 'year', label: 'This Year' }
                      ]}
                      defaultTimeRange="month"
                    />
                    
                    <AnimatedStatCard
                      title="Total Orders"
                      value={284}
                      previousValue={241}
                      icon={<IconShoppingCart size={16} />}
                      color="green"
                      timeRanges={[
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' }
                      ]}
                      defaultTimeRange="month"
                    />
                    
                    <AnimatedStatCard
                      title="Inventory Items"
                      value={1284}
                      icon={<IconPackage size={16} />}
                      color="grape"
                    />
                    
                    <AnimatedStatCard
                      title="Pending Shipments"
                      value={42}
                      previousValue={38}
                      icon={<IconTruck size={16} />}
                      color="orange"
                    />
                  </SimpleGrid>
                  
                  {/* Charts and metrics */}
                  <Grid ref={chartsRef}>
                    <Grid.Col md={6}>
                      <StatsChartCard
                        title="Sales Performance"
                        value="12,845"
                        change={17.3}
                        description="Monthly sales performance"
                        chartData={salesChartData}
                        chartType="area"
                        currency="$"
                        loading={loading}
                        color="blue"
                      />
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <StatsChartCard
                        title="Revenue"
                        value="38,520"
                        change={14.8}
                        description="Monthly revenue"
                        chartData={revenueChartData}
                        chartType="area"
                        currency="$"
                        loading={loading}
                        color="green"
                      />
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <AnimatedChartJS
                        title="Sales by Marketplace"
                        data={marketplaceData}
                        chartType="pie"
                        loading={loading}
                        chartHeight={250}
                      />
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <AnimatedChartJS
                        title="Inventory Status"
                        data={inventoryData}
                        chartType="pie"
                        loading={loading}
                        chartHeight={250}
                      />
                    </Grid.Col>
                  </Grid>
                  
                  {/* Activity and tasks */}
                  <Grid ref={activityRef}>
                    <Grid.Col md={8}>
                      <Card withBorder shadow="sm" p="md">
                        <Group position="apart" mb="md">
                          <Text weight={700} size="lg" ref={titleRef}>Recent Activity</Text>
                          <Button 
                            variant="subtle" 
                            compact 
                            rightIcon={<IconArrowRight size={16} />}
                            className="view-all-button"
                            sx={{
                              '&:hover .mantine-Button-rightIcon': {
                                transform: 'translateX(3px)',
                                transition: 'transform 0.2s ease'
                              }
                            }}
                          >
                            View All
                          </Button>
                        </Group>
                        
                        <ScrollArea h={400} offsetScrollbars>
                          <Stack spacing="sm">
                            {recentActivities.map((activity, index) => {
                              const fadeDelay = 0.1 + (index * 0.05);
                              return (
                                <Paper 
                                  key={activity.id} 
                                  p="md" 
                                  withBorder
                                  className="activity-card"
                                  sx={(theme) => ({
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: theme.colorScheme === 'dark' 
                                        ? theme.colors.dark[6] 
                                        : theme.colors.gray[0],
                                      transform: 'translateY(-2px)',
                                      boxShadow: theme.shadows.sm
                                    }
                                  })}
                                  onMouseEnter={(e) => {
                                    if (!motionPreference.reduced) {
                                      const icon = e.currentTarget.querySelector('.activity-icon');
                                      if (icon) {
                                        gsap.to(icon, {
                                          scale: 1.15,
                                          duration: 0.3,
                                          ease: 'back.out(1.7)'
                                        });
                                      }
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!motionPreference.reduced) {
                                      const icon = e.currentTarget.querySelector('.activity-icon');
                                      if (icon) {
                                        gsap.to(icon, {
                                          scale: 1,
                                          duration: 0.3,
                                          ease: 'power2.out'
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <Group position="apart" noWrap>
                                    <Group noWrap>
                                      <ThemeIcon 
                                        color={activity.color} 
                                        size="lg" 
                                        radius="xl"
                                        className="activity-icon"
                                      >
                                        <activity.icon size={20} />
                                      </ThemeIcon>
                                      <div>
                                        <Text weight={500}>{activity.title}</Text>
                                        <Text size="xs" color="dimmed">{activity.time}</Text>
                                      </div>
                                    </Group>
                                    <Menu position="bottom-end" withinPortal>
                                      <Menu.Target>
                                        <ActionIcon>
                                          <IconDotsVertical size={16} />
                                        </ActionIcon>
                                      </Menu.Target>
                                      <Menu.Dropdown>
                                        <Menu.Item icon={<IconBell size={14} />}>Mark as read</Menu.Item>
                                        <Menu.Item icon={<IconArrowRight size={14} />}>View details</Menu.Item>
                                        <Menu.Item icon={<IconX size={14} />} color="red">Dismiss</Menu.Item>
                                      </Menu.Dropdown>
                                    </Menu>
                                  </Group>
                                  <Text size="sm" mt="xs" color="dimmed">{activity.description}</Text>
                                </Paper>
                              );
                            })}
                          </Stack>
                        </ScrollArea>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col md={4}>
                      <Stack spacing="md">
                        <Card withBorder shadow="sm" p="md">
                          <Group position="apart" mb="md">
                            <Text weight={700}>System Alerts</Text>
                            <Badge>{systemAlerts.length}</Badge>
                          </Group>
                          
                          {systemAlerts.map((alert, index) => {
                            const slideDelay = 0.2 + (index * 0.1);
                            return (
                              <Group 
                                key={alert.id} 
                                mb="sm" 
                                noWrap 
                                position="apart"
                                className="alert-item"
                                sx={(theme) => ({
                                  padding: '8px',
                                  borderRadius: theme.radius.sm,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: theme.colorScheme === 'dark' 
                                      ? theme.colors.dark[6] 
                                      : theme.colors.gray[0],
                                  }
                                })}
                              >
                                <Group noWrap spacing="sm">
                                  <ThemeIcon 
                                    color={alert.color} 
                                    size="md" 
                                    radius="xl"
                                    className="alert-icon"
                                    sx={{
                                      transition: 'transform 0.3s ease'
                                    }}
                                  >
                                    <alert.icon size={16} />
                                  </ThemeIcon>
                                  <div>
                                    <Text size="sm" weight={500}>{alert.title}</Text>
                                    <Text size="xs" color="dimmed">{alert.time}</Text>
                                  </div>
                                </Group>
                                <ActionIcon 
                                  size="sm" 
                                  variant="light"
                                  className="action-button"
                                  sx={{
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateX(2px)'
                                    }
                                  }}
                                >
                                  <IconArrowRight size={14} />
                                </ActionIcon>
                              </Group>
                            );
                          })}
                        </Card>
                        
                        <Card withBorder shadow="sm" p="md" ref={insightRef}>
                          <Group position="apart" mb="md">
                            <Group spacing="xs">
                              <ThemeIcon color="violet" size="md" radius="xl">
                                <IconBrain size={16} />
                              </ThemeIcon>
                              <Text weight={700}>Smart Insights</Text>
                            </Group>
                            <Select
                              size="xs"
                              value={insightType}
                              onChange={(value) => {
                                if (value) setInsightType(value);
                                // Animate insight card when changing type
                                if (insightCardRef.current && !motionPreference.reduced) {
                                  gsap.fromTo(insightCardRef.current,
                                    { opacity: 0, y: 10 },
                                    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                                  );
                                }
                              }}
                              data={[
                                { value: 'sales', label: 'Sales' },
                                { value: 'inventory', label: 'Inventory' },
                                { value: 'operations', label: 'Operations' }
                              ]}
                              styles={{input: { width: 110 }}}
                            />
                          </Group>
                          
                          <Paper 
                            p="sm" 
                            withBorder 
                            ref={insightCardRef}
                            sx={(theme) => ({
                              backgroundColor: theme.fn.rgba(theme.colors.violet[7], 0.05),
                              borderColor: theme.fn.rgba(theme.colors.violet[5], 0.3)
                            })}
                          >
                            {insightType === 'sales' && (
                              <Stack spacing="xs">
                                <Group spacing="xs">
                                  <ThemeIcon color="violet" size="sm" radius="xl" variant="light">
                                    <IconTrendingUp size={14} />
                                  </ThemeIcon>
                                  <Text weight={600} size="sm">Sales Opportunity Detected</Text>
                                </Group>
                                <Text size="sm" color="dimmed" mt={0}>
                                  Wireless Headphones sales increased by 24% when you ran a flash sale. Consider repeating this promotion to boost revenue.
                                </Text>
                                <Group position="apart" mt={5}>
                                  <Badge size="sm" color="violet" variant="light">AI Recommendation</Badge>
                                  <Button size="xs" variant="light" color="violet" rightIcon={<IconChevronRight size={12} />}>Take Action</Button>
                                </Group>
                              </Stack>
                            )}
                            
                            {insightType === 'inventory' && (
                              <Stack spacing="xs">
                                <Group spacing="xs">
                                  <ThemeIcon color="violet" size="sm" radius="xl" variant="light">
                                    <IconBoxMultiple size={14} />
                                  </ThemeIcon>
                                  <Text weight={600} size="sm">Inventory Optimization</Text>
                                </Group>
                                <Text size="sm" color="dimmed" mt={0}>
                                  5 products have been overstocked for 30+ days. Consider adjusting your reorder quantities to optimize inventory costs.
                                </Text>
                                <Group position="apart" mt={5}>
                                  <Badge size="sm" color="violet" variant="light">AI Insight</Badge>
                                  <Button size="xs" variant="light" color="violet" rightIcon={<IconChevronRight size={12} />}>Review Items</Button>
                                </Group>
                              </Stack>
                            )}
                            
                            {insightType === 'operations' && (
                              <Stack spacing="xs">
                                <Group spacing="xs">
                                  <ThemeIcon color="violet" size="sm" radius="xl" variant="light">
                                    <IconHeartbeat size={14} />
                                  </ThemeIcon>
                                  <Text weight={600} size="sm">Performance Bottleneck</Text>
                                </Group>
                                <Text size="sm" color="dimmed" mt={0}>
                                  Order processing time peaks on Mondays between 2-4 PM, creating a bottleneck. Consider adding more staff during this window.
                                </Text>
                                <Group position="apart" mt={5}>
                                  <Badge size="sm" color="violet" variant="light">AI Detection</Badge>
                                  <Button size="xs" variant="light" color="violet" rightIcon={<IconChevronRight size={12} />}>View Analysis</Button>
                                </Group>
                              </Stack>
                            )}
                          </Paper>
                        </Card>
                        
                        <Card withBorder shadow="sm" p="md">
                          <Group position="apart" mb="md">
                            <Text weight={700}>Upcoming Tasks</Text>
                            <Button 
                              variant="subtle" 
                              compact 
                              size="xs" 
                              leftIcon={<IconPlus size={14} />}
                              className="add-task-button"
                              sx={{
                                '&:hover .mantine-Button-leftIcon': {
                                  transform: 'scale(1.2)',
                                  transition: 'transform 0.2s ease'
                                }
                              }}
                            >
                              Add Task
                            </Button>
                          </Group>
                          
                          <Stack spacing="xs">
                            {upcomingTasks.map((task, index) => {
                              const fadeDelay = 0.1 + (index * 0.07);
                              return (
                                <Group 
                                  key={task.id} 
                                  position="apart" 
                                  noWrap
                                  className="task-item"
                                  sx={(theme) => ({
                                    padding: '6px 8px',
                                    borderRadius: theme.radius.sm,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: theme.colorScheme === 'dark' 
                                        ? theme.colors.dark[6] 
                                        : theme.colors.gray[0],
                                    }
                                  })}
                                >
                                  <Group noWrap spacing="sm">
                                    <Checkbox 
                                      className="task-checkbox"
                                      onChange={(e) => {
                                        if (e.currentTarget.checked && !motionPreference.reduced) {
                                          const textElement = e.currentTarget.closest('.task-item')?.querySelector('.task-text');
                                          if (textElement) {
                                            gsap.to(textElement, {
                                              textDecoration: 'line-through',
                                              opacity: 0.5,
                                              duration: 0.3
                                            });
                                            
                                            // Reset after a moment for demo purposes
                                            setTimeout(() => {
                                              gsap.to(textElement, {
                                                textDecoration: 'none',
                                                opacity: 1,
                                                duration: 0.3
                                              });
                                              if (e.currentTarget) e.currentTarget.checked = false;
                                            }, 2000);
                                          }
                                        }
                                      }}
                                    />
                                    <div>
                                      <Text 
                                        size="sm" 
                                        weight={500} 
                                        lineClamp={1}
                                        className="task-text"
                                      >
                                        {task.title}
                                      </Text>
                                      <Group spacing="xs">
                                        <Badge size="xs" color={getPriorityColor(task.priority)}>
                                          {task.priority}
                                        </Badge>
                                        <Text size="xs" color="dimmed">
                                          Due: {task.due}
                                        </Text>
                                      </Group>
                                    </div>
                                  </Group>
                                  <ActionIcon size="sm">
                                    <IconDotsVertical size={14} />
                                  </ActionIcon>
                                </Group>
                              );
                            })}
                          </Stack>
                          
                          <Button 
                            variant="subtle" 
                            fullWidth 
                            mt="md" 
                            size="xs"
                            rightIcon={<IconChevronRight size={14} />}
                            sx={{
                              '&:hover .mantine-Button-rightIcon': {
                                transform: 'translateX(3px)',
                                transition: 'transform 0.2s ease'
                              }
                            }}
                          >
                            View All Tasks
                          </Button>
                        </Card>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
              
              {activeTab === 'sales' && (
                <Stack spacing="xl">
                  {/* Sales dashboard content */}
                  <SimpleGrid
                    cols={3}
                    spacing="lg"
                    breakpoints={[{ maxWidth: 'md', cols: 1 }]}
                    ref={statsRef}
                  >
                    <AnimatedStatCard
                      title="Total Sales"
                      value={28540}
                      previousValue={24120}
                      format={(val) => `$${val.toLocaleString()}`}
                      icon={<IconCoin size={16} />}
                      color="blue"
                    />
                    
                    <AnimatedStatCard
                      title="Conversion Rate"
                      value={4.8}
                      previousValue={4.2}
                      format={(val) => `${val}%`}
                      icon={<IconArrowUpRight size={16} />}
                      color="green"
                      precision={1}
                    />
                    
                    <AnimatedStatCard
                      title="Average Order Value"
                      value={112.50}
                      previousValue={98.75}
                      format={(val) => `$${val.toFixed(2)}`}
                      icon={<IconShoppingCart size={16} />}
                      color="violet"
                      precision={2}
                    />
                  </SimpleGrid>
                  
                  <Grid>
                    <Grid.Col md={8}>
                      <StatsChartCard
                        title="Monthly Sales Trend"
                        value="28,540"
                        change={18.3}
                        description="Last 6 months sales performance"
                        chartData={salesChartData}
                        chartHeight={350}
                        chartType="area"
                        currency="$"
                        loading={loading}
                        color="blue"
                      />
                    </Grid.Col>
                    
                    <Grid.Col md={4}>
                      <Card withBorder shadow="sm" p="md" h="100%">
                        <Text weight={700} size="lg" mb="md">Top Selling Products</Text>
                        
                        <Stack spacing="xs">
                          {[
                            { name: 'Wireless Headphones', amount: '$4,280', growth: 24 },
                            { name: 'Smart Watch', amount: '$3,580', growth: 18 },
                            { name: 'Bluetooth Speaker', amount: '$2,840', growth: 12 },
                            { name: 'Fitness Tracker', amount: '$2,120', growth: -5 },
                            { name: 'Portable Charger', amount: '$1,840', growth: 8 }
                          ].map((product, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Group position="apart">
                                <Text size="sm" weight={500}>{product.name}</Text>
                                <Badge 
                                  color={product.growth > 0 ? 'green' : 'red'}
                                  variant="light"
                                >
                                  {product.growth > 0 ? '+' : ''}{product.growth}%
                                </Badge>
                              </Group>
                              <Text size="lg" weight={700} mt="xs">{product.amount}</Text>
                            </Paper>
                          ))}
                        </Stack>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <Card withBorder shadow="sm" p="md">
                        <Text weight={700} size="lg" mb="md">Sales by Channel</Text>
                        
                        <Grid>
                          <Grid.Col md={6}>
                            <AnimatedChartJS
                              title=""
                              data={{
                                labels: ['Amazon', 'eBay', 'Walmart', 'Shopify', 'Others'],
                                datasets: [{
                                  label: 'Sales by Channel',
                                  data: [45, 25, 15, 10, 5],
                                  backgroundColor: [
                                    'rgba(77, 171, 247, 0.8)',
                                    'rgba(240, 140, 0, 0.8)',
                                    'rgba(55, 178, 77, 0.8)',
                                    'rgba(134, 142, 150, 0.8)',
                                    'rgba(173, 120, 211, 0.8)'
                                  ]
                                }]
                              }}
                              chartType="pie"
                              chartHeight={250}
                              p={0}
                              withBorder={false}
                              shadow="none"
                              animate={true}
                            />
                          </Grid.Col>
                          
                          <Grid.Col md={6}>
                            <Stack justify="center" h="100%" spacing="lg">
                              {[
                                { platform: 'Amazon', amount: '$12,824', percentage: 45, color: 'blue' },
                                { platform: 'eBay', amount: '$7,135', percentage: 25, color: 'orange' },
                                { platform: 'Walmart', amount: '$4,281', percentage: 15, color: 'green' },
                                { platform: 'Shopify', amount: '$2,854', percentage: 10, color: 'gray' },
                                { platform: 'Others', amount: '$1,427', percentage: 5, color: 'grape' }
                              ].map((platform, i) => (
                                <Group key={i} position="apart" noWrap>
                                  <Group noWrap>
                                    <ThemeIcon size="md" color={platform.color} variant="light">
                                      <IconBuildingStore size={18} />
                                    </ThemeIcon>
                                    <div>
                                      <Text weight={500}>{platform.platform}</Text>
                                      <Text size="xs" color="dimmed">{platform.percentage}% of total sales</Text>
                                    </div>
                                  </Group>
                                  <Text weight={700}>{platform.amount}</Text>
                                </Group>
                              ))}
                            </Stack>
                          </Grid.Col>
                        </Grid>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
              
              {activeTab === 'inventory' && (
                <Stack spacing="xl">
                  {/* Inventory dashboard content */}
                  <SimpleGrid
                    cols={4}
                    spacing="lg"
                    breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'xs', cols: 1 }]}
                    ref={statsRef}
                  >
                    <AnimatedStatCard
                      title="Total Products"
                      value={1284}
                      previousValue={1140}
                      icon={<IconPackage size={16} />}
                      color="indigo"
                    />
                    
                    <AnimatedStatCard
                      title="Low Stock Items"
                      value={84}
                      previousValue={76}
                      icon={<IconAlert size={16} />}
                      color="yellow"
                    />
                    
                    <AnimatedStatCard
                      title="Out of Stock"
                      value={24}
                      previousValue={31}
                      icon={<IconX size={16} />}
                      color="red"
                    />
                    
                    <AnimatedStatCard
                      title="Incoming Shipments"
                      value={12}
                      previousValue={8}
                      icon={<IconTruck size={16} />}
                      color="green"
                    />
                  </SimpleGrid>
                  
                  <Grid>
                    <Grid.Col md={6}>
                      <AnimatedChartJS
                        title="Inventory Status"
                        chartType="pie"
                        data={inventoryData}
                        chartHeight={300}
                      />
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Card withBorder shadow="sm" p="md" h="100%">
                        <Group position="apart" mb="md">
                          <Text weight={700} size="lg">Inventory Alerts</Text>
                          <Badge>{15}</Badge>
                        </Group>
                        
                        <ScrollArea h={240} offsetScrollbars>
                          <Stack spacing="xs">
                            {[
                              { product: 'Wireless Headphones', issue: 'Low Stock', level: 'warning', qty: 5 },
                              { product: 'Smart Watch', issue: 'Out of Stock', level: 'critical', qty: 0 },
                              { product: 'Phone Case', issue: 'Low Stock', level: 'warning', qty: 8 },
                              { product: 'Bluetooth Speaker', issue: 'Low Stock', level: 'warning', qty: 6 },
                              { product: 'USB-C Cable', issue: 'Out of Stock', level: 'critical', qty: 0 }
                            ].map((alert, i) => (
                              <Paper key={i} p="sm" withBorder>
                                <Group position="apart" noWrap>
                                  <div>
                                    <Group spacing="xs">
                                      <ThemeIcon 
                                        size="sm" 
                                        color={alert.level === 'critical' ? 'red' : 'yellow'}
                                        variant="light"
                                      >
                                        {alert.level === 'critical' ? <IconX size={14} /> : <IconAlert size={14} />}
                                      </ThemeIcon>
                                      <Text weight={500} size="sm">{alert.product}</Text>
                                    </Group>
                                    <Text size="xs" color="dimmed" mt={4}>
                                      {alert.issue} - {alert.qty} units remaining
                                    </Text>
                                  </div>
                                  <Button size="xs" variant="light">Restock</Button>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </ScrollArea>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <Card withBorder shadow="sm" p="md">
                        <Group position="apart" mb="md">
                          <Text weight={700} size="lg">Top Selling Products</Text>
                          <Button variant="light" size="xs" leftIcon={<IconPlus size={14} />}>
                            Add Product
                          </Button>
                        </Group>
                        
                        <Table>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>SKU</th>
                              <th>Category</th>
                              <th>Stock</th>
                              <th>Price</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { product: 'Wireless Headphones', sku: 'WH-2023-BLK', category: 'Electronics', stock: 45, price: '$99.99', status: 'In Stock' },
                              { product: 'Smart Watch', sku: 'SW-2023-SLV', category: 'Wearables', stock: 28, price: '$149.99', status: 'In Stock' },
                              { product: 'Bluetooth Speaker', sku: 'BS-2023-RED', category: 'Audio', stock: 12, price: '$79.99', status: 'Low Stock' },
                              { product: 'Phone Case', sku: 'PC-2023-BLU', category: 'Accessories', stock: 86, price: '$19.99', status: 'In Stock' },
                              { product: 'USB-C Cable', sku: 'USB-C-BLK', category: 'Accessories', stock: 0, price: '$14.99', status: 'Out of Stock' }
                            ].map((product, i) => (
                              <tr key={i}>
                                <td>
                                  <Text weight={500}>{product.product}</Text>
                                </td>
                                <td>{product.sku}</td>
                                <td>{product.category}</td>
                                <td>{product.stock}</td>
                                <td>{product.price}</td>
                                <td>
                                  <Badge 
                                    color={
                                      product.status === 'In Stock' ? 'green' : 
                                      product.status === 'Low Stock' ? 'yellow' : 'red'
                                    }
                                  >
                                    {product.status}
                                  </Badge>
                                </td>
                                <td>
                                  <Group spacing={4}>
                                    <ActionIcon size="sm" variant="light">
                                      <IconEdit size={14} />
                                    </ActionIcon>
                                    <ActionIcon size="sm" variant="light" color="blue">
                                      <IconArrowRight size={14} />
                                    </ActionIcon>
                                  </Group>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
              
              {activeTab === 'operations' && (
                <Stack spacing="xl">
                  {/* Operations dashboard content */}
                  <SimpleGrid
                    cols={4}
                    spacing="lg"
                    breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'xs', cols: 1 }]}
                    ref={statsRef}
                  >
                    <AnimatedStatCard
                      title="Open Orders"
                      value={48}
                      previousValue={52}
                      icon={<IconShoppingCart size={16} />}
                      color="blue"
                    />
                    
                    <AnimatedStatCard
                      title="Pending Shipments"
                      value={36}
                      previousValue={42}
                      icon={<IconTruck size={16} />}
                      color="orange"
                    />
                    
                    <AnimatedStatCard
                      title="Returns"
                      value={12}
                      previousValue={8}
                      icon={<IconArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
                      color="red"
                    />
                    
                    <AnimatedStatCard
                      title="Processing Time"
                      value={1.8}
                      previousValue={2.4}
                      format={(val) => `${val} days`}
                      icon={<IconClockHour4 size={16} />}
                      color="green"
                      precision={1}
                    />
                  </SimpleGrid>
                  
                  <Grid>
                    <Grid.Col md={6}>
                      <Card withBorder shadow="sm" p="md">
                        <Text weight={700} size="lg" mb="md">Recent Shipments</Text>
                        
                        <Stack spacing="xs">
                          {[
                            { id: 'SHP-12345', order: 'ORD-78901', carrier: 'FedEx', status: 'Delivered', date: '2 hours ago' },
                            { id: 'SHP-12344', order: 'ORD-78900', carrier: 'UPS', status: 'In Transit', date: '5 hours ago' },
                            { id: 'SHP-12343', order: 'ORD-78899', carrier: 'USPS', status: 'In Transit', date: '1 day ago' },
                            { id: 'SHP-12342', order: 'ORD-78898', carrier: 'DHL', status: 'Delivered', date: '1 day ago' },
                            { id: 'SHP-12341', order: 'ORD-78897', carrier: 'FedEx', status: 'Delivered', date: '2 days ago' }
                          ].map((shipment, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Group position="apart">
                                <div>
                                  <Group spacing="xs">
                                    <ThemeIcon 
                                      size="sm" 
                                      color={shipment.status === 'Delivered' ? 'green' : 'blue'}
                                      variant="light"
                                    >
                                      <IconTruck size={14} />
                                    </ThemeIcon>
                                    <Text weight={500} size="sm">Shipment {shipment.id}</Text>
                                  </Group>
                                  <Text size="xs" color="dimmed" mt={4}>
                                    Order {shipment.order} • {shipment.carrier} • {shipment.date}
                                  </Text>
                                </div>
                                <Badge color={shipment.status === 'Delivered' ? 'green' : 'blue'}>
                                  {shipment.status}
                                </Badge>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                        
                        <Button variant="subtle" fullWidth size="xs" mt="md">
                          View All Shipments
                        </Button>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col md={6}>
                      <Card withBorder shadow="sm" p="md">
                        <Text weight={700} size="lg" mb="md">Warehouse Performance</Text>
                        
                        <Stack spacing="md">
                          {[
                            { metric: 'Pick Rate', value: '92%', target: '95%', status: 'warning' },
                            { metric: 'Packing Speed', value: '22 units/hr', target: '20 units/hr', status: 'success' },
                            { metric: 'Order Accuracy', value: '99.8%', target: '99.5%', status: 'success' },
                            { metric: 'Backlog', value: '18 orders', target: '< 15 orders', status: 'warning' }
                          ].map((metric, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Group position="apart" noWrap>
                                <div>
                                  <Text weight={500}>{metric.metric}</Text>
                                  <Text size="xs" color="dimmed">Target: {metric.target}</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <Text weight={700} size="lg">{metric.value}</Text>
                                  <Badge 
                                    size="sm"
                                    variant="dot" 
                                    color={metric.status === 'success' ? 'green' : 'yellow'}
                                  >
                                    {metric.status === 'success' ? 'On Target' : 'Needs Attention'}
                                  </Badge>
                                </div>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      </Card>
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <Card withBorder shadow="sm" p="md">
                        <Group position="apart" mb="md">
                          <Text weight={700} size="lg">Fulfillment Timeline</Text>
                          <Select 
                            defaultValue="7days"
                            data={[
                              { value: '24h', label: 'Last 24 Hours' },
                              { value: '7days', label: 'Last 7 Days' },
                              { value: '30days', label: 'Last 30 Days' }
                            ]}
                            size="xs"
                          />
                        </Group>
                        
                        <AnimatedChartJS
                          title=""
                          data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [
                              {
                                label: 'Orders Received',
                                data: [42, 38, 45, 50, 54, 36, 42],
                                borderColor: theme.colors.blue[6],
                                backgroundColor: 'rgba(77, 171, 247, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                              },
                              {
                                label: 'Orders Fulfilled',
                                data: [36, 32, 40, 45, 48, 32, 38],
                                borderColor: theme.colors.green[6],
                                backgroundColor: 'rgba(55, 178, 77, 0.1)',
                                borderWidth: 2,
                                tension: 0.4
                              }
                            ]
                          }}
                          chartType="line"
                          chartHeight={250}
                          p={0}
                          withBorder={false}
                          shadow="none"
                          options={{
                            scales: {
                              y: {
                                display: true,
                                beginAtZero: true
                              },
                              x: {
                                display: true
                              }
                            }
                          }}
                        />
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
            </div>
          </Stack>
        </Container>
        
        {/* Dashboard customization modal */}
        <Modal 
          opened={opened} 
          onClose={close} 
          title="Customize Dashboard"
          size="lg"
        >
          <Stack spacing="md">
            <Text>Select which widgets to display on your dashboard:</Text>
            
            <Divider label="Stats Cards" labelPosition="center" />
            
            <SimpleGrid cols={2}>
              {['Total Sales', 'Total Orders', 'Inventory Items', 'Pending Shipments'].map((item) => (
                <Group key={item} noWrap>
                  <Checkbox defaultChecked />
                  <Text>{item}</Text>
                </Group>
              ))}
            </SimpleGrid>
            
            <Divider label="Charts" labelPosition="center" />
            
            <SimpleGrid cols={2}>
              {['Sales Performance', 'Revenue', 'Sales by Marketplace', 'Inventory Status'].map((item) => (
                <Group key={item} noWrap>
                  <Checkbox defaultChecked />
                  <Text>{item}</Text>
                </Group>
              ))}
            </SimpleGrid>
            
            <Divider label="Activity & Alerts" labelPosition="center" />
            
            <SimpleGrid cols={2}>
              {['Recent Activity', 'System Alerts', 'Upcoming Tasks'].map((item) => (
                <Group key={item} noWrap>
                  <Checkbox defaultChecked />
                  <Text>{item}</Text>
                </Group>
              ))}
            </SimpleGrid>
            
            <Group position="right" mt="md">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button onClick={close}>Save Changes</Button>
            </Group>
          </Stack>
        </Modal>
      </AppShell>
    </PageTransition>
  );
}