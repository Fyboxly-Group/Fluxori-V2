import React, { useRef, useEffect, useState } from 'react';
import { 
  Table, 
  ScrollArea, 
  Badge, 
  Text, 
  Group, 
  Avatar, 
  createStyles, 
  ThemeIcon, 
  ActionIcon, 
  Tooltip, 
  Stack,
  Box,
  Menu,
  Checkbox,
  TextInput,
  Divider,
  Loader,
  Paper
} from '@mantine/core';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconEqual, 
  IconCrown, 
  IconFilterOff, 
  IconFilter, 
  IconSearch, 
  IconAdjustments, 
  IconRefresh,
  IconDotsVertical,
  IconEye,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react';
import { useAnimatedMount, useStaggerAnimation } from '@/hooks/useAnimation';
import gsap from 'gsap';

// Define styles for the component
const useStyles = createStyles((theme) => ({
  scrollTable: {
    minHeight: 200,
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
    zIndex: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },
  scrolled: {
    boxShadow: theme.shadows.xs,
  },
  tableRow: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
  buyBoxWinner: {
    backgroundColor: theme.fn.rgba(theme.colors.green[7], 0.07),
    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.colors.green[7], 0.12),
    },
  },
  yourSeller: {
    position: 'relative',
    borderLeft: `2px solid ${theme.colors.blue[6]}`,
  },
  crownIcon: {
    color: theme.colors.yellow[5],
  },
  competitorStatus: {
    fontWeight: 600,
  },
  priceDifference: {
    fontWeight: 600,
  },
  sortButton: {
    color: theme.colors.gray[6],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },
  activeSort: {
    color: theme.colors.blue[6],
  },
  priceUpdated: {
    animation: 'pulse 2s ease-in-out',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
  },
  tableWrapper: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.fn.rgba(
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      0.7
    ),
    zIndex: 2,
    borderRadius: theme.radius.sm,
  }
}));

export interface Competitor {
  id: string;
  sellerName: string;
  sellerAvatar?: string;
  price: number;
  quantity: number;
  rating?: number;
  shipping?: number;
  condition?: string;
  fulfillment?: string;
  hasBuyBox: boolean;
  isYou: boolean;
  lastPriceChange?: Date;
  priceChangeDirection?: 'up' | 'down' | 'none';
  priceChangeMagnitude?: number; // in percentage
}

export interface CompetitorTableProps {
  /** List of competitors */
  competitors: Competitor[];
  /** Currency symbol */
  currency?: string;
  /** Your current price */
  yourPrice: number;
  /** Loading state */
  loading?: boolean;
  /** Function to refresh data */
  onRefresh?: () => void;
  /** Function to view competitor details */
  onViewCompetitor?: (competitor: Competitor) => void;
  /** Function called when sorting changes */
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  /** Function called when filtering changes */
  onFilter?: (filters: Record<string, any>) => void;
}

/**
 * Table displaying Buy Box competitors with animations
 */
export const CompetitorTable: React.FC<CompetitorTableProps> = ({
  competitors,
  currency = '$',
  yourPrice,
  loading = false,
  onRefresh,
  onViewCompetitor,
  onSort,
  onFilter,
}) => {
  const { classes, cx, theme } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [sortField, setSortField] = useState<string>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({
    showOnlyInStock: false,
    showOnlyPrime: false,
    showOnlyNew: false,
  });
  
  // References for animations
  const tableRef = useAnimatedMount('fadeInUp', { duration: 0.5 });
  const rowsContainerRef = useStaggerAnimation({ stagger: 0.05 });
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  // Price cells refs for animation
  const priceCellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  
  // Handle scroll
  const handleScroll = () => {
    if (scrollViewportRef.current) {
      const current = scrollViewportRef.current;
      setScrolled(current.scrollTop > 0);
    }
  };
  
  // Filter competitors based on search and filters
  const filteredCompetitors = competitors.filter(competitor => {
    // Search filter
    if (
      searchQuery && 
      !competitor.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Other filters
    if (filters.showOnlyInStock && competitor.quantity <= 0) {
      return false;
    }
    
    if (filters.showOnlyPrime && competitor.fulfillment !== 'Prime') {
      return false;
    }
    
    if (filters.showOnlyNew && competitor.condition !== 'New') {
      return false;
    }
    
    return true;
  });
  
  // Sort competitors
  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'name':
        comparison = a.sellerName.localeCompare(b.sellerName);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      if (onSort) onSort(field, newDirection);
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
      if (onSort) onSort(field, 'asc');
    }
  };
  
  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) onFilter(newFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      showOnlyInStock: false,
      showOnlyPrime: false,
      showOnlyNew: false,
    });
    setSearchQuery('');
    if (onFilter) onFilter({});
  };
  
  // Format price difference
  const formatPriceDifference = (competitorPrice: number) => {
    const difference = competitorPrice - yourPrice;
    const formattedValue = Math.abs(difference).toFixed(2);
    
    // Return formatted string with appropriate symbol
    if (difference === 0) return 'Same price';
    return difference > 0 
      ? `+${currency}${formattedValue}` 
      : `-${currency}${formattedValue}`;
  };
  
  // Get icon for price change direction
  const getPriceChangeIcon = (direction?: 'up' | 'down' | 'none') => {
    switch (direction) {
      case 'up':
        return <IconTrendingUp size={16} color={theme.colors.red[6]} />;
      case 'down':
        return <IconTrendingDown size={16} color={theme.colors.green[6]} />;
      case 'none':
        return <IconEqual size={16} color={theme.colors.gray[6]} />;
      default:
        return null;
    }
  };
  
  // Format price change percentage
  const formatPriceChange = (direction?: 'up' | 'down' | 'none', magnitude?: number) => {
    if (!direction || direction === 'none' || !magnitude) return '';
    return `${direction === 'up' ? '+' : '-'}${magnitude.toFixed(1)}%`;
  };
  
  // Animate price cells when they update
  useEffect(() => {
    Object.entries(priceCellRefs.current).forEach(([id, element]) => {
      if (!element) return;
      
      const competitor = competitors.find(c => c.id === id);
      if (!competitor || !competitor.lastPriceChange) return;
      
      // Check if price was updated in the last minute
      const now = new Date();
      const priceUpdateTime = new Date(competitor.lastPriceChange);
      const diffInSeconds = (now.getTime() - priceUpdateTime.getTime()) / 1000;
      
      // Only animate recent price changes (last 60 seconds)
      if (diffInSeconds < 60) {
        gsap.fromTo(
          element,
          { 
            backgroundColor: competitor.priceChangeDirection === 'up' 
              ? theme.fn.rgba(theme.colors.red[5], 0.2)
              : theme.fn.rgba(theme.colors.green[5], 0.2)
          },
          { 
            backgroundColor: 'transparent',
            duration: 2,
            ease: 'power2.out'
          }
        );
      }
    });
  }, [competitors, theme]);
  
  return (
    <Paper withBorder radius="md" p="md" ref={tableRef}>
      {/* Controls */}
      <Box className={classes.controls} mb="sm">
        {/* Search and filters */}
        <Group spacing="xs">
          <TextInput
            placeholder="Search sellers"
            icon={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
            style={{ width: 200 }}
          />
          
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon 
                variant="default"
                title="Filter options"
              >
                <IconFilter size={16} />
              </ActionIcon>
            </Menu.Target>
            
            <Menu.Dropdown>
              <Menu.Label>Filter Options</Menu.Label>
              
              <Menu.Item closeMenuOnClick={false}>
                <Checkbox
                  label="In stock only"
                  checked={filters.showOnlyInStock}
                  onChange={(e) => handleFilterChange('showOnlyInStock', e.currentTarget.checked)}
                />
              </Menu.Item>
              
              <Menu.Item closeMenuOnClick={false}>
                <Checkbox
                  label="Prime fulfillment only"
                  checked={filters.showOnlyPrime}
                  onChange={(e) => handleFilterChange('showOnlyPrime', e.currentTarget.checked)}
                />
              </Menu.Item>
              
              <Menu.Item closeMenuOnClick={false}>
                <Checkbox
                  label="New condition only"
                  checked={filters.showOnlyNew}
                  onChange={(e) => handleFilterChange('showOnlyNew', e.currentTarget.checked)}
                />
              </Menu.Item>
              
              <Divider my="xs" />
              
              <Menu.Item 
                icon={<IconFilterOff size={16} />}
                onClick={resetFilters}
              >
                Reset all filters
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        
        {/* Actions */}
        <Group spacing="xs">
          <Badge size="sm">
            {filteredCompetitors.length} of {competitors.length} sellers
          </Badge>
          
          <ActionIcon
            variant="default"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh data"
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Box>
      
      {/* Table */}
      <div className={classes.tableWrapper}>
        {loading && (
          <div className={classes.loadingOverlay}>
            <Stack align="center" spacing="xs">
              <Loader />
              <Text size="sm" color="dimmed">Loading competitor data...</Text>
            </Stack>
          </div>
        )}
        
        <ScrollArea 
          sx={{ height: 400 }} 
          onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
          viewportRef={scrollViewportRef}
          className={classes.scrollTable}
        >
          <Table striped highlightOnHover>
            <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <tr>
                <th style={{ width: 200 }}>
                  <Group spacing={4} position="apart" style={{ flexWrap: 'nowrap' }}>
                    <Text>Seller</Text>
                    <ActionIcon
                      size="xs"
                      onClick={() => handleSortChange('name')}
                      className={cx(classes.sortButton, {
                        [classes.activeSort]: sortField === 'name',
                      })}
                    >
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
                      ) : (
                        <IconArrowsSort size={14} />
                      )}
                    </ActionIcon>
                  </Group>
                </th>
                <th>
                  <Group spacing={4} position="apart" style={{ flexWrap: 'nowrap' }}>
                    <Text>Price</Text>
                    <ActionIcon
                      size="xs"
                      onClick={() => handleSortChange('price')}
                      className={cx(classes.sortButton, {
                        [classes.activeSort]: sortField === 'price',
                      })}
                    >
                      {sortField === 'price' ? (
                        sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
                      ) : (
                        <IconArrowsSort size={14} />
                      )}
                    </ActionIcon>
                  </Group>
                </th>
                <th>Difference</th>
                <th>
                  <Group spacing={4} position="apart" style={{ flexWrap: 'nowrap' }}>
                    <Text>Quantity</Text>
                    <ActionIcon
                      size="xs"
                      onClick={() => handleSortChange('quantity')}
                      className={cx(classes.sortButton, {
                        [classes.activeSort]: sortField === 'quantity',
                      })}
                    >
                      {sortField === 'quantity' ? (
                        sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />
                      ) : (
                        <IconArrowsSort size={14} />
                      )}
                    </ActionIcon>
                  </Group>
                </th>
                <th>Status</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody ref={rowsContainerRef}>
              {sortedCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text color="dimmed">No competitors found</Text>
                  </td>
                </tr>
              ) : (
                sortedCompetitors.map((competitor) => (
                  <tr
                    key={competitor.id}
                    className={cx(
                      classes.tableRow,
                      { [classes.buyBoxWinner]: competitor.hasBuyBox },
                      { [classes.yourSeller]: competitor.isYou }
                    )}
                    onClick={() => onViewCompetitor && onViewCompetitor(competitor)}
                  >
                    <td>
                      <Group spacing="sm" noWrap>
                        {competitor.hasBuyBox && (
                          <ThemeIcon color="yellow" variant="light" radius="xl" size="sm">
                            <IconCrown size={14} className={classes.crownIcon} />
                          </ThemeIcon>
                        )}
                        
                        <Avatar
                          src={competitor.sellerAvatar}
                          size={26}
                          radius="xl"
                          color={competitor.isYou ? 'blue' : 'gray'}
                        >
                          {competitor.sellerName.charAt(0)}
                        </Avatar>
                        
                        <Text size="sm" weight={competitor.isYou ? 700 : 400}>
                          {competitor.sellerName}
                          {competitor.isYou && ' (You)'}
                        </Text>
                      </Group>
                    </td>
                    <td
                      ref={(el) => priceCellRefs.current[competitor.id] = el}
                    >
                      <Group spacing={4} noWrap>
                        <Text weight={600}>
                          {currency}{competitor.price.toFixed(2)}
                        </Text>
                        {competitor.priceChangeDirection && (
                          <Tooltip
                            label={`Price ${competitor.priceChangeDirection === 'up' ? 'increased' : 'decreased'} by ${
                              competitor.priceChangeMagnitude
                            }% recently`}
                          >
                            <Box>
                              {getPriceChangeIcon(competitor.priceChangeDirection)}
                            </Box>
                          </Tooltip>
                        )}
                      </Group>
                    </td>
                    <td>
                      <Text
                        size="sm"
                        color={
                          competitor.price > yourPrice 
                            ? 'green' 
                            : competitor.price < yourPrice 
                              ? 'red' 
                              : 'dimmed'
                        }
                        weight={500}
                      >
                        {formatPriceDifference(competitor.price)}
                      </Text>
                    </td>
                    <td>
                      <Badge 
                        color={competitor.quantity > 0 ? 'blue' : 'gray'} 
                        variant={competitor.quantity > 0 ? 'light' : 'outline'}
                      >
                        {competitor.quantity > 0 ? competitor.quantity : 'Out of stock'}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing={4} noWrap>
                        <Badge 
                          color={competitor.hasBuyBox ? 'green' : 'blue'} 
                          variant={competitor.hasBuyBox ? 'filled' : 'light'}
                          size="sm"
                        >
                          {competitor.hasBuyBox ? 'Buy Box' : 'Competing'}
                        </Badge>
                      </Group>
                    </td>
                    <td>
                      <ActionIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCompetitor && onViewCompetitor(competitor);
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </div>
    </Paper>
  );
};

export default CompetitorTable;