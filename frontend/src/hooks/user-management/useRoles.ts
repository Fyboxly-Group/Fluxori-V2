import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Role, 
  UpdateRoleRequest, 
  Permission, 
  PermissionScope, 
  PermissionAction
} from '@/types/user-management';
import { roles, permissions } from '@/mocks/userManagementData';

export function useRoles() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Get all available permission scopes
  const availableScopes = useMemo<PermissionScope[]>(() => {
    return [
      'inventory',
      'orders',
      'reports',
      'settings',
      'users',
      'connections',
      'warehouses',
      'suppliers'
    ];
  }, []);
  
  // Get all available permission actions
  const availableActions = useMemo<PermissionAction[]>(() => {
    return ['view', 'create', 'edit', 'delete'];
  }, []);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRolesList(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get role by ID
  const getRoleById = useCallback((roleId: string) => {
    return roles.find(role => role.id === roleId) || null;
  }, []);

  // Create role
  const createRole = useCallback(async (name: string, description: string, rolePermissions: Permission[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Creating role:', { name, description, permissions: rolePermissions });
      
      // Refresh roles list
      await fetchRoles();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoles]);

  // Update role
  const updateRole = useCallback(async (roleId: string, updates: UpdateRoleRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Updating role:', roleId, updates);
      
      // Refresh roles list
      await fetchRoles();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoles]);

  // Delete role
  const deleteRole = useCallback(async (roleId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the role
      const role = getRoleById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      if (role.isSystem) {
        throw new Error('Cannot delete system roles');
      }
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would call an API
      console.log('Deleting role:', roleId);
      
      // Refresh roles list
      await fetchRoles();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoles, getRoleById]);

  // Set permissions for a role
  const setRolePermissions = useCallback(async (roleId: string, rolePermissions: Permission[]) => {
    return updateRole(roleId, { permissions: rolePermissions });
  }, [updateRole]);

  // Check if a role has a specific permission
  const hasPermission = useCallback((role: Role, scope: PermissionScope, action: PermissionAction) => {
    const permission = role.permissions.find(p => p.scope === scope);
    return permission ? permission.actions.includes(action) : false;
  }, []);

  // Create a permission matrix for a role
  const createPermissionMatrix = useCallback((role: Role) => {
    const matrix: Record<PermissionScope, Record<PermissionAction, boolean>> = {} as any;
    
    for (const scope of availableScopes) {
      matrix[scope] = {} as any;
      
      for (const action of availableActions) {
        matrix[scope][action] = hasPermission(role, scope, action);
      }
    }
    
    return matrix;
  }, [availableScopes, availableActions, hasPermission]);

  // Convert a permission matrix back to a permissions array
  const matrixToPermissions = useCallback((matrix: Record<PermissionScope, Record<PermissionAction, boolean>>) => {
    const result: Permission[] = [];
    
    for (const scope of availableScopes) {
      const actions: PermissionAction[] = [];
      
      for (const action of availableActions) {
        if (matrix[scope][action]) {
          actions.push(action);
        }
      }
      
      if (actions.length > 0) {
        result.push({ scope, actions });
      }
    }
    
    return result;
  }, [availableScopes, availableActions]);

  // Get default roles (templates)
  const getDefaultRoles = useCallback(() => {
    return {
      admin: permissions.admin,
      manager: permissions.manager,
      user: permissions.user,
      guest: permissions.guest
    };
  }, []);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles: rolesList,
    isLoading,
    error,
    
    // Selection
    selectedRole,
    setSelectedRole,
    
    // CRUD operations
    createRole,
    getRoleById,
    updateRole,
    deleteRole,
    
    // Permissions
    availableScopes,
    availableActions,
    setRolePermissions,
    hasPermission,
    createPermissionMatrix,
    matrixToPermissions,
    getDefaultRoles,
    
    // Refetch
    refetch: fetchRoles
  };
}