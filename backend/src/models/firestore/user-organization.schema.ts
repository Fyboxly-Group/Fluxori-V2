/**
 * User-Organization schema for multi-account architecture
 * Using Firestore data model to manage user memberships and roles
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * User membership status in an organization
 */
export enum MembershipStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  SUSPENDED = 'suspended',
  REMOVED = 'removed'
}

/**
 * User membership types
 */
export enum MembershipType {
  OWNER = 'owner',
  MEMBER = 'member',
  GUEST = 'guest',
  SERVICE = 'service' // For service accounts/integrations
}

/**
 * Interface for UserOrganization relationship
 */
export interface IUserOrganization {
  userId: string;
  organizationId: string;
  status: MembershipStatus;
  type: MembershipType;
  roles: string[]; // Array of role IDs
  isDefault: boolean; // Is this the user's default organization
  joinedAt?: Date | Timestamp;
  invitedBy?: string; // User ID who invited this user
  invitedAt?: Date | Timestamp;
  lastAccessedAt?: Date | Timestamp;
  metadata?: Record<string, any>;
  permissions?: {
    customPermissions?: string[]; // Additional individual permissions outside of roles
    restrictedPermissions?: string[]; // Permissions specifically denied to this user
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * UserOrganization with ID field
 */
export interface IUserOrganizationWithId extends IUserOrganization {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const userOrganizationConverter = {
  toFirestore(userOrg: IUserOrganization): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      userId: userOrg.userId,
      organizationId: userOrg.organizationId,
      status: userOrg.status,
      type: userOrg.type,
      roles: userOrg.roles || [],
      isDefault: userOrg.isDefault || false,
      joinedAt: userOrg.joinedAt instanceof Date 
        ? Timestamp.fromDate(userOrg.joinedAt) 
        : userOrg.joinedAt,
      invitedBy: userOrg.invitedBy,
      invitedAt: userOrg.invitedAt instanceof Date 
        ? Timestamp.fromDate(userOrg.invitedAt) 
        : userOrg.invitedAt,
      lastAccessedAt: userOrg.lastAccessedAt instanceof Date 
        ? Timestamp.fromDate(userOrg.lastAccessedAt) 
        : userOrg.lastAccessedAt,
      metadata: userOrg.metadata || {},
      permissions: userOrg.permissions || {
        customPermissions: [],
        restrictedPermissions: []
      },
      createdAt: userOrg.createdAt instanceof Date 
        ? Timestamp.fromDate(userOrg.createdAt) 
        : userOrg.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IUserOrganizationWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      status: data.status,
      type: data.type,
      roles: data.roles,
      isDefault: data.isDefault,
      joinedAt: data.joinedAt,
      invitedBy: data.invitedBy,
      invitedAt: data.invitedAt,
      lastAccessedAt: data.lastAccessedAt,
      metadata: data.metadata,
      permissions: data.permissions,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IUserOrganizationWithId;
  }
};