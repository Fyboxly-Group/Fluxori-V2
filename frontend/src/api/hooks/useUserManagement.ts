import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserManagementService, 
  UserFilterParams, 
  ActivityLogFilterParams,
  User,
  Role,
  Permission,
  ActivityLog,
  OrganizationSettings
} from '../services/user-management.service';

/**
 * Hook for user management operations
 */
export function useUsers(filters: UserFilterParams = {}) {
  const queryClient = useQueryClient();
  
  // Get users query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => UserManagementService.getUsers(filters)
  });
  
  // Get user by ID query
  const getUserById = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => UserManagementService.getUser(id),
      enabled: !!id
    });
  };
  
  // Create user mutation
  const createUser = useMutation({
    mutationFn: (userData: Partial<User>) => UserManagementService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  // Update user mutation
  const updateUser = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) => 
      UserManagementService.updateUser(id, userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    }
  });
  
  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (id: string) => UserManagementService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  // Bulk delete users mutation
  const bulkDeleteUsers = useMutation({
    mutationFn: (ids: string[]) => UserManagementService.bulkDeleteUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  // Activate user mutation
  const activateUser = useMutation({
    mutationFn: (id: string) => UserManagementService.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    }
  });
  
  // Deactivate user mutation
  const deactivateUser = useMutation({
    mutationFn: (id: string) => UserManagementService.deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    }
  });
  
  // Impersonate user mutation
  const impersonateUser = useMutation({
    mutationFn: (id: string) => UserManagementService.impersonateUser(id)
  });
  
  // Stop impersonation mutation
  const stopImpersonation = useMutation({
    mutationFn: () => UserManagementService.stopImpersonation()
  });
  
  return {
    users: data?.items || [],
    totalUsers: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
    getUserById,
    createUser: createUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    bulkDeleteUsers: bulkDeleteUsers.mutate,
    activateUser: activateUser.mutate,
    deactivateUser: deactivateUser.mutate,
    impersonateUser: impersonateUser.mutate,
    stopImpersonation: stopImpersonation.mutate,
    
    // Mutation states
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isBulkDeleting: bulkDeleteUsers.isPending,
    isActivating: activateUser.isPending,
    isDeactivating: deactivateUser.isPending,
    isImpersonating: impersonateUser.isPending,
    isStoppingImpersonation: stopImpersonation.isPending,
    
    // Mutation errors
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error,
    bulkDeleteError: bulkDeleteUsers.error,
    activateError: activateUser.error,
    deactivateError: deactivateUser.error
  };
}

/**
 * Hook for role management operations
 */
export function useRoles() {
  const queryClient = useQueryClient();
  
  // Get roles query
  const {
    data: roles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => UserManagementService.getRoles()
  });
  
  // Get role by ID query
  const getRoleById = (id: string) => {
    return useQuery({
      queryKey: ['role', id],
      queryFn: () => UserManagementService.getRole(id),
      enabled: !!id
    });
  };
  
  // Get permissions query
  const {
    data: permissions = [],
    isLoading: isLoadingPermissions,
    error: permissionsError,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => UserManagementService.getPermissions()
  });
  
  // Create role mutation
  const createRole = useMutation({
    mutationFn: (roleData: Partial<Role>) => UserManagementService.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
  
  // Update role mutation
  const updateRole = useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: Partial<Role> }) => 
      UserManagementService.updateRole(id, roleData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', data.id] });
    }
  });
  
  // Delete role mutation
  const deleteRole = useMutation({
    mutationFn: (id: string) => UserManagementService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
  
  // Get role templates query
  const {
    data: roleTemplates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['role-templates'],
    queryFn: () => UserManagementService.getRoleTemplates()
  });
  
  // Apply role template mutation
  const applyRoleTemplate = useMutation({
    mutationFn: ({ roleId, templateId }: { roleId: string; templateId: string }) => 
      UserManagementService.applyRoleTemplate(roleId, templateId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', data.id] });
    }
  });
  
  // Save role as template mutation
  const saveRoleAsTemplate = useMutation({
    mutationFn: ({ roleId, name, description }: { roleId: string; name: string; description?: string }) => 
      UserManagementService.saveRoleAsTemplate(roleId, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-templates'] });
    }
  });
  
  return {
    roles,
    permissions,
    roleTemplates,
    isLoading,
    isLoadingPermissions,
    isLoadingTemplates,
    error,
    permissionsError,
    templatesError,
    refetch,
    refetchPermissions,
    refetchTemplates,
    getRoleById,
    createRole: createRole.mutate,
    updateRole: updateRole.mutate,
    deleteRole: deleteRole.mutate,
    applyRoleTemplate: applyRoleTemplate.mutate,
    saveRoleAsTemplate: saveRoleAsTemplate.mutate,
    
    // Mutation states
    isCreating: createRole.isPending,
    isUpdating: updateRole.isPending,
    isDeleting: deleteRole.isPending,
    isApplyingTemplate: applyRoleTemplate.isPending,
    isSavingTemplate: saveRoleAsTemplate.isPending,
    
    // Mutation errors
    createError: createRole.error,
    updateError: updateRole.error,
    deleteError: deleteRole.error,
    applyTemplateError: applyRoleTemplate.error,
    saveTemplateError: saveRoleAsTemplate.error
  };
}

/**
 * Hook for activity log operations
 */
export function useActivityLogs(filters: ActivityLogFilterParams = {}) {
  // Get activity logs query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => UserManagementService.getActivityLogs(filters)
  });
  
  // Get activity log by ID query
  const getActivityLogById = (id: string) => {
    return useQuery({
      queryKey: ['activity-log', id],
      queryFn: () => UserManagementService.getActivityLog(id),
      enabled: !!id
    });
  };
  
  return {
    activityLogs: data?.items || [],
    totalLogs: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch,
    getActivityLogById
  };
}

/**
 * Hook for organization settings
 */
export function useOrganizationSettings() {
  const queryClient = useQueryClient();
  
  // Get organization settings query
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: () => UserManagementService.getOrganizationSettings()
  });
  
  // Update organization settings mutation
  const updateSettings = useMutation({
    mutationFn: (settingsData: Partial<OrganizationSettings>) => 
      UserManagementService.updateOrganizationSettings(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
    }
  });
  
  // Update organization logo mutation
  const updateLogo = useMutation({
    mutationFn: (logo: File) => UserManagementService.updateOrganizationLogo(logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
    }
  });
  
  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettings.mutate,
    updateLogo: updateLogo.mutate,
    
    // Mutation states
    isUpdating: updateSettings.isPending,
    isUpdatingLogo: updateLogo.isPending,
    
    // Mutation errors
    updateError: updateSettings.error,
    updateLogoError: updateLogo.error
  };
}

export default {
  useUsers,
  useRoles,
  useActivityLogs,
  useOrganizationSettings
};