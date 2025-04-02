/**
 * Firestore Models Index
 * 
 * This file exports all Firestore schema interfaces and utilities
 * for easy import throughout the application.
 */

// Export order schemas
export * from './order.schema';

// Export inventory schemas
export * from './inventory.schema';

// Export buybox schema
export * from './buybox.schema';

// Export multi-account architecture schemas
export {
  IOrganization,
  IOrganizationWithId,
  OrganizationType,
  OrganizationStatus,
  organizationConverter
} from './organization.schema';

export {
  IRole,
  IRoleWithId,
  RoleScope,
  PermissionResource,
  PermissionAction,
  Permission,
  PermissionCondition,
  roleConverter,
  systemRoles,
  createCustomRole
} from './role.schema';

export {
  IUserOrganization,
  IUserOrganizationWithId,
  MembershipStatus,
  MembershipType,
  userOrganizationConverter
} from './user-organization.schema';

export {
  IInvitation,
  IInvitationWithId,
  InvitationStatus,
  invitationConverter
} from './invitation.schema';

export {
  IAuditLog,
  IAuditLogWithId,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  auditLogConverter,
  createAuditLog
} from './audit-log.schema';

export {
  IResourceSharing,
  IResourceSharingWithId,
  AccessLevel,
  SharingType,
  resourceSharingConverter
} from './resource-sharing.schema';

export {
  IUser,
  IUserWithId,
  UserStatus,
  UserType,
  AuthProvider,
  userConverter
} from './user.schema';

// Re-export services
export { OrderService } from '../../services/firestore/order.service';
export { InventoryService } from '../../services/firestore/inventory.service';

// Export Firestore configuration
export { 
  db, 
  ordersCollection, 
  inventoryCollection,
  organizationsCollection,
  rolesCollection,
  userOrganizationsCollection,
  invitationsCollection,
  auditLogsCollection,
  resourceSharingCollection,
  firebaseUsersCollection
} from '../../config/firestore';