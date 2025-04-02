import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Group,
  Card,
  Badge,
  Select,
  TextInput,
  Button,
  MultiSelect,
  Divider,
  Timeline,
  Avatar,
  Pagination,
  ActionIcon,
  Title
} from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import {
  IconSearch,
  IconFilter,
  IconFilterOff,
  IconUser,
  IconClock,
  IconLogin,
  IconLogout,
  IconEdit,
  IconTrash,
  IconSettings,
  IconLock,
  IconKey,
  IconFileDownload,
  IconInfoCircle
} from '@tabler/icons-react';
import { useActivityLogs } from '@/hooks/user-management/useActivityLogs';
import { ActivityType } from '@/types/user-management';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

export function ActivityLog() {
  const {
    logs,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    filter,
    setFilter,
    activityTypes
  } = useActivityLogs();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Activity type options for filtering
  const activityTypeOptions = activityTypes.map(type => ({
    value: type,
    label: type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }));
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date for tooltip
  const formatDatePrecise = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Get icon for activity type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'login': return <IconLogin size={20} />;
      case 'logout': return <IconLogout size={20} />;
      case 'password_change': return <IconLock size={20} />;
      case 'profile_update': return <IconUser size={20} />;
      case 'role_change': return <IconKey size={20} />;
      case 'permission_change': return <IconKey size={20} />;
      case 'resource_create': return <IconEdit size={20} />;
      case 'resource_edit': return <IconEdit size={20} />;
      case 'resource_delete': return <IconTrash size={20} />;
      case 'password_reset_request': return <IconLock size={20} />;
      case 'settings_change': return <IconSettings size={20} />;
      default: return <IconInfoCircle size={20} />;
    }
  };
  
  // Get color for activity type
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'login': return 'green';
      case 'logout': return 'gray';
      case 'password_change': return 'blue';
      case 'profile_update': return 'teal';
      case 'role_change': return 'violet';
      case 'permission_change': return 'grape';
      case 'resource_create': return 'green';
      case 'resource_edit': return 'yellow';
      case 'resource_delete': return 'red';
      case 'password_reset_request': return 'orange';
      case 'settings_change': return 'cyan';
      default: return 'gray';
    }
  };
  
  // Export activity logs
  const exportLogs = () => {
    // In a real application, this would trigger an API call to export logs
    console.log('Exporting logs...');
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilter({});
  };
  
  // Animate timeline when data changes
  useEffect(() => {
    if (timelineRef.current && motionLevel !== 'minimal' && !isLoading) {
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [logs.items, isLoading, motionLevel]);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);
  
  return (
    <Box>
      <Group position="apart" mb="md">
        <Title order={2}>Activity Log</Title>
        <Button
          leftIcon={<IconFileDownload size={16} />}
          variant="light"
          onClick={exportLogs}
        >
          Export Logs
        </Button>
      </Group>
      
      <Card p="md" withBorder mb="md">
        <Group position="apart" align="flex-end">
          <Group align="flex-end">
            <TextInput
              label="Search"
              placeholder="Search activity logs..."
              icon={<IconSearch size={16} />}
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.currentTarget.value })}
              style={{ width: 250 }}
            />
            
            <MultiSelect
              label="Activity Type"
              placeholder="Filter by type"
              data={activityTypeOptions}
              value={filter.type || []}
              onChange={(values) => setFilter({ ...filter, type: values as ActivityType[] })}
              clearable
              icon={<IconFilter size={16} />}
              style={{ width: 250 }}
            />
            
            <DateRangePicker
              label="Date Range"
              placeholder="Filter by date range"
              value={filter.dateRange ? [filter.dateRange.startDate, filter.dateRange.endDate] : null}
              onChange={(value) => {
                if (value && value[0] && value[1]) {
                  setFilter({
                    ...filter,
                    dateRange: {
                      startDate: value[0],
                      endDate: value[1]
                    }
                  });
                } else {
                  const { dateRange, ...restFilter } = filter;
                  setFilter(restFilter);
                }
              }}
              style={{ width: 280 }}
            />
          </Group>
          
          {(filter.search || filter.type?.length || filter.dateRange) && (
            <Button
              variant="subtle"
              leftIcon={<IconFilterOff size={16} />}
              onClick={clearFilters}
              compact
            >
              Clear Filters
            </Button>
          )}
        </Group>
      </Card>
      
      <Card p="md" withBorder>
        <Box ref={timelineRef}>
          {isLoading ? (
            <Text color="dimmed" align="center" py="md">Loading activity logs...</Text>
          ) : error ? (
            <Text color="red" align="center" py="md">Error: {error}</Text>
          ) : logs.items.length === 0 ? (
            <Text color="dimmed" align="center" py="md">No activity logs found. Try adjusting your filters.</Text>
          ) : (
            <Timeline bulletSize={24} lineWidth={2}>
              {logs.items.map((log) => (
                <Timeline.Item
                  key={log.id}
                  bullet={getActivityIcon(log.type)}
                  title={
                    <Group spacing="xs">
                      <Text weight={500}>{log.description}</Text>
                      <Badge color={getActivityColor(log.type)} size="sm">
                        {log.type.replace('_', ' ')}
                      </Badge>
                    </Group>
                  }
                  className="timeline-item"
                  lineVariant="solid"
                >
                  <Group position="apart" noWrap mt={4}>
                    <Group spacing="xs" noWrap>
                      <Avatar size="sm" radius="xl" color="blue">
                        {log.userName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Text size="sm">{log.userName}</Text>
                    </Group>
                    
                    <Group spacing="xs" noWrap>
                      <IconClock size={14} stroke={1.5} />
                      <Text size="sm" color="dimmed" style={{ whiteSpace: 'nowrap' }} title={formatDatePrecise(log.timestamp)}>
                        {formatDate(log.timestamp)}
                      </Text>
                    </Group>
                  </Group>
                  
                  {log.resourceType && (
                    <Text size="sm" mt={4}>
                      <Text span weight={500}>Resource:</Text> {log.resourceType}
                      {log.resourceId && <Text span> ({log.resourceId})</Text>}
                    </Text>
                  )}
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <Box mt={4}>
                      <Text size="sm" weight={500}>Changes:</Text>
                      {Object.entries(log.details.changes || {}).map(([field, change]: [string, any]) => (
                        <Text size="sm" key={field}>
                          {field}: {change.previous} → {change.new}
                        </Text>
                      ))}
                    </Box>
                  )}
                  
                  <Text size="xs" color="dimmed" mt={4}>
                    IP: {log.ipAddress}
                  </Text>
                  
                  <Divider my="sm" />
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Box>
        
        <Group position="apart" mt="md">
          <Select
            label="Items per page"
            value={pageSize.toString()}
            onChange={(value) => value && setPageSize(parseInt(value))}
            data={['10', '20', '50', '100'].map(value => ({ value, label: value }))}
            style={{ width: 100 }}
          />
          
          <Pagination
            total={logs.totalPages}
            page={page}
            onChange={setPage}
            siblings={1}
            boundaries={1}
          />
        </Group>
      </Card>
    </Box>
  );
}