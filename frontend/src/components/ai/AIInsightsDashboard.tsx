import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid, 
  Paper, 
  Title, 
  Text, 
  Group, 
  ActionIcon,
  useMantineTheme, 
  Tabs, 
  Select,
  Stack,
  Badge,
  Card,
  Progress,
  Divider,
  Menu,
  Tooltip,
  Box,
  SimpleGrid
} from '@mantine/core';
import { 
  IconRefresh, 
  IconBulb, 
  IconChartLine, 
  IconTrendingUp, 
  IconAlertTriangle,
  IconTargetArrow,
  IconFilter,
  IconStar,
  IconTriangle,
  IconCirclePlus,
  IconEye,
  IconEyeOff,
  IconDotsVertical,
  IconArrowsSort,
  IconCalendar,
  IconDeviceAnalytics,
  IconListDetails,
  IconLayoutGrid
} from '@tabler/icons-react';
import gsap from 'gsap';
import { useAnimatedMount } from '@/hooks/useAnimation';
import AIInsightCard from './AIInsightCard';
import { AIAnalyticsDashboard } from './AIAnalyticsDashboard';

// Impact types for insights
type ImpactType = 'positive' | 'negative' | 'neutral';

// Insight category
type InsightCategory = 'performance' | 'opportunity' | 'risk' | 'competitive';

// Insight data structure
interface InsightData {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  impact: ImpactType;
  confidence: number;
  timestamp: Date;
  source: string;
  tags: string[];
  isNew?: boolean;
  isSaved?: boolean;
  metadata?: Record<string, any>;
  relatedInsights?: string[];
}

// Filter state
interface FilterState {
  categories: InsightCategory[];
  impacts: ImpactType[];
  minConfidence: number;
  dateRange: 'all' | '24h' | '7d' | '30d';
  sources: string[];
  savedOnly: boolean;
  tags: string[];
}

export interface AIInsightsDashboardProps {
  /** Whether data is loading */
  loading?: boolean;
  /** Initial insights data (when not loading from API) */
  initialInsights?: InsightData[];
  /** Function called to load more insights */
  onLoadMore?: () => void;
  /** Function called when insights are filtered */
  onFilter?: (filters: FilterState) => void;
  /** Function called when an insight is saved */
  onSaveInsight?: (insightId: string) => void;
  /** Function called when the dashboard is refreshed */
  onRefresh?: () => void;
  /** Function called when a new insight is requested */
  onRequestInsight?: (category: InsightCategory) => void;
}

/**
 * AI Insights Dashboard with comprehensive visualizations and filtering
 * Follows Fluxori's Motion Design Guide principles
 */
export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  loading = false,
  initialInsights = [],
  onLoadMore,
  onFilter,
  onSaveInsight,
  onRefresh,
  onRequestInsight
}) => {
  const theme = useMantineTheme();
  const dashboardRef = useAnimatedMount('fadeIn', { duration: 0.5 });
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'impact'>('date');
  const [insights, setInsights] = useState<InsightData[]>(initialInsights);
  const [filters, setFilters] = useState<FilterState>({
    categories: ['performance', 'opportunity', 'risk', 'competitive'],
    impacts: ['positive', 'negative', 'neutral'],
    minConfidence: 0,
    dateRange: 'all',
    sources: [],
    savedOnly: false,
    tags: []
  });

  // Static sample data (replace with actual API data in production)
  const sampleInsights: InsightData[] = [
    {
      id: '1',
      title: 'Inventory Optimization Opportunity',
      description: 'You could reduce inventory costs by 18% by optimizing stock levels for 5 slow-moving SKUs.',
      category: 'opportunity',
      impact: 'positive',
      confidence: 0.87,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      source: 'inventory_analysis',
      tags: ['inventory', 'cost-reduction', 'optimization'],
      isNew: true,
      metadata: {
        potentialSavings: '$2,450',
        affectedSkus: ['SKU-1001', 'SKU-1042', 'SKU-1078', 'SKU-1094', 'SKU-1123'],
        implementationDifficulty: 'low'
      }
    },
    {
      id: '2',
      title: 'Price Erosion Risk Detected',
      description: 'Competitor price drops detected across 12 products in category X, indicating potential market pressure.',
      category: 'risk',
      impact: 'negative',
      confidence: 0.91,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      source: 'competitor_monitoring',
      tags: ['pricing', 'competition', 'market-trends'],
      isNew: true,
      metadata: {
        averagePriceDrop: '7.3%',
        affectedCategory: 'Electronics',
        competitorCount: 3,
        affectedSkus: 12
      }
    },
    {
      id: '3',
      title: 'Buy Box Win Rate Improvement',
      description: 'Your Buy Box win rate has increased by 23% since implementing the new pricing strategy.',
      category: 'performance',
      impact: 'positive',
      confidence: 0.95,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      source: 'buy_box_analysis',
      tags: ['buy-box', 'pricing-strategy', 'performance'],
      isSaved: true,
      metadata: {
        previousWinRate: '68%',
        currentWinRate: '91%',
        affectedProducts: 34,
        pricingStrategy: 'Adaptive Competitor Beat'
      }
    },
    {
      id: '4',
      title: 'Emerging Market Opportunity',
      description: 'Analysis suggests demand growth for Product Category Y in Market Z, representing potential expansion opportunity.',
      category: 'opportunity',
      impact: 'positive',
      confidence: 0.79,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      source: 'market_analysis',
      tags: ['market-expansion', 'trends', 'growth'],
      metadata: {
        marketGrowthRate: '18%',
        competitionLevel: 'Low',
        entryBarriers: 'Medium',
        potentialRevenue: '$15,000 - $25,000 monthly'
      }
    },
    {
      id: '5',
      title: 'Shipping Delay Risk',
      description: 'Weather conditions in region X may cause shipping delays affecting approximately 15% of your current orders.',
      category: 'risk',
      impact: 'negative',
      confidence: 0.83,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      source: 'logistics_monitoring',
      tags: ['shipping', 'logistics', 'weather'],
      metadata: {
        affectedRegion: 'Northwest',
        expectedDelayDays: '2-3',
        affectedOrderCount: 47,
        mitigation: 'Consider expedited shipping alternatives'
      }
    },
    {
      id: '6',
      title: 'Competitive Position Improvement',
      description: 'Your market share in Category A has increased by 5.2% over the last 30 days, outpacing competitors.',
      category: 'competitive',
      impact: 'positive',
      confidence: 0.88,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      source: 'market_analysis',
      tags: ['market-share', 'competitive-position', 'growth'],
      isSaved: true,
      metadata: {
        previousMarketShare: '12.8%',
        currentMarketShare: '18.0%',
        largestCompetitor: 'Competitor X (23.5%)',
        growthFactors: ['Pricing optimization', 'Improved stock availability', 'Expanded selection']
      }
    },
    {
      id: '7',
      title: 'Product Return Rate Increase',
      description: 'Return rate for Product X has increased by 8.5% over the past 14 days, potentially indicating quality issues.',
      category: 'risk',
      impact: 'negative',
      confidence: 0.82,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      source: 'quality_monitoring',
      tags: ['returns', 'quality', 'product-issues'],
      metadata: {
        previousReturnRate: '2.1%',
        currentReturnRate: '10.6%',
        primaryReturnReason: 'Functionality issues',
        affectedSkus: ['SKU-2053', 'SKU-2054', 'SKU-2055'],
        recommendedAction: 'Quality check with supplier'
      }
    },
    {
      id: '8',
      title: 'Sales Velocity Increase',
      description: 'Products in Category Z are selling 35% faster than last month, consider increasing stock levels.',
      category: 'performance',
      impact: 'positive',
      confidence: 0.89,
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      source: 'sales_analysis',
      tags: ['sales-velocity', 'inventory-planning', 'growth'],
      metadata: {
        previousUnitsPerDay: '24',
        currentUnitsPerDay: '32.4',
        topSellingProduct: 'SKU-3087',
        stockOutRisk: 'High (within 15 days at current rate)',
        recommendedAction: 'Increase purchase order quantity by 40%'
      }
    }
  ];

  // Initialize with sample data if no initial insights
  useEffect(() => {
    if (initialInsights.length === 0 && insights.length === 0) {
      setInsights(sampleInsights);
    } else if (initialInsights.length > 0) {
      setInsights(initialInsights);
    }
  }, [initialInsights]);

  // Animation for header on scroll
  useEffect(() => {
    if (!headerRef.current) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        gsap.to(headerRef.current, {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          backgroundColor: theme.colorScheme === 'dark' 
            ? `${theme.colors.dark[7]}f0` 
            : `${theme.white}f0`,
          backdropFilter: 'blur(5px)',
          duration: 0.3
        });
      } else {
        gsap.to(headerRef.current, {
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          backgroundColor: theme.colorScheme === 'dark' 
            ? theme.colors.dark[7] 
            : theme.white,
          backdropFilter: 'blur(0px)',
          duration: 0.3
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    const cardsContainer = document.querySelector('.insight-cards-container');
    if (cardsContainer) {
      gsap.to(cardsContainer, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setActiveTab(value);
          gsap.to(cardsContainer, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            delay: 0.1
          });
        }
      });
    } else {
      setActiveTab(value);
    }
  };

  // Calculate category counts
  const categoryCounts = {
    all: insights.length,
    performance: insights.filter(i => i.category === 'performance').length,
    opportunity: insights.filter(i => i.category === 'opportunity').length,
    risk: insights.filter(i => i.category === 'risk').length,
    competitive: insights.filter(i => i.category === 'competitive').length,
    saved: insights.filter(i => i.isSaved).length
  };

  // Filter insights based on active tab and filters
  const filteredInsights = insights.filter(insight => {
    // Tab filter
    if (activeTab !== 'all' && activeTab !== 'saved') {
      if (insight.category !== activeTab) return false;
    }
    
    if (activeTab === 'saved' && !insight.isSaved) return false;
    
    // Applied filters
    if (!filters.categories.includes(insight.category)) return false;
    if (!filters.impacts.includes(insight.impact)) return false;
    if (insight.confidence < filters.minConfidence) return false;
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const insightDate = new Date(insight.timestamp);
      const diffHours = (now.getTime() - insightDate.getTime()) / (1000 * 60 * 60);
      
      if (filters.dateRange === '24h' && diffHours > 24) return false;
      if (filters.dateRange === '7d' && diffHours > 24 * 7) return false;
      if (filters.dateRange === '30d' && diffHours > 24 * 30) return false;
    }
    
    // Saved only filter
    if (filters.savedOnly && !insight.isSaved) return false;
    
    // Source filter
    if (filters.sources.length > 0 && !filters.sources.includes(insight.source)) return false;
    
    // Tags filter
    if (filters.tags.length > 0 && !insight.tags.some(tag => filters.tags.includes(tag))) return false;
    
    return true;
  });
  
  // Sort insights
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'confidence') {
      return b.confidence - a.confidence;
    } else if (sortBy === 'impact') {
      // Sort positive first, then neutral, then negative
      const impactValue = (impact: ImpactType) => {
        if (impact === 'positive') return 2;
        if (impact === 'neutral') return 1;
        return 0;
      };
      return impactValue(b.impact) - impactValue(a.impact);
    }
    return 0;
  });

  // Handle saving an insight
  const handleSaveInsight = (insightId: string) => {
    // Animate the star icon
    const starIcon = document.querySelector(`[data-insight-id="${insightId}"] .save-icon`);
    if (starIcon) {
      gsap.timeline()
        .to(starIcon, { 
          scale: 1.4, 
          duration: 0.2, 
          ease: 'back.out(1.7)' 
        })
        .to(starIcon, { 
          scale: 1, 
          duration: 0.3, 
          ease: 'elastic.out(1, 0.3)' 
        });
    }
    
    // Update local state
    setInsights(prevInsights => 
      prevInsights.map(insight => 
        insight.id === insightId 
          ? { ...insight, isSaved: !insight.isSaved }
          : insight
      )
    );
    
    // Call the callback
    if (onSaveInsight) {
      onSaveInsight(insightId);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (!onRefresh) return;
    
    // Animate refresh icon
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

  // Request new insight for a category
  const handleRequestInsight = (category: InsightCategory) => {
    if (!onRequestInsight) return;
    
    // Animate the button
    const requestButton = document.querySelector(`.request-${category}-button`);
    if (requestButton) {
      gsap.fromTo(
        requestButton,
        { scale: 0.95 },
        { 
          scale: 1, 
          duration: 0.3, 
          ease: 'back.out(1.7)',
          onComplete: () => onRequestInsight(category)
        }
      );
    } else {
      onRequestInsight(category);
    }
  };

  // Change view mode with animation
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    const cardsContainer = document.querySelector('.insight-cards-container');
    if (cardsContainer && mode !== viewMode) {
      gsap.to(cardsContainer, {
        opacity: 0,
        scale: 0.98,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setViewMode(mode);
          
          // Allow for DOM update before animating in
          setTimeout(() => {
            gsap.to(cardsContainer, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            });
          }, 10);
        }
      });
    }
  };

  // Apply filter changes
  const applyFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (onFilter) {
      onFilter(updatedFilters);
    }
  };

  // Get badge color based on category
  const getCategoryColor = (category: InsightCategory) => {
    switch (category) {
      case 'performance':
        return 'blue';
      case 'opportunity':
        return 'green';
      case 'risk':
        return 'red';
      case 'competitive':
        return 'violet';
      default:
        return 'gray';
    }
  };

  // Get icon based on category
  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'performance':
        return <IconChartLine size={16} />;
      case 'opportunity':
        return <IconTargetArrow size={16} />;
      case 'risk':
        return <IconAlertTriangle size={16} />;
      case 'competitive':
        return <IconTrendingUp size={16} />;
      default:
        return <IconBulb size={16} />;
    }
  };

  return (
    <Stack spacing="md" ref={dashboardRef}>
      {/* Sticky Header */}
      <Paper 
        ref={headerRef} 
        p="md" 
        radius="md" 
        withBorder 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          transition: 'box-shadow 0.3s ease, background-color 0.3s ease'
        }}
      >
        <Group position="apart" mb="xs">
          <Group>
            <Title order={3}>AI Insights</Title>
            <Badge size="lg" color="blue" variant="filled">
              {insights.filter(i => i.isNew).length} New
            </Badge>
          </Group>
          
          <Group spacing="xs">
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconFilter size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown maw={300}>
                <Menu.Label>Filter Insights</Menu.Label>
                
                <Menu.Item closeMenuOnClick={false}>
                  <Text weight={500} size="sm" mb="xs">Minimum Confidence</Text>
                  <Group position="apart" align="center" spacing="xs">
                    <Text size="xs">0%</Text>
                    <Box sx={{ flex: 1 }}>
                      <Progress 
                        value={filters.minConfidence * 100} 
                        size="sm" 
                        radius="xl"
                      />
                    </Box>
                    <Text size="xs">100%</Text>
                  </Group>
                  <Select
                    data={[
                      { value: '0', label: 'Any confidence' },
                      { value: '0.7', label: '70% or higher' },
                      { value: '0.8', label: '80% or higher' },
                      { value: '0.9', label: '90% or higher' }
                    ]}
                    value={String(filters.minConfidence)}
                    onChange={(value) => applyFilters({ minConfidence: Number(value) })}
                    size="xs"
                    mt="xs"
                  />
                </Menu.Item>
                
                <Divider my="xs" />
                
                <Menu.Label>Time Range</Menu.Label>
                <Menu.Item 
                  icon={<IconCalendar size={14} />}
                  closeMenuOnClick={false}
                >
                  <Select
                    data={[
                      { value: 'all', label: 'All time' },
                      { value: '24h', label: 'Last 24 hours' },
                      { value: '7d', label: 'Last 7 days' },
                      { value: '30d', label: 'Last 30 days' }
                    ]}
                    value={filters.dateRange}
                    onChange={(value) => applyFilters({ dateRange: value as any })}
                    size="xs"
                  />
                </Menu.Item>
                
                <Divider my="xs" />
                
                <Menu.Label>Categories</Menu.Label>
                {(['performance', 'opportunity', 'risk', 'competitive'] as InsightCategory[]).map(category => (
                  <Menu.Item
                    key={category}
                    icon={getCategoryIcon(category)}
                    closeMenuOnClick={false}
                    onClick={() => {
                      const isActive = filters.categories.includes(category);
                      const updatedCategories = isActive
                        ? filters.categories.filter(c => c !== category)
                        : [...filters.categories, category];
                      applyFilters({ categories: updatedCategories });
                    }}
                  >
                    <Group position="apart">
                      <Text size="sm" transform="capitalize">{category}</Text>
                      {filters.categories.includes(category) ? (
                        <Badge size="xs" color={getCategoryColor(category)}>Active</Badge>
                      ) : (
                        <Badge size="xs" color="gray" variant="outline">Filtered</Badge>
                      )}
                    </Group>
                  </Menu.Item>
                ))}
                
                <Divider my="xs" />
                
                <Menu.Label>Impact</Menu.Label>
                {(['positive', 'negative', 'neutral'] as ImpactType[]).map(impact => (
                  <Menu.Item
                    key={impact}
                    icon={
                      impact === 'positive' ? <IconTriangle size={14} style={{ transform: 'rotate(0deg)' }} /> :
                      impact === 'negative' ? <IconTriangle size={14} style={{ transform: 'rotate(180deg)' }} /> :
                      <IconArrowsSort size={14} />
                    }
                    closeMenuOnClick={false}
                    onClick={() => {
                      const isActive = filters.impacts.includes(impact);
                      const updatedImpacts = isActive
                        ? filters.impacts.filter(i => i !== impact)
                        : [...filters.impacts, impact];
                      applyFilters({ impacts: updatedImpacts });
                    }}
                  >
                    <Group position="apart">
                      <Text size="sm" transform="capitalize">{impact}</Text>
                      {filters.impacts.includes(impact) ? (
                        <Badge size="xs" color={
                          impact === 'positive' ? 'green' : 
                          impact === 'negative' ? 'red' : 'gray'
                        }>Active</Badge>
                      ) : (
                        <Badge size="xs" color="gray" variant="outline">Filtered</Badge>
                      )}
                    </Group>
                  </Menu.Item>
                ))}
                
                <Divider my="xs" />
                
                <Menu.Item
                  icon={filters.savedOnly ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                  onClick={() => applyFilters({ savedOnly: !filters.savedOnly })}
                >
                  {filters.savedOnly ? 'Show All Insights' : 'Show Saved Only'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconArrowsSort size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Sort Insights</Menu.Label>
                <Menu.Item
                  icon={<IconCalendar size={14} />}
                  onClick={() => setSortBy('date')}
                >
                  <Group position="apart">
                    <Text>Date (newest first)</Text>
                    {sortBy === 'date' && <Badge size="xs">Active</Badge>}
                  </Group>
                </Menu.Item>
                <Menu.Item
                  icon={<IconStar size={14} />}
                  onClick={() => setSortBy('confidence')}
                >
                  <Group position="apart">
                    <Text>Confidence (highest first)</Text>
                    {sortBy === 'confidence' && <Badge size="xs">Active</Badge>}
                  </Group>
                </Menu.Item>
                <Menu.Item
                  icon={<IconTriangle size={14} />}
                  onClick={() => setSortBy('impact')}
                >
                  <Group position="apart">
                    <Text>Impact (positive first)</Text>
                    {sortBy === 'impact' && <Badge size="xs">Active</Badge>}
                  </Group>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            
            <Group spacing={0}>
              <Tooltip label="Grid View">
                <ActionIcon 
                  variant={viewMode === 'grid' ? 'filled' : 'light'} 
                  color={viewMode === 'grid' ? 'blue' : 'gray'}
                  onClick={() => handleViewModeChange('grid')}
                >
                  <IconLayoutGrid size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="List View">
                <ActionIcon 
                  variant={viewMode === 'list' ? 'filled' : 'light'} 
                  color={viewMode === 'list' ? 'blue' : 'gray'}
                  onClick={() => handleViewModeChange('list')}
                >
                  <IconListDetails size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            <ActionIcon 
              variant="light" 
              onClick={handleRefresh} 
              className="refresh-icon"
              size="lg"
              disabled={loading}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Group>
        </Group>
        
        <Tabs 
          value={activeTab} 
          onTabChange={handleTabChange}
          variant="pills"
        >
          <Tabs.List>
            <Tabs.Tab 
              value="all" 
              icon={<IconBulb size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'all' ? 'filled' : 'light'}
                >
                  {categoryCounts.all}
                </Badge>
              }
            >
              All
            </Tabs.Tab>
            <Tabs.Tab 
              value="performance" 
              icon={<IconChartLine size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  color="blue" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'performance' ? 'filled' : 'light'}
                >
                  {categoryCounts.performance}
                </Badge>
              }
            >
              Performance
            </Tabs.Tab>
            <Tabs.Tab 
              value="opportunity" 
              icon={<IconTargetArrow size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  color="green" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'opportunity' ? 'filled' : 'light'}
                >
                  {categoryCounts.opportunity}
                </Badge>
              }
            >
              Opportunities
            </Tabs.Tab>
            <Tabs.Tab 
              value="risk" 
              icon={<IconAlertTriangle size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  color="red" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'risk' ? 'filled' : 'light'}
                >
                  {categoryCounts.risk}
                </Badge>
              }
            >
              Risks
            </Tabs.Tab>
            <Tabs.Tab 
              value="competitive" 
              icon={<IconTrendingUp size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  color="violet" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'competitive' ? 'filled' : 'light'}
                >
                  {categoryCounts.competitive}
                </Badge>
              }
            >
              Competitive
            </Tabs.Tab>
            <Tabs.Tab 
              value="saved" 
              icon={<IconStar size={16} />}
              rightSection={
                <Badge 
                  size="sm" 
                  color="yellow" 
                  radius="sm" 
                  p={3} 
                  sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                  variant={activeTab === 'saved' ? 'filled' : 'light'}
                >
                  {categoryCounts.saved}
                </Badge>
              }
            >
              Saved
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>
      
      {/* Request New Insight Actions */}
      <Grid gutter="md">
        <Grid.Col span={12} md={3}>
          <Card 
            withBorder 
            p="md" 
            shadow="xs"
            className="request-performance-button"
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => handleRequestInsight('performance')}
          >
            <Group position="apart" mb="xs">
              <Badge color="blue" variant="light">Performance</Badge>
              <ActionIcon variant="light" color="blue">
                <IconCirclePlus size={18} />
              </ActionIcon>
            </Group>
            <Text weight={500}>Request Performance Insight</Text>
            <Text size="sm" color="dimmed">Analyze sales, metrics & KPIs</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={12} md={3}>
          <Card 
            withBorder 
            p="md" 
            shadow="xs"
            className="request-opportunity-button"
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => handleRequestInsight('opportunity')}
          >
            <Group position="apart" mb="xs">
              <Badge color="green" variant="light">Opportunity</Badge>
              <ActionIcon variant="light" color="green">
                <IconCirclePlus size={18} />
              </ActionIcon>
            </Group>
            <Text weight={500}>Request Opportunity Insight</Text>
            <Text size="sm" color="dimmed">Discover growth possibilities</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={12} md={3}>
          <Card 
            withBorder 
            p="md" 
            shadow="xs"
            className="request-risk-button"
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => handleRequestInsight('risk')}
          >
            <Group position="apart" mb="xs">
              <Badge color="red" variant="light">Risk</Badge>
              <ActionIcon variant="light" color="red">
                <IconCirclePlus size={18} />
              </ActionIcon>
            </Group>
            <Text weight={500}>Request Risk Assessment</Text>
            <Text size="sm" color="dimmed">Identify potential issues</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={12} md={3}>
          <Card 
            withBorder 
            p="md" 
            shadow="xs"
            className="request-competitive-button"
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => handleRequestInsight('competitive')}
          >
            <Group position="apart" mb="xs">
              <Badge color="violet" variant="light">Competitive</Badge>
              <ActionIcon variant="light" color="violet">
                <IconCirclePlus size={18} />
              </ActionIcon>
            </Group>
            <Text weight={500}>Request Competitive Analysis</Text>
            <Text size="sm" color="dimmed">Analyze market position</Text>
          </Card>
        </Grid.Col>
      </Grid>
      
      {/* Analytics Dashboard */}
      <Card withBorder p="md" radius="md">
        <Title order={4} mb="md">AI-Enhanced Analytics</Title>
        <AIAnalyticsDashboard 
          loading={loading}
          onRefresh={handleRefresh}
          onTimePeriodChange={(period) => applyFilters({ dateRange: period as any })}
          timePeriod={filters.dateRange === 'all' ? '30d' : filters.dateRange}
        />
      </Card>
      
      {/* Insights Cards */}
      <Title order={4} mt="xl">
        {activeTab === 'all' ? 'All Insights' : 
         activeTab === 'saved' ? 'Saved Insights' : 
         `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Insights`}
      </Title>
      
      {/* Insights List/Grid */}
      <div className="insight-cards-container">
        {loading ? (
          <Group position="center" p="xl">
            <Text>Loading insights...</Text>
          </Group>
        ) : sortedInsights.length === 0 ? (
          <Card withBorder p="xl" radius="md">
            <Stack align="center" spacing="md">
              <IconBulb size={48} opacity={0.3} />
              <Text align="center" size="lg" weight={500}>No insights found</Text>
              <Text align="center" color="dimmed">
                Try adjusting your filters or request new insights using the buttons above.
              </Text>
            </Stack>
          </Card>
        ) : viewMode === 'grid' ? (
          <SimpleGrid 
            cols={3}
            breakpoints={[
              { maxWidth: 'lg', cols: 2 },
              { maxWidth: 'sm', cols: 1 }
            ]}
            spacing="lg"
          >
            {sortedInsights.map((insight, index) => (
              <div key={insight.id} data-insight-id={insight.id}>
                <AIInsightCard
                  title={insight.title}
                  description={insight.description}
                  impact={insight.impact}
                  confidence={insight.confidence}
                  newInsight={insight.isNew}
                  source={insight.source}
                  category={insight.category}
                  timestamp={insight.timestamp}
                  tags={insight.tags}
                  isSaved={insight.isSaved}
                  onSave={() => handleSaveInsight(insight.id)}
                  metadata={insight.metadata}
                />
              </div>
            ))}
          </SimpleGrid>
        ) : (
          <Stack spacing="md">
            {sortedInsights.map((insight, index) => (
              <div key={insight.id} data-insight-id={insight.id}>
                <AIInsightCard
                  title={insight.title}
                  description={insight.description}
                  impact={insight.impact}
                  confidence={insight.confidence}
                  newInsight={insight.isNew}
                  source={insight.source}
                  category={insight.category}
                  timestamp={insight.timestamp}
                  tags={insight.tags}
                  isSaved={insight.isSaved}
                  onSave={() => handleSaveInsight(insight.id)}
                  metadata={insight.metadata}
                  variant="horizontal"
                />
              </div>
            ))}
          </Stack>
        )}
        
        {/* Load More Button */}
        {sortedInsights.length > 0 && onLoadMore && (
          <Group position="center" mt="xl">
            <Card 
              p="sm" 
              withBorder 
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
              onClick={onLoadMore}
            >
              <Group>
                <Text>Load More Insights</Text>
              </Group>
            </Card>
          </Group>
        )}
      </div>
    </Stack>
  );
};

export default AIInsightsDashboard;