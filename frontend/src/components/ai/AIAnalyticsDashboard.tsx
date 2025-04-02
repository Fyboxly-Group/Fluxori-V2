import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Title, 
  Text, 
  Group, 
  ActionIcon, 
  useMantineTheme, 
  Tabs, 
  ThemeIcon, 
  Stack,
  Badge,
  Card
} from '@mantine/core';
import { 
  IconRefresh, 
  IconBrandZoom, 
  IconBulb, 
  IconTrendingUp, 
  IconShoppingCart, 
  IconUsers,
  IconChartBar,
  IconChartLine,
  IconChartPie
} from '@tabler/icons-react';
import gsap from 'gsap';
import AnimatedChartJS from '../Charts/AnimatedChartJS';
import StatsChartCard from '../dashboard/StatsChartCard';
import { useAnimatedMount } from '@/hooks/useAnimation';
import AIInsightCard from './AIInsightCard';
import { ChartData, ChartOptions } from 'chart.js';

interface MetricData {
  labels: string[];
  datasets: any[];
}

interface InsightData {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AIAnalyticsDashboardProps {
  /** Time period for metrics (e.g. '7d', '30d') */
  timePeriod?: string;
  /** Function called when time period changes */
  onTimePeriodChange?: (period: string) => void;
  /** Whether the dashboard is loading */
  loading?: boolean;
  /** Function called when dashboard is refreshed */
  onRefresh?: () => void;
}

/**
 * AI-powered analytics dashboard with Chart.js visualizations
 * Following Fluxori's Motion Design Guide for data visualization animations
 */
export const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({
  timePeriod = '7d',
  onTimePeriodChange,
  loading = false,
  onRefresh
}) => {
  const theme = useMantineTheme();
  const dashboardRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Sample data for charts
  const salesData: MetricData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 13, 15, 22, 27, 29],
        borderColor: theme.colors.blue[6],
        backgroundColor: `${theme.colors.blue[6]}33`,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const ordersData: MetricData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [22, 28, 20, 25, 31, 35, 40],
        borderColor: theme.colors.green[6],
        backgroundColor: theme.colors.green[6],
        borderRadius: 4
      }
    ]
  };

  const customersData: MetricData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Customers',
        data: [5, 8, 6, 9, 7, 11, 14],
        borderColor: theme.colors.violet[6],
        backgroundColor: `${theme.colors.violet[6]}33`,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const conversionData: MetricData = {
    labels: ['Direct', 'Social', 'Email', 'Organic', 'Referral'],
    datasets: [
      {
        label: 'Conversions by Channel',
        data: [35, 25, 15, 20, 5],
        backgroundColor: [
          theme.colors.blue[6],
          theme.colors.green[6],
          theme.colors.yellow[6],
          theme.colors.violet[6],
          theme.colors.pink[6]
        ],
        borderWidth: 1
      }
    ]
  };

  // AI insights sample data
  const insights: InsightData[] = [
    {
      title: 'Sales Increase in Category X',
      description: 'Products in Category X are showing a 23% increase in sales compared to last month, suggesting rising popularity.',
      impact: 'positive',
      confidence: 0.87
    },
    {
      title: 'Inventory Alert for Top Sellers',
      description: '3 of your top 10 selling products will run out of stock within 7 days based on current sales velocity.',
      impact: 'negative',
      confidence: 0.92
    },
    {
      title: 'Price Optimization Opportunity',
      description: 'You could increase profit margins by 12% on Product Y without significantly impacting sales volume.',
      impact: 'positive',
      confidence: 0.78
    }
  ];

  // Detailed sales analytics data
  const detailedSalesData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This Year',
        data: [65, 78, 86, 92, 95, 102, 110, 117, 120, 125, 132, 138],
        borderColor: theme.colors.blue[6],
        backgroundColor: `${theme.colors.blue[6]}33`,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Last Year',
        data: [52, 60, 72, 80, 85, 90, 97, 105, 110, 115, 120, 125],
        borderColor: theme.colors.gray[6],
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  const salesByCategory: ChartData = {
    labels: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Toys'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [30, 25, 20, 15, 10, 5],
        backgroundColor: [
          theme.colors.blue[6],
          theme.colors.green[6],
          theme.colors.yellow[6],
          theme.colors.orange[6],
          theme.colors.red[6],
          theme.colors.violet[6]
        ],
        borderWidth: 1
      }
    ]
  };

  const productPerformance: ChartData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F', 'Product G'],
    datasets: [
      {
        label: 'Units Sold',
        data: [120, 110, 100, 90, 80, 70, 60],
        backgroundColor: theme.colors.blue[6],
        borderRadius: 4
      },
      {
        label: 'Revenue',
        data: [150, 90, 130, 70, 120, 50, 100],
        backgroundColor: theme.colors.green[6],
        borderRadius: 4
      }
    ]
  };

  // Chart options
  const barOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    }
  };

  const lineOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const pieOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false
      }
    }
  };

  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    gsap.to('.tab-content', {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(value);
        gsap.to('.tab-content', {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.1
        });
      }
    });
  };

  // Handle refresh with animation
  const handleRefresh = () => {
    if (!onRefresh) return;
    
    // Animate the refresh icon
    const refreshIcon = document.querySelector('.refresh-icon');
    if (refreshIcon) {
      gsap.to(refreshIcon, {
        rotation: '+=360',
        duration: 0.7,
        ease: 'power1.inOut',
        onComplete: onRefresh
      });
    } else {
      onRefresh();
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (period: string) => {
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  };

  return (
    <Paper ref={dashboardRef} p="md" radius="md">
      {/* Dashboard Header */}
      <Group position="apart" mb="lg">
        <div>
          <Title order={3}>AI-Powered Analytics</Title>
          <Text color="dimmed" size="sm">
            Intelligent insights and performance metrics
          </Text>
        </div>
        <Group>
          <Group spacing={4}>
            {['24h', '7d', '30d', '90d'].map(period => (
              <Badge
                key={period}
                color="blue"
                variant={timePeriod === period ? 'filled' : 'outline'}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleTimePeriodChange(period)}
              >
                {period}
              </Badge>
            ))}
          </Group>
          <ActionIcon 
            variant="light" 
            onClick={handleRefresh} 
            title="Refresh data"
            className="refresh-icon"
            disabled={loading}
          >
            <IconRefresh size={18} />
          </ActionIcon>
          <ActionIcon variant="light" title="View fullscreen">
            <IconBrandZoom size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* KPI Cards */}
      <Grid gutter="md" mb="md">
        <Grid.Col xs={12} sm={6} md={3}>
          <StatsChartCard
            title="Total Sales"
            value="12,567"
            change={8.2}
            description="Compared to previous period"
            chartData={salesData}
            chartType="area"
            currency="$"
            color="blue"
            loading={loading}
            selectedTimeRange={timePeriod}
            onTimeRangeChange={handleTimePeriodChange}
            onRefresh={handleRefresh}
          />
        </Grid.Col>
        <Grid.Col xs={12} sm={6} md={3}>
          <StatsChartCard
            title="Orders"
            value="486"
            change={5.7}
            description="Total orders in period"
            chartData={ordersData}
            chartType="bar"
            color="green"
            loading={loading}
            selectedTimeRange={timePeriod}
            onTimeRangeChange={handleTimePeriodChange}
            onRefresh={handleRefresh}
          />
        </Grid.Col>
        <Grid.Col xs={12} sm={6} md={3}>
          <StatsChartCard
            title="New Customers"
            value="128"
            change={12.3}
            description="Unique new customers"
            chartData={customersData}
            chartType="area"
            color="violet"
            loading={loading}
            selectedTimeRange={timePeriod}
            onTimeRangeChange={handleTimePeriodChange}
            onRefresh={handleRefresh}
          />
        </Grid.Col>
        <Grid.Col xs={12} sm={6} md={3}>
          <StatsChartCard
            title="Conversion Rate"
            value="3.8%"
            change={-1.2}
            description="Visitor to customer rate"
            chartData={conversionData}
            chartType="pie"
            color="orange"
            loading={loading}
            selectedTimeRange={timePeriod}
            onTimeRangeChange={handleTimePeriodChange}
            onRefresh={handleRefresh}
          />
        </Grid.Col>
      </Grid>

      {/* AI Insights */}
      <Card withBorder mb="md" radius="md">
        <Group mb="sm">
          <ThemeIcon size="lg" color="blue" variant="light" radius="md">
            <IconBulb size={20} />
          </ThemeIcon>
          <Title order={4}>AI-Generated Insights</Title>
        </Group>
        
        <Grid>
          {insights.map((insight, index) => (
            <Grid.Col key={index} xs={12} md={4}>
              <AIInsightCard
                title={insight.title}
                description={insight.description}
                impact={insight.impact}
                confidence={insight.confidence}
                newInsight={true}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      {/* Detailed Analytics */}
      <Card withBorder radius="md">
        <Tabs 
          value={activeTab} 
          onTabChange={handleTabChange} 
          variant="pills"
          mb="md"
        >
          <Tabs.List>
            <Tabs.Tab 
              value="overview" 
              icon={<IconTrendingUp size={16} />}
            >
              Sales Overview
            </Tabs.Tab>
            <Tabs.Tab 
              value="categories" 
              icon={<IconChartPie size={16} />}
            >
              Categories
            </Tabs.Tab>
            <Tabs.Tab 
              value="products" 
              icon={<IconShoppingCart size={16} />}
            >
              Products
            </Tabs.Tab>
            <Tabs.Tab 
              value="customers" 
              icon={<IconUsers size={16} />}
            >
              Customers
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        <div className="tab-content">
          {activeTab === 'overview' && (
            <AnimatedChartJS
              title="Sales Trends"
              description="Monthly sales with year-over-year comparison"
              data={detailedSalesData}
              options={lineOptions}
              chartType="line"
              chartHeight={350}
              loading={loading}
              animate={true}
              animationDuration={1.2}
              downloadable={true}
              refreshable={true}
              onRefresh={handleRefresh}
              onDownload={() => console.log('Download data')}
              shadow="none"
              withBorder={false}
              p={0}
              mx="auto"
            />
          )}
          
          {activeTab === 'categories' && (
            <AnimatedChartJS
              title="Sales by Category"
              description="Distribution of sales across product categories"
              data={salesByCategory}
              options={pieOptions}
              chartType="pie"
              chartHeight={350}
              loading={loading}
              animate={true}
              animationDuration={1.2}
              downloadable={true}
              refreshable={true}
              onRefresh={handleRefresh}
              onDownload={() => console.log('Download data')}
              shadow="none"
              withBorder={false}
              p={0}
              mx="auto"
            />
          )}
          
          {activeTab === 'products' && (
            <AnimatedChartJS
              title="Top Product Performance"
              description="Units sold and revenue by product"
              data={productPerformance}
              options={barOptions}
              chartType="bar"
              chartHeight={350}
              loading={loading}
              animate={true}
              animationDuration={1}
              downloadable={true}
              refreshable={true}
              onRefresh={handleRefresh}
              onDownload={() => console.log('Download data')}
              shadow="none"
              withBorder={false}
              p={0}
              mx="auto"
            />
          )}
          
          {activeTab === 'customers' && (
            <Stack align="center" justify="center" h={350}>
              <Title order={3}>Customer Analytics</Title>
              <Text align="center">
                Customer analytics will be available in the next update.
              </Text>
            </Stack>
          )}
        </div>
      </Card>
    </Paper>
  );
};

export default AIAnalyticsDashboard;