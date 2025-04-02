/**
 * Organization schema for multi-account architecture
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Organization types for different account tiers
 */
export enum OrganizationType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  AGENCY = 'agency'
}

/**
 * Organization status types
 */
export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired'
}

/**
 * Interface for Organization hierarchy
 */
export interface IOrganization {
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  parentId?: string; // Reference to parent organization for hierarchical structure
  rootId?: string; // Reference to the top-level organization in hierarchy
  path?: string[]; // Array of organization IDs representing the path from root to this org
  ownerId: string; // User ID of the organization owner
  settings?: {
    allowSuborganizations: boolean;
    maxUsers?: number;
    maxSuborganizations?: number;
    defaultUserRole?: string;
    theme?: string;
    features?: string[]; // Enabled features for the organization
  };
  metadata?: Record<string, any>;
  billingId?: string; // External billing system reference
  subscription?: {
    plan: string;
    startDate: Date | Timestamp;
    endDate?: Date | Timestamp;
    autoRenew: boolean;
  };
  // Fields for agencies managing multiple clients
  agency?: {
    isAgency: boolean;
    clientIds?: string[]; // List of client organization IDs
  };
  domains?: string[]; // Associated email domains for auto-assignment
}

/**
 * Organization with ID field
 */
export interface IOrganizationWithId extends IOrganization {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const organizationConverter = {
  toFirestore(organization: IOrganization): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      name: organization.name,
      type: organization.type,
      status: organization.status,
      parentId: organization.parentId,
      rootId: organization.rootId,
      path: organization.path || [],
      ownerId: organization.ownerId,
      settings: organization.settings || {
        allowSuborganizations: false,
        defaultUserRole: 'member'
      },
      metadata: organization.metadata || {},
      billingId: organization.billingId,
      subscription: organization.subscription ? {
        plan: organization.subscription.plan,
        startDate: organization.subscription.startDate instanceof Date 
          ? Timestamp.fromDate(organization.subscription.startDate) 
          : organization.subscription.startDate,
        endDate: organization.subscription.endDate instanceof Date 
          ? Timestamp.fromDate(organization.subscription.endDate) 
          : organization.subscription.endDate,
        autoRenew: organization.subscription.autoRenew
      } : null,
      agency: organization.agency,
      domains: organization.domains || [],
      createdAt: organization.createdAt instanceof Date 
        ? Timestamp.fromDate(organization.createdAt) 
        : organization.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IOrganizationWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      type: data.type,
      status: data.status,
      parentId: data.parentId,
      rootId: data.rootId,
      path: data.path,
      ownerId: data.ownerId,
      settings: data.settings,
      metadata: data.metadata,
      billingId: data.billingId,
      subscription: data.subscription,
      agency: data.agency,
      domains: data.domains,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IOrganizationWithId;
  }
};