import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ActivityLogEntry, 
  ActivityType,
  PaginatedResult
} from '@/types/user-management';
import { activityLogs } from '@/mocks/userManagementData';

interface ActivityLogFilterOptions {
  userId?: string;
  type?: ActivityType[];
  search?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface ActivityLogSortOptions {
  field: 'timestamp' | 'userId' | 'userName' | 'type';
  direction: 'asc' | 'desc';
}

interface UseActivityLogsProps {
  initialPage?: number;
  initialPageSize?: number;
  initialSort?: ActivityLogSortOptions;
  initialFilter?: ActivityLogFilterOptions;
}

export function useActivityLogs({
  initialPage = 1,
  initialPageSize = 20,
  initialSort = { field: 'timestamp', direction: 'desc' },
  initialFilter = {}
}: UseActivityLogsProps = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sort, setSort] = useState<ActivityLogSortOptions>(initialSort);
  const [filter, setFilter] = useState<ActivityLogFilterOptions>(initialFilter);
  const [logsList, setLogsList] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Get a list of distinct activity types
  const activityTypes = useMemo<ActivityType[]>(() => {
    const types = new Set<ActivityType>();
    
    activityLogs.forEach(log => {
      types.add(log.type);
    });
    
    return Array.from(types);
  }, []);

  // Filter and sort logs
  const getFilteredAndSortedLogs = useCallback(() => {
    let filteredLogs = [...activityLogs];
    
    // Apply filters
    if (filter.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
    }
    
    if (filter.type && filter.type.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.type!.includes(log.type));
    }
    
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.description.toLowerCase().includes(searchTerm) ||
        log.userName.toLowerCase().includes(searchTerm) ||
        log.resourceType?.toLowerCase().includes(searchTerm) ||
        log.resourceId?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filter.dateRange) {
      const { startDate, endDate } = filter.dateRange;
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp >= startDate && log.timestamp <= endDate
      );
    }
    
    // Apply sorting
    filteredLogs.sort((a, b) => {
      if (sort.field === 'timestamp') {
        return sort.direction === 'asc'
          ? a.timestamp.getTime() - b.timestamp.getTime()
          : b.timestamp.getTime() - a.timestamp.getTime();
      }
      
      const valueA = a[sort.field];
      const valueB = b[sort.field];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
    
    return filteredLogs;
  }, [filter, sort]);

  // Fetch activity logs with pagination
  const fetchActivityLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredAndSortedLogs = getFilteredAndSortedLogs();
      const totalLogs = filteredAndSortedLogs.length;
      
      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLogs = filteredAndSortedLogs.slice(startIndex, endIndex);
      
      setLogsList(paginatedLogs);
      setTotal(totalLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, getFilteredAndSortedLogs]);

  // Get logs for a specific user
  const getLogsForUser = useCallback((userId: string) => {
    return activityLogs.filter(log => log.userId === userId);
  }, []);

  // Get logs by type
  const getLogsByType = useCallback((type: ActivityType) => {
    return activityLogs.filter(log => log.type === type);
  }, []);

  // Calculate the paginated result
  const paginatedResult = useMemo<PaginatedResult<ActivityLogEntry>>(() => {
    return {
      items: logsList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }, [logsList, total, page, pageSize]);

  // Fetch logs on mount and when dependencies change
  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return {
    logs: paginatedResult,
    isLoading,
    error,
    
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    
    // Sorting
    sort,
    setSort,
    
    // Filtering
    filter,
    setFilter,
    activityTypes,
    
    // Specialized getters
    getLogsForUser,
    getLogsByType,
    
    // Refetch
    refetch: fetchActivityLogs
  };
}