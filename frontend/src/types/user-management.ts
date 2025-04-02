/**
 * User management types
 */

// User roles
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

// Permission scopes
export type PermissionScope = 
  | 'inventory' 
  | 'orders' 
  | 'reports' 
  | 'settings' 
  | 'users'
  | 'connections'
  | 'warehouses'
  | 'suppliers';

// Permission actions
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

// Permission definition
export interface Permission {
  scope: PermissionScope;
  actions: PermissionAction[];
}

// Role definition
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

// User status types
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// Two-factor authentication methods
export type TwoFactorMethod = 'none' | 'app' | 'sms' | 'email';

// User profile
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  motionPreference: 'full' | 'moderate' | 'minimal';
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

// User device
export interface UserDevice {
  id: string;
  name: string;
  type: 'desktop' | 'tablet' | 'mobile' | 'unknown';
  browser: string;
  os: string;
  lastActive: Date;
  ipAddress: string;
  trusted: boolean;
  isCurrent: boolean;
}

// User login history entry
export interface LoginHistoryEntry {
  id: string;
  timestamp: Date;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  successful: boolean;
  failureReason?: string;
}

// Activity type
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'password_change' 
  | 'profile_update' 
  | 'role_change'
  | 'permission_change'
  | 'resource_create'
  | 'resource_edit'
  | 'resource_delete'
  | 'password_reset_request'
  | 'settings_change';

// Activity log entry
export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: ActivityType;
  description: string;
  ipAddress: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

// Organization settings
export interface OrganizationSettings {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultLanguage: string;
  defaultTimezone: string;
  defaultTheme: 'light' | 'dark' | 'system';
  securitySettings: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays: number;
      preventReuseCount: number;
    };
    loginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
    requireTwoFactor: boolean;
    allowedIpRanges?: string[];
    singleSessionOnly: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Invite status
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// User invite
export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: InviteStatus;
  message?: string;
}

// User model
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  devices: UserDevice[];
  passwordLastChanged?: Date;
  requirePasswordChange: boolean;
  organizationId: string;
  isSystemAdmin: boolean;
}

// Request/response types for user management API

export interface CreateUserRequest {
  email: string;
  password?: string;
  role: UserRole;
  profile: Partial<UserProfile>;
  sendInvite?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: Partial<UserProfile>;
  permissions?: Permission[];
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  message?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface UpdateOrganizationSettingsRequest {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultLanguage?: string;
  defaultTimezone?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
  securitySettings?: Partial<OrganizationSettings['securitySettings']>;
}

// Paginated result type for user listings
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sort direction
export type SortDirection = 'asc' | 'desc';

// User sorting options
export interface UserSortOptions {
  field: 'email' | 'profile.firstName' | 'profile.lastName' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  direction: SortDirection;
}

// User filter options
export interface UserFilterOptions {
  search?: string;
  roles?: UserRole[];
  status?: UserStatus[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
    field: 'createdAt' | 'lastLogin';
  };
  twoFactorEnabled?: boolean;
}