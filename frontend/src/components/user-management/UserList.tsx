import { useEffect, useRef } from 'react';
import {
  Box,
  Table,
  Checkbox,
  Avatar,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Pagination,
  Select,
  TextInput,
  Button,
  MultiSelect,
  Card
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconDots,
  IconEdit,
  IconTrash,
  IconLock,
  IconUserX,
  IconUserCheck,
  IconChevronUp,
  IconChevronDown,
  IconPlus,
  IconFilterOff,
  IconClock,
  IconShieldCheck,
  IconShield,
  IconUserShield
} from '@tabler/icons-react';
import { useUsers } from '@/hooks/user-management/useUsers';
import { User, UserRole, UserStatus } from '@/types/user-management';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface UserListProps {
  onEditUser?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  onInviteUser?: () => void;
}

export function UserList({ onEditUser, onViewDetails, onInviteUser }: UserListProps) {
  const {
    users,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    filter,
    setFilter,
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    isAllSelected,
    isSomeSelected,
    deleteUser,
    bulkDeleteUsers,
    updateUser
  } = useUsers();
  
  const tableRef = useRef<HTMLTableElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Role options for filtering
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
    { value: 'guest', label: 'Guest' }
  ];
  
  // Status options for filtering
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    const fieldPath = field === 'name' ? 'profile.firstName' : field;
    
    if (sort.field === fieldPath) {
      // Toggle direction if clicking the same field
      setSort({
        field: fieldPath as any,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Set new field with default 'asc' direction
      setSort({
        field: fieldPath as any,
        direction: 'asc'
      });
    }
  };
  
  // Get sort icon for a field
  const getSortIcon = (field: string) => {
    const fieldPath = field === 'name' ? 'profile.firstName' : field;
    
    if (sort.field !== fieldPath) {
      return null;
    }
    
    return sort.direction === 'asc' ? (
      <IconChevronUp size={14} stroke={1.5} />
    ) : (
      <IconChevronDown size={14} stroke={1.5} />
    );
  };
  
  // Handle bulk action - delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length > 0) {
      await bulkDeleteUsers(selectedUsers);
    }
  };
  
  // Handle user status change
  const handleStatusChange = async (userId: string, status: UserStatus) => {
    await updateUser(userId, { status });
  };
  
  // Get badge color based on user status
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'pending': return 'blue';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };
  
  // Get badge for user role
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge leftSection={<IconUserShield size={12} />} color="purple">Admin</Badge>;
      case 'manager':
        return <Badge leftSection={<IconShieldCheck size={12} />} color="blue">Manager</Badge>;
      case 'user':
        return <Badge leftSection={<IconShield size={12} />} color="teal">User</Badge>;
      case 'guest':
        return <Badge color="gray">Guest</Badge>;
      default:
        return <Badge color="gray">{role}</Badge>;
    }
  };
  
  // Animate rows when data changes
  useEffect(() => {
    if (tableRef.current && motionLevel !== 'minimal' && !isLoading) {
      const rows = tableRef.current.querySelectorAll('tbody tr');
      
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [users.items, isLoading, motionLevel]);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);
  
  return (
    <Box>
      <Card p="md" withBorder mb="md">
        <Group position="apart" mb="md">
          <Group>
            <TextInput
              placeholder="Search users..."
              icon={<IconSearch size={16} />}
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.currentTarget.value })}
              width={250}
            />
            
            <MultiSelect
              placeholder="Filter by role"
              data={roleOptions}
              value={filter.roles || []}
              onChange={(values) => setFilter({ ...filter, roles: values as UserRole[] })}
              clearable
              icon={<IconFilter size={16} />}
              width={200}
            />
            
            <MultiSelect
              placeholder="Filter by status"
              data={statusOptions}
              value={filter.status || []}
              onChange={(values) => setFilter({ ...filter, status: values as UserStatus[] })}
              clearable
              icon={<IconFilter size={16} />}
              width={200}
            />
            
            {(filter.search || filter.roles?.length || filter.status?.length) && (
              <Button
                variant="subtle"
                leftIcon={<IconFilterOff size={16} />}
                onClick={() => setFilter({})}
                compact
              >
                Clear Filters
              </Button>
            )}
          </Group>
          
          <Group>
            {selectedUsers.length > 0 && (
              <Button
                color="red"
                variant="light"
                leftIcon={<IconTrash size={16} />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedUsers.length})
              </Button>
            )}
            
            <Button 
              leftIcon={<IconPlus size={16} />}
              onClick={onInviteUser}
            >
              Invite User
            </Button>
          </Group>
        </Group>
      </Card>
      
      <Card p={0} withBorder>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover verticalSpacing="sm" ref={tableRef}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={(e) => toggleSelectAll(e.currentTarget.checked)}
                  />
                </th>
                <th style={{ width: 250 }}>
                  <Group spacing={5} onClick={() => handleSortChange('name')} style={{ cursor: 'pointer' }}>
                    <Text>Name</Text>
                    {getSortIcon('name')}
                  </Group>
                </th>
                <th style={{ width: 200 }}>
                  <Group spacing={5} onClick={() => handleSortChange('email')} style={{ cursor: 'pointer' }}>
                    <Text>Email</Text>
                    {getSortIcon('email')}
                  </Group>
                </th>
                <th style={{ width: 120 }}>Role</th>
                <th style={{ width: 120 }}>
                  <Group spacing={5} onClick={() => handleSortChange('status')} style={{ cursor: 'pointer' }}>
                    <Text>Status</Text>
                    {getSortIcon('status')}
                  </Group>
                </th>
                <th style={{ width: 150 }}>
                  <Group spacing={5} onClick={() => handleSortChange('lastLogin')} style={{ cursor: 'pointer' }}>
                    <Text>Last Login</Text>
                    {getSortIcon('lastLogin')}
                  </Group>
                </th>
                <th style={{ width: 100 }}>2FA</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} align="center">
                    <Text color="dimmed" my="lg">Loading...</Text>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} align="center">
                    <Text color="red" my="lg">Error: {error}</Text>
                  </td>
                </tr>
              ) : users.items.length === 0 ? (
                <tr>
                  <td colSpan={8} align="center">
                    <Text color="dimmed" my="lg">No users found. Try adjusting your filters.</Text>
                  </td>
                </tr>
              ) : (
                users.items.map((user) => (
                  <tr key={user.id} style={{ opacity: isLoading ? 0.5 : 1 }}>
                    <td>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td>
                      <Group spacing="sm">
                        <Avatar 
                          size={30} 
                          color="blue" 
                          radius="xl"
                          src={user.profile.avatar}
                        >
                          {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
                        </Avatar>
                        <div>
                          <Text size="sm" weight={500}>
                            {user.profile.firstName} {user.profile.lastName}
                          </Text>
                          <Text size="xs" color="dimmed">
                            {user.profile.jobTitle || 'No title'}
                          </Text>
                        </div>
                      </Group>
                    </td>
                    <td>
                      <Text size="sm">{user.email}</Text>
                    </td>
                    <td>
                      {getRoleBadge(user.role)}
                    </td>
                    <td>
                      <Badge 
                        color={getStatusColor(user.status)}
                        variant="light"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing={5}>
                        <IconClock size={14} />
                        <Text size="sm">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</Text>
                      </Group>
                    </td>
                    <td>
                      {user.twoFactorEnabled ? (
                        <Badge color="teal" variant="outline" size="sm">Enabled</Badge>
                      ) : (
                        <Badge color="gray" variant="outline" size="sm">Disabled</Badge>
                      )}
                    </td>
                    <td>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon>
                            <IconDots size={16} stroke={1.5} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            icon={<IconEdit size={16} />}
                            onClick={() => onEditUser?.(user)}
                          >
                            Edit User
                          </Menu.Item>
                          
                          <Menu.Item 
                            icon={<IconLock size={16} />}
                          >
                            Reset Password
                          </Menu.Item>
                          
                          {user.status === 'active' ? (
                            <Menu.Item 
                              icon={<IconUserX size={16} />}
                              onClick={() => handleStatusChange(user.id, 'inactive')}
                            >
                              Deactivate User
                            </Menu.Item>
                          ) : (
                            <Menu.Item 
                              icon={<IconUserCheck size={16} />}
                              onClick={() => handleStatusChange(user.id, 'active')}
                            >
                              Activate User
                            </Menu.Item>
                          )}
                          
                          <Menu.Divider />
                          
                          <Menu.Item 
                            icon={<IconTrash size={16} />}
                            color="red"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete User
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Box>
        
        <Group position="apart" p="md">
          <Select
            label="Rows per page"
            value={pageSize.toString()}
            onChange={(value) => setPageSize(parseInt(value || '10'))}
            data={['10', '25', '50', '100'].map(value => ({ value, label: value }))}
            style={{ width: 100 }}
          />
          
          <Pagination
            total={users.totalPages}
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