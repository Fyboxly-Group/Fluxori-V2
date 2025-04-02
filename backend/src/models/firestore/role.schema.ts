/**
 * Role schema for enhanced RBAC
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Role scope types
 */
export enum RoleScope {
  SYSTEM = 'system',     // Built-in system-wide roles, cannot be modified
  ORGANIZATION = 'organization', // Organization-specific custom roles
  SUBORGANIZATION = 'suborganization' // Roles specific to a suborganization
}

/**
 * Permission types for different resources and actions
 */
export enum PermissionResource {
  // Core resources
  USER = 'user',
  ORGANIZATION = 'organization',
  ROLE = 'role',
  
  // Business resources
  INVENTORY = 'inventory',
  ORDER = 'order',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  SHIPMENT = 'shipment',
  PROJECT = 'project',
  TASK = 'task',
  REPORT = 'report',
  ANALYTICS = 'analytics',
  FEEDBACK = 'feedback',
  
  // Integration resources
  MARKETPLACE = 'marketplace',
  CONNECTION = 'connection',
  WAREHOUSE = 'warehouse',
  ACCOUNTING = 'accounting',
  
  // Settings and system resources
  SETTINGS = 'settings',
  BILLING = 'billing',
  AUDIT = 'audit',
  LOG = 'log',
  NOTIFICATION = 'notification',
  CREDIT = 'credit'
}

/**
 * Permission actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full control including administrative actions
  ASSIGN = 'assign', // Ability to assign resources to others
  SHARE = 'share',   // Ability to share resources with others
  EXPORT = 'export', // Export data
  IMPORT = 'import'  // Import data
}

/**
 * Permission condition types for conditional access
 */
export type PermissionCondition = {
  type: 'ownership' | 'attribute' | 'team' | 'hierarchy' | 'custom';
  field?: string;
  value?: any;
  operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in' | 'contains';
  expression?: string; // For custom conditions
};

/**
 * Permission structure
 */
export type Permission = {
  resource: PermissionResource | string; // Allow custom resources
  action: PermissionAction | string;     // Allow custom actions
  conditions?: PermissionCondition[];    // Optional conditions
  description?: string;                  // Human-readable description
};

/**
 * Interface for Role
 */
export interface IRole {
  name: string;
  description: string;
  scope: RoleScope;
  organizationId?: string; // For organization-specific roles
  isDefault?: boolean;     // Is this a default role for new users
  isBuiltIn?: boolean;     // Is this a built-in role that cannot be modified
  permissions: Permission[];
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy?: string;      // User ID who created this role
}

/**
 * Role with ID field
 */
export interface IRoleWithId extends IRole {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const roleConverter = {
  toFirestore(role: IRole): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      name: role.name,
      description: role.description,
      scope: role.scope,
      organizationId: role.organizationId,
      isDefault: role.isDefault || false,
      isBuiltIn: role.isBuiltIn || false,
      permissions: role.permissions,
      metadata: role.metadata || {},
      createdBy: role.createdBy,
      createdAt: role.createdAt instanceof Date 
        ? Timestamp.fromDate(role.createdAt) 
        : role.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IRoleWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      scope: data.scope,
      organizationId: data.organizationId,
      isDefault: data.isDefault,
      isBuiltIn: data.isBuiltIn,
      permissions: data.permissions,
      metadata: data.metadata,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IRoleWithId;
  }
};

/**
 * Predefined system roles with permissions
 */
export const systemRoles: IRole[] = [
  {
    name: 'System Administrator',
    description: 'Full system access with all permissions',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    permissions: [
      { resource: '*', action: '*' } // Wildcard for all resources and actions
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Organization Owner',
    description: 'Full control over an organization',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: '*' },
      { resource: PermissionResource.USER, action: '*' },
      { resource: PermissionResource.ROLE, action: '*' },
      // All other resources with full access
      { resource: PermissionResource.INVENTORY, action: '*' },
      { resource: PermissionResource.ORDER, action: '*' },
      { resource: PermissionResource.CUSTOMER, action: '*' },
      { resource: PermissionResource.SUPPLIER, action: '*' },
      { resource: PermissionResource.SHIPMENT, action: '*' },
      { resource: PermissionResource.PROJECT, action: '*' },
      { resource: PermissionResource.TASK, action: '*' },
      { resource: PermissionResource.REPORT, action: '*' },
      { resource: PermissionResource.ANALYTICS, action: '*' },
      { resource: PermissionResource.FEEDBACK, action: '*' },
      { resource: PermissionResource.MARKETPLACE, action: '*' },
      { resource: PermissionResource.CONNECTION, action: '*' },
      { resource: PermissionResource.WAREHOUSE, action: '*' },
      { resource: PermissionResource.ACCOUNTING, action: '*' },
      { resource: PermissionResource.SETTINGS, action: '*' },
      { resource: PermissionResource.BILLING, action: '*' },
      { resource: PermissionResource.AUDIT, action: '*' },
      { resource: PermissionResource.LOG, action: '*' },
      { resource: PermissionResource.NOTIFICATION, action: '*' },
      { resource: PermissionResource.CREDIT, action: '*' }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Organization Admin',
    description: 'Administrative access to organization resources',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.UPDATE },
      { resource: PermissionResource.USER, action: '*' },
      { resource: PermissionResource.ROLE, action: '*', conditions: [
        { type: 'hierarchy', field: 'scope', value: 'organization', operator: '==' }
      ]},
      // All business resources with full access
      { resource: PermissionResource.INVENTORY, action: '*' },
      { resource: PermissionResource.ORDER, action: '*' },
      { resource: PermissionResource.CUSTOMER, action: '*' },
      { resource: PermissionResource.SUPPLIER, action: '*' },
      { resource: PermissionResource.SHIPMENT, action: '*' },
      { resource: PermissionResource.PROJECT, action: '*' },
      { resource: PermissionResource.TASK, action: '*' },
      { resource: PermissionResource.REPORT, action: '*' },
      { resource: PermissionResource.ANALYTICS, action: '*' },
      { resource: PermissionResource.FEEDBACK, action: '*' },
      { resource: PermissionResource.MARKETPLACE, action: '*' },
      { resource: PermissionResource.CONNECTION, action: '*' },
      { resource: PermissionResource.WAREHOUSE, action: '*' },
      { resource: PermissionResource.ACCOUNTING, action: '*' },
      { resource: PermissionResource.SETTINGS, action: PermissionAction.READ },
      { resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE },
      { resource: PermissionResource.BILLING, action: PermissionAction.READ },
      { resource: PermissionResource.AUDIT, action: PermissionAction.READ },
      { resource: PermissionResource.LOG, action: PermissionAction.READ },
      { resource: PermissionResource.NOTIFICATION, action: '*' },
      { resource: PermissionResource.CREDIT, action: PermissionAction.READ }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Manager',
    description: 'Management access to business resources',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    isDefault: false,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      // Limited role management
      { resource: PermissionResource.ROLE, action: PermissionAction.READ },
      // Business resources with full access
      { resource: PermissionResource.INVENTORY, action: '*' },
      { resource: PermissionResource.ORDER, action: '*' },
      { resource: PermissionResource.CUSTOMER, action: '*' },
      { resource: PermissionResource.SUPPLIER, action: '*' },
      { resource: PermissionResource.SHIPMENT, action: '*' },
      { resource: PermissionResource.PROJECT, action: '*' },
      { resource: PermissionResource.TASK, action: '*' },
      { resource: PermissionResource.REPORT, action: '*' },
      { resource: PermissionResource.ANALYTICS, action: PermissionAction.READ },
      { resource: PermissionResource.FEEDBACK, action: '*' },
      { resource: PermissionResource.MARKETPLACE, action: PermissionAction.READ },
      { resource: PermissionResource.CONNECTION, action: PermissionAction.READ },
      { resource: PermissionResource.WAREHOUSE, action: '*' },
      { resource: PermissionResource.NOTIFICATION, action: '*' }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Member',
    description: 'Standard user access to organization resources',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    isDefault: true,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
      // Limited access to business resources
      { resource: PermissionResource.INVENTORY, action: PermissionAction.READ },
      { resource: PermissionResource.ORDER, action: PermissionAction.READ },
      { resource: PermissionResource.CUSTOMER, action: PermissionAction.READ },
      { resource: PermissionResource.SUPPLIER, action: PermissionAction.READ },
      { resource: PermissionResource.SHIPMENT, action: PermissionAction.READ },
      { resource: PermissionResource.PROJECT, action: PermissionAction.READ },
      { resource: PermissionResource.TASK, action: PermissionAction.READ, conditions: [
        { type: 'ownership', field: 'assigneeId', operator: '==' }
      ]},
      { resource: PermissionResource.TASK, action: PermissionAction.UPDATE, conditions: [
        { type: 'ownership', field: 'assigneeId', operator: '==' }
      ]},
      { resource: PermissionResource.REPORT, action: PermissionAction.READ },
      { resource: PermissionResource.FEEDBACK, action: PermissionAction.CREATE },
      { resource: PermissionResource.FEEDBACK, action: PermissionAction.READ, conditions: [
        { type: 'ownership', field: 'userId', operator: '==' }
      ]},
      { resource: PermissionResource.NOTIFICATION, action: PermissionAction.READ, conditions: [
        { type: 'ownership', field: 'userId', operator: '==' }
      ]},
      { resource: PermissionResource.NOTIFICATION, action: PermissionAction.UPDATE, conditions: [
        { type: 'ownership', field: 'userId', operator: '==' }
      ]}
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Agency Manager',
    description: 'Management access for an agency across client organizations',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.CREATE },
      { resource: PermissionResource.ROLE, action: PermissionAction.READ },
      { resource: PermissionResource.ROLE, action: PermissionAction.ASSIGN },
      // Client organization management
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.CREATE },
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.UPDATE, conditions: [
        { type: 'hierarchy', field: 'parentId', operator: '==' }
      ]},
      // Access to business resources across client organizations
      { resource: PermissionResource.INVENTORY, action: '*' },
      { resource: PermissionResource.ORDER, action: '*' },
      { resource: PermissionResource.CUSTOMER, action: '*' },
      { resource: PermissionResource.SUPPLIER, action: '*' },
      { resource: PermissionResource.SHIPMENT, action: '*' },
      { resource: PermissionResource.PROJECT, action: '*' },
      { resource: PermissionResource.TASK, action: '*' },
      { resource: PermissionResource.REPORT, action: '*' },
      { resource: PermissionResource.ANALYTICS, action: PermissionAction.READ },
      { resource: PermissionResource.FEEDBACK, action: '*' },
      { resource: PermissionResource.MARKETPLACE, action: '*' },
      { resource: PermissionResource.CONNECTION, action: '*' },
      { resource: PermissionResource.WAREHOUSE, action: '*' },
      { resource: PermissionResource.NOTIFICATION, action: '*' }
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Read Only',
    description: 'Read-only access to all resources',
    scope: RoleScope.SYSTEM,
    isBuiltIn: true,
    permissions: [
      { resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      { resource: PermissionResource.ROLE, action: PermissionAction.READ },
      // Read-only access to business resources
      { resource: PermissionResource.INVENTORY, action: PermissionAction.READ },
      { resource: PermissionResource.ORDER, action: PermissionAction.READ },
      { resource: PermissionResource.CUSTOMER, action: PermissionAction.READ },
      { resource: PermissionResource.SUPPLIER, action: PermissionAction.READ },
      { resource: PermissionResource.SHIPMENT, action: PermissionAction.READ },
      { resource: PermissionResource.PROJECT, action: PermissionAction.READ },
      { resource: PermissionResource.TASK, action: PermissionAction.READ },
      { resource: PermissionResource.REPORT, action: PermissionAction.READ },
      { resource: PermissionResource.ANALYTICS, action: PermissionAction.READ },
      { resource: PermissionResource.FEEDBACK, action: PermissionAction.READ },
      { resource: PermissionResource.MARKETPLACE, action: PermissionAction.READ },
      { resource: PermissionResource.CONNECTION, action: PermissionAction.READ },
      { resource: PermissionResource.WAREHOUSE, action: PermissionAction.READ },
      { resource: PermissionResource.NOTIFICATION, action: PermissionAction.READ, conditions: [
        { type: 'ownership', field: 'userId', operator: '==' }
      ]}
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

/**
 * Create a custom role with specified permissions
 * @param name Role name
 * @param description Role description
 * @param organizationId Organization ID
 * @param permissions Array of permissions
 * @param createdBy User ID creating the role
 * @returns IRole object for the custom role
 */
export function createCustomRole(
  name: string,
  description: string,
  organizationId: string,
  permissions: Permission[],
  createdBy: string
): IRole {
  const now = Timestamp.now();
  
  return {
    name,
    description,
    scope: RoleScope.ORGANIZATION,
    organizationId,
    isBuiltIn: false,
    isDefault: false,
    permissions,
    createdBy,
    createdAt: now,
    updatedAt: now
  };
}