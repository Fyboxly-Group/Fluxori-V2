import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  User, 
  UserFilterOptions, 
  UserSortOptions, 
  PaginatedResult, 
  UpdateUserRequest, 
  CreateUserRequest 
} from '@/types/user-management';
import { users } from '@/mocks/userManagementData';

interface UseUsersProps {
  initialPage?: number;
  initialPageSize?: number;
  initialSort?: UserSortOptions;
  initialFilter?: UserFilterOptions;
}

export function useUsers({
  initialPage = 1,
  initialPageSize = 10,
  initialSort = { field: 'email', direction: 'asc' },
  initialFilter = {}
}: UseUsersProps = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sort, setSort] = useState<UserSortOptions>(initialSort);
  const [filter, setFilter] = useState<UserFilterOptions>(initialFilter);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Function to get a nested property from an object using a string path
  const getNestedProperty = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Filter and sort users
  const getFilteredAndSortedUsers = useCallback(() => {
    let filteredUsers = [...users];
    
    // Apply filters
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.profile.firstName.toLowerCase().includes(searchTerm) ||
        user.profile.lastName.toLowerCase().includes(searchTerm) ||
        `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filter.roles && filter.roles.length > 0) {
      filteredUsers = filteredUsers.filter(user => filter.roles!.includes(user.role));
    }
    
    if (filter.status && filter.status.length > 0) {
      filteredUsers = filteredUsers.filter(user => filter.status!.includes(user.status));
    }
    
    if (filter.twoFactorEnabled !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.twoFactorEnabled === filter.twoFactorEnabled);
    }
    
    if (filter.dateRange) {
      const { startDate, endDate, field } = filter.dateRange;
      filteredUsers = filteredUsers.filter(user => {
        const userDate = field === 'lastLogin' ? user.lastLogin : user.createdAt;
        if (!userDate) return false;
        return userDate >= startDate && userDate <= endDate;
      });
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      const valueA = getNestedProperty(a, sort.field);
      const valueB = getNestedProperty(b, sort.field);
      
      if (valueA === null || valueA === undefined) return sort.direction === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sort.direction === 'asc' ? 1 : -1;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      if (valueA instanceof Date && valueB instanceof Date) {
        return sort.direction === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      
      return sort.direction === 'asc'
        ? (valueA > valueB ? 1 : -1)
        : (valueA > valueB ? -1 : 1);
    });
    
    return filteredUsers;
  }, [filter, sort]);

  // Fetch users with pagination
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredAndSortedUsers = getFilteredAndSortedUsers();
      const totalUsers = filteredAndSortedUsers.length;
      
      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);
      
      setUsersList(paginatedUsers);
      setTotal(totalUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, getFilteredAndSortedUsers]);

  // Get user by ID
  const getUserById = useCallback((userId: string) => {
    return users.find(user => user.id === userId) || null;
  }, []);

  // Create user
  const createUser = useCallback(async (userData: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Creating user:', userData);
      
      // Refresh user list
      await fetchUsers();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Update user
  const updateUser = useCallback(async (userId: string, updates: UpdateUserRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Updating user:', userId, updates);
      
      // Refresh user list
      await fetchUsers();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Deleting user:', userId);
      
      // Refresh user list
      await fetchUsers();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Bulk delete users
  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Bulk deleting users:', userIds);
      
      // Clear selected users
      setSelectedUsers([]);
      
      // Refresh user list
      await fetchUsers();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete users');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Handle selection toggle for a single user
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  // Handle selection for all users
  const toggleSelectAll = useCallback((select: boolean) => {
    if (select) {
      setSelectedUsers(usersList.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [usersList]);

  // Calculate if all users are selected
  const isAllSelected = useMemo(() => {
    return usersList.length > 0 && selectedUsers.length === usersList.length;
  }, [usersList, selectedUsers]);

  // Calculate if some users are selected
  const isSomeSelected = useMemo(() => {
    return selectedUsers.length > 0 && selectedUsers.length < usersList.length;
  }, [usersList, selectedUsers]);

  // Calculate the paginated result
  const paginatedResult = useMemo<PaginatedResult<User>>(() => {
    return {
      items: usersList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }, [usersList, total, page, pageSize]);

  // Fetch users on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: paginatedResult,
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
    
    // Selection
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected,
    
    // CRUD operations
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    
    // Refetch
    refetch: fetchUsers
  };
}