import api, { ApiResponse } from '../api-client';
import { User } from './auth.service';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * User filter parameters
 */
export interface UserFilterParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Role model
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  usersCount?: number;
  isSystem?: boolean;
}

/**
 * Permission model
 */
export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  resource: string;
  action: string;
}

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * Activity log filter parameters
 */
export interface ActivityLogFilterParams extends PaginationParams {
  search?: string;
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Organization settings
 */
export interface OrganizationSettings {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  contactEmail?: string;
  address?: string;
  phone?: string;
  website?: string;
  securitySettings: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays: number;
    };
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    twoFactorEnforced: boolean;
    allowedIpRanges?: string[];
  };
  featureFlags: Record<string, boolean>;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * User Management Service
 * Handles user management operations
 */
const UserManagementService = {
  /**
   * Get paginated list of users
   */
  async getUsers(filters: UserFilterParams = {}): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', {
      params: filters
    });
    return response.data as PaginatedResponse<User>;
  },

  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data as User;
  },

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await api.post<User>('/admin/users', userData);
    return response.data as User;
  },

  /**
   * Update a user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}`, userData);
    return response.data as User;
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    return api.delete(`/admin/users/${id}`);
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(ids: string[]): Promise<ApiResponse> {
    return api.post('/admin/users/bulk-delete', { ids });
  },

  /**
   * Activate a user
   */
  async activateUser(id: string): Promise<ApiResponse> {
    return api.post(`/admin/users/${id}/activate`);
  },

  /**
   * Deactivate a user
   */
  async deactivateUser(id: string): Promise<ApiResponse> {
    return api.post(`/admin/users/${id}/deactivate`);
  },

  /**
   * Impersonate a user
   */
  async impersonateUser(id: string): Promise<{ accessToken: string; user: User }> {
    const response = await api.post<{ accessToken: string; user: User }>(`/admin/users/${id}/impersonate`);
    return response.data as { accessToken: string; user: User };
  },

  /**
   * Stop impersonating a user
   */
  async stopImpersonation(): Promise<{ accessToken: string; user: User }> {
    const response = await api.post<{ accessToken: string; user: User }>('/admin/users/stop-impersonation');
    return response.data as { accessToken: string; user: User };
  },

  /**
   * Get list of roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await api.get<Role[]>('/admin/roles');
    return response.data as Role[];
  },

  /**
   * Get a role by ID
   */
  async getRole(id: string): Promise<Role> {
    const response = await api.get<Role>(`/admin/roles/${id}`);
    return response.data as Role;
  },

  /**
   * Create a new role
   */
  async createRole(roleData: Partial<Role>): Promise<Role> {
    const response = await api.post<Role>('/admin/roles', roleData);
    return response.data as Role;
  },

  /**
   * Update a role
   */
  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    const response = await api.put<Role>(`/admin/roles/${id}`, roleData);
    return response.data as Role;
  },

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<ApiResponse> {
    return api.delete(`/admin/roles/${id}`);
  },

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<Permission[]>('/admin/permissions');
    return response.data as Permission[];
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(filters: ActivityLogFilterParams = {}): Promise<PaginatedResponse<ActivityLog>> {
    const response = await api.get<PaginatedResponse<ActivityLog>>('/admin/activity-logs', {
      params: filters
    });
    return response.data as PaginatedResponse<ActivityLog>;
  },

  /**
   * Get activity log by ID
   */
  async getActivityLog(id: string): Promise<ActivityLog> {
    const response = await api.get<ActivityLog>(`/admin/activity-logs/${id}`);
    return response.data as ActivityLog;
  },

  /**
   * Get organization settings
   */
  async getOrganizationSettings(): Promise<OrganizationSettings> {
    const response = await api.get<OrganizationSettings>('/admin/organization');
    return response.data as OrganizationSettings;
  },

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const response = await api.put<OrganizationSettings>('/admin/organization', settings);
    return response.data as OrganizationSettings;
  },

  /**
   * Update organization logo
   */
  async updateOrganizationLogo(logo: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', logo);
    
    const response = await api.post<{ logoUrl: string }>('/admin/organization/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data as { logoUrl: string };
  },

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/admin/users/${userId}/sessions`);
    return response.data as any[];
  },

  /**
   * Terminate user session
   */
  async terminateUserSession(userId: string, sessionId: string): Promise<ApiResponse> {
    return api.delete(`/admin/users/${userId}/sessions/${sessionId}`);
  },

  /**
   * Get role templates
   */
  async getRoleTemplates(): Promise<Role[]> {
    const response = await api.get<Role[]>('/admin/role-templates');
    return response.data as Role[];
  },

  /**
   * Apply role template
   */
  async applyRoleTemplate(roleId: string, templateId: string): Promise<Role> {
    const response = await api.post<Role>(`/admin/roles/${roleId}/apply-template`, { templateId });
    return response.data as Role;
  },

  /**
   * Save role as template
   */
  async saveRoleAsTemplate(roleId: string, name: string, description?: string): Promise<Role> {
    const response = await api.post<Role>(`/admin/roles/${roleId}/save-as-template`, { 
      name, 
      description 
    });
    return response.data as Role;
  }
};

export default UserManagementService;