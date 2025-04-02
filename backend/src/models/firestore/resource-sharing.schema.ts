/**
 * Resource sharing schema for cross-organization access
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Resource sharing access levels
 */
export enum AccessLevel {
  VIEW = 'view',
  EDIT = 'edit',
  FULL = 'full'
}

/**
 * Resource sharing types
 */
export enum SharingType {
  ORGANIZATION = 'organization', // Shared with an organization
  USER = 'user',                // Shared with a specific user
  GROUP = 'group',              // Shared with a user group
  PUBLIC = 'public'             // Public sharing with anyone
}

/**
 * Interface for ResourceSharing
 */
export interface IResourceSharing {
  resourceType: string;
  resourceId: string;
  ownerId: string;
  ownerOrganizationId: string;
  sharingType: SharingType;
  targetId: string; // OrganizationId, UserId, or GroupId depending on sharingType
  accessLevel: AccessLevel;
  expiresAt?: Date | Timestamp; // Optional expiration date
  permissions?: string[]; // Specific permissions granted
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  metadata?: Record<string, any>;
}

/**
 * ResourceSharing with ID field
 */
export interface IResourceSharingWithId extends IResourceSharing {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const resourceSharingConverter = {
  toFirestore(sharing: IResourceSharing): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      resourceType: sharing.resourceType,
      resourceId: sharing.resourceId,
      ownerId: sharing.ownerId,
      ownerOrganizationId: sharing.ownerOrganizationId,
      sharingType: sharing.sharingType,
      targetId: sharing.targetId,
      accessLevel: sharing.accessLevel,
      expiresAt: sharing.expiresAt instanceof Date 
        ? Timestamp.fromDate(sharing.expiresAt) 
        : sharing.expiresAt,
      permissions: sharing.permissions || [],
      metadata: sharing.metadata || {},
      createdAt: sharing.createdAt instanceof Date 
        ? Timestamp.fromDate(sharing.createdAt) 
        : sharing.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IResourceSharingWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      ownerId: data.ownerId,
      ownerOrganizationId: data.ownerOrganizationId,
      sharingType: data.sharingType,
      targetId: data.targetId,
      accessLevel: data.accessLevel,
      expiresAt: data.expiresAt,
      permissions: data.permissions,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IResourceSharingWithId;
  }
};