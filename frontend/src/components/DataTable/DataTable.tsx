import React, { useState } from 'react';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Box,
  TextInput,
  Menu,
  Pagination,
  Select,
  Badge,
  Loader,
  Card,
  Button,
  createStyles,
  UnstyledButton,
  Center,
  rem,
} from '@mantine/core';
import { useAnimatedMount } from '@/hooks/useAnimation';
import { 
  IconSearch, 
  IconSelector, 
  IconChevronDown, 
  IconChevronUp, 
  IconFilter, 
  IconDotsVertical, 
  IconEye, 
  IconEdit, 
  IconTrash,
  IconCloudDownload,
  IconFocus2
} from '@tabler/icons-react';
import { fadeInUp } from '@/animations/gsap';
import gsap from 'gsap';

// Styles for the component
const useStyles = createStyles((theme) => ({
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
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },

  row: {
    transition: 'background-color 100ms ease',
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  rowSelected: {
    backgroundColor: theme.colorScheme === 'dark' 
      ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
      : theme.colors[theme.primaryColor][0],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.25)
        : theme.colors[theme.primaryColor][1],
    },
  },

  tableControls: {
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    border: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  sortButton: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  emptyState: {
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
}));

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: number | string;
}

export interface DataTableFilter {
  key: string;
  value: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  selectable?: boolean;
  onRowClick?: (item: T) => void;
  onSelect?: (selectedItems: T[]) => void;
  actions?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    custom?: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: (item: T) => void;
    }>;
  };
  pagination?: {
    page: number;
    total: number;
    onPageChange: (page: number) => void;
    limit: number;
    onLimitChange?: (limit: number) => void;
  };
  emptyContent?: React.ReactNode;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: DataTableFilter[]) => void;
  showRowNumbers?: boolean;
  animateRows?: boolean;
}

/**
 * DataTable component with sorting, filtering, and selection capabilities
 */
export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  selectable = false,
  onRowClick,
  onSelect,
  actions,
  pagination,
  emptyContent,
  searchable = false,
  onSearch,
  onSort,
  onFilter,
  showRowNumbers = false,
  animateRows = true,
}: DataTableProps<T>) {
  const { classes, cx } = useStyles();
  const tableRef = useAnimatedMount('fadeInUp', { duration: 0.6 });
  
  // State for the component
  const [selection, setSelection] = useState<Set<string | number>>(new Set());
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [activeFilters, setActiveFilters] = useState<DataTableFilter[]>([]);
  
  // Handle row selection
  const toggleRow = (id: string | number) => {
    const newSelection = new Set(selection);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelection(newSelection);
    
    if (onSelect) {
      const selectedItems = data.filter(item => newSelection.has(item.id));
      onSelect(selectedItems);
    }
  };
  
  // Handle select all
  const toggleAll = () => {
    const newSelection = new Set<string | number>();
    if (selection.size < data.length) {
      data.forEach(item => newSelection.add(item.id));
    }
    setSelection(newSelection);
    
    if (onSelect) {
      const selectedItems = data.filter(item => newSelection.has(item.id));
      onSelect(selectedItems);
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };
  
  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortBy === key) {
      if (sortDirection === 'asc') {
        direction = 'desc';
      } else if (sortDirection === 'desc') {
        // Reset sorting
        setSortBy(null);
        setSortDirection(null);
        if (onSort) {
          onSort('', 'asc');
        }
        return;
      }
    }
    
    setSortBy(key);
    setSortDirection(direction);
    
    if (onSort) {
      onSort(key, direction);
    }
  };
  
  // Handle filtering
  const handleFilter = (key: string, value: string) => {
    const newFilters = [...activeFilters.filter(f => f.key !== key)];
    if (value) {
      newFilters.push({ key, value });
    }
    setActiveFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };
  
  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    setScrolled(scrollTop > 0);
    
    if (animateRows) {
      // Animate rows as they come into view during scroll
      const rows = event.currentTarget.querySelectorAll('tbody tr');
      const container = event.currentTarget;
      const containerHeight = container.clientHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + containerHeight;
      
      rows.forEach((row, index) => {
        const rowTop = row.offsetTop;
        const rowHeight = row.clientHeight;
        const rowBottom = rowTop + rowHeight;
        
        // If row is in viewport and not already animated
        if (
          rowBottom >= containerTop && 
          rowTop <= containerBottom &&
          !row.classList.contains('animated')
        ) {
          row.classList.add('animated');
          
          // Stagger animation based on row position
          gsap.fromTo(
            row, 
            { 
              opacity: 0, 
              x: -20
            }, 
            { 
              opacity: 1, 
              x: 0,
              duration: 0.3,
              delay: 0.05 * (index % 10), // Reset stagger after 10 rows
              ease: 'power2.out',
              clearProps: 'all'
            }
          );
        }
      });
    }
  };
  
  // Render sort button content
  const renderSortButton = (key: string, title: string) => {
    return (
      <UnstyledButton onClick={() => handleSort(key)} className={classes.sortButton}>
        <Group position="apart">
          <Text weight={sortBy === key ? 'bold' : 'normal'} size="sm">
            {title}
          </Text>
          
          {sortBy === key ? (
            sortDirection === 'asc' ? (
              <IconChevronUp size={14} stroke={1.5} />
            ) : (
              <IconChevronDown size={14} stroke={1.5} />
            )
          ) : (
            <IconSelector size={14} stroke={1.5} />
          )}
        </Group>
      </UnstyledButton>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <Center p="xl">
          <Loader />
        </Center>
      );
    }
    
    if (emptyContent) {
      return emptyContent;
    }
    
    return (
      <Box className={classes.emptyState}>
        <Text color="dimmed" size="lg" align="center" mt="md">
          No data to display
        </Text>
        {searchQuery && (
          <Text size="sm" align="center" mt="sm">
            Try adjusting your search or filter to find what you're looking for.
          </Text>
        )}
        {searchQuery && (
          <Button
            variant="subtle"
            onClick={() => handleSearch('')}
            mt="md"
          >
            Clear search
          </Button>
        )}
      </Box>
    );
  };
  
  // Render rows
  const rows = data.map((item, index) => {
    const selected = selection.has(item.id);
    
    return (
      <tr 
        key={item.id.toString()}
        className={cx(classes.row, { [classes.rowSelected]: selected })}
        onClick={() => onRowClick && onRowClick(item)}
        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
      >
        {selectable && (
          <td>
            <Checkbox
              checked={selected}
              onChange={() => toggleRow(item.id)}
              onClick={(e) => e.stopPropagation()} // Prevent row click
              transitionDuration={0}
            />
          </td>
        )}
        
        {showRowNumbers && (
          <td>{index + 1 + (pagination ? (pagination.page - 1) * pagination.limit : 0)}</td>
        )}
        
        {columns.map((column) => (
          <td key={column.key.toString()}>
            {column.render 
              ? column.render(item) 
              : (item[column.key as keyof T] as React.ReactNode)}
          </td>
        ))}
        
        {actions && (
          <td style={{ width: 140 }}>
            <Group spacing={4} position="right" noWrap>
              {actions.view && (
                <ActionIcon
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick && onRowClick(item);
                  }}
                >
                  <IconEye size={16} />
                </ActionIcon>
              )}
              
              {actions.edit && (
                <ActionIcon
                  color="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to edit page or open edit modal
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              )}
              
              {actions.delete && (
                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open delete confirmation
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
              
              {actions.custom && actions.custom.length > 0 && (
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon>
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  
                  <Menu.Dropdown>
                    {actions.custom.map((action, i) => (
                      <Menu.Item
                        key={i}
                        icon={action.icon}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(item);
                        }}
                      >
                        {action.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </td>
        )}
      </tr>
    );
  });
  
  return (
    <Card p="xs" ref={tableRef}>
      {/* Table controls */}
      <Group position="apart" className={classes.tableControls}>
        <Group>
          {searchable && (
            <TextInput
              placeholder="Search..."
              icon={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.currentTarget.value)}
              width={200}
            />
          )}
          
          {activeFilters.length > 0 && (
            <Group spacing={8}>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  onClose={() => handleFilter(filter.key, '')}
                  rightSection={
                    <ActionIcon
                      size="xs"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleFilter(filter.key, '')}
                    >
                      <IconTrash size={10} />
                    </ActionIcon>
                  }
                >
                  {filter.key}: {filter.value}
                </Badge>
              ))}
            </Group>
          )}
        </Group>
        
        <Group>
          <Button 
            leftIcon={<IconCloudDownload size={16} />} 
            variant="subtle"
            compact
          >
            Export
          </Button>
          
          <Menu shadow="md" width={200} withinPortal>
            <Menu.Target>
              <Button 
                leftIcon={<IconFilter size={16} />} 
                variant="subtle"
                compact
              >
                Filter
              </Button>
            </Menu.Target>
            
            <Menu.Dropdown>
              {columns
                .filter((column) => column.filterable)
                .map((column) => (
                  <Menu.Item key={column.key.toString()} closeMenuOnClick={false}>
                    <TextInput
                      label={column.title}
                      placeholder={`Filter by ${column.title.toLowerCase()}`}
                      value={activeFilters.find(f => f.key === column.key)?.value || ''}
                      onChange={(e) => handleFilter(column.key.toString(), e.currentTarget.value)}
                      size="xs"
                    />
                  </Menu.Item>
                ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      
      {/* Table */}
      <ScrollArea h="auto" onScrollPositionChange={handleScroll}>
        <Table striped highlightOnHover>
          <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <tr>
              {selectable && (
                <th style={{ width: 40 }}>
                  <Checkbox
                    onChange={toggleAll}
                    checked={selection.size > 0 && selection.size === data.length}
                    indeterminate={selection.size > 0 && selection.size < data.length}
                    transitionDuration={0}
                  />
                </th>
              )}
              
              {showRowNumbers && <th style={{ width: 40 }}>#</th>}
              
              {columns.map((column) => (
                <th 
                  key={column.key.toString()} 
                  style={{ width: column.width }}
                >
                  {column.sortable 
                    ? renderSortButton(column.key.toString(), column.title)
                    : column.title
                  }
                </th>
              ))}
              
              {actions && <th style={{ width: 140 }}>Actions</th>}
            </tr>
          </thead>
          
          <tbody>
            {data.length > 0 ? rows : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0) + (showRowNumbers ? 1 : 0)}>
                  {renderEmptyState()}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
      
      {/* Pagination */}
      {pagination && data.length > 0 && (
        <Group position="apart" mt="md">
          <Group spacing="xs">
            <Text size="sm">Rows per page:</Text>
            <Select
              value={pagination.limit.toString()}
              onChange={(value) => pagination.onLimitChange && pagination.onLimitChange(Number(value))}
              data={['10', '25', '50', '100']}
              size="xs"
              style={{ width: 70 }}
            />
          </Group>
          
          <Pagination
            total={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={pagination.onPageChange}
            withEdges
          />
        </Group>
      )}
    </Card>
  );
}

export default DataTable;