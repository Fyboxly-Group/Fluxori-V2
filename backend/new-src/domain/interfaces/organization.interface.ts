/**
 * Organization domain interfaces
 * Defines the core Organization entity and related types
 */
import { IBaseEntity, ID } from '@/types/base.types';

/**
 * Organization status type
 */
export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'archived';

/**
 * Organization type
 */
export type OrganizationType = 'business' | 'individual' | 'non-profit' | 'educational';

/**
 * Business details interface
 */
export interface IBusinessDetails {
  taxId?: string;
  registrationNumber?: string;
  industryType?: string;
  yearFounded?: number;
  website?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
}

/**
 * Contact information interface
 */
export interface IContactInfo {
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Billing information interface
 */
export interface IBillingInfo {
  plan?: string;
  billingCycle?: 'monthly' | 'annual';
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'paypal';
  billingEmail?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Organization settings interface
 */
export interface IOrganizationSettings {
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandingEnabled?: boolean;
  features?: Record<string, boolean>;
}

/**
 * Organization integration interface
 */
export interface IOrganizationIntegration {
  id: ID;
  type: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  authData?: Record<string, unknown>;
  lastSyncAt?: Date;
}

/**
 * Organization entity interface
 */
export interface IOrganization extends IBaseEntity {
  name: string;
  slug: string;
  description?: string;
  status: OrganizationStatus;
  type: OrganizationType;
  ownerId: ID;
  parentOrganizationId?: ID;
  contact: IContactInfo;
  business?: IBusinessDetails;
  billing?: IBillingInfo;
  settings: IOrganizationSettings;
  integrations?: IOrganizationIntegration[];
  metadata?: Record<string, unknown>;
}

/**
 * Organization creation data interface
 */
export type OrganizationCreateData = Omit<IOrganization, 'id' | 'createdAt' | 'updatedAt' | 'integrations'>;

/**
 * Organization update data interface
 */
export type OrganizationUpdateData = Partial<Omit<IOrganization, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Basic organization data for API responses
 */
export interface IOrganizationBasicData {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  type: OrganizationType;
}

/**
 * Organization invitation interface
 */
export interface IOrganizationInvitation extends IBaseEntity {
  organizationId: ID;
  email: string;
  role: string;
  token: string;
  invitedBy: ID;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

/**
 * Organization member interface
 */
export interface IOrganizationMember {
  userId: ID;
  organizationId: ID;
  role: string;
  joinedAt: Date;
  invitedBy?: ID;
  status: 'active' | 'inactive';
}

/**
 * Organization service interface
 */
export interface IOrganizationService {
  createOrganization(data: OrganizationCreateData): Promise<IOrganization>;
  getOrganizationById(id: ID): Promise<IOrganization | null>;
  getOrganizationBySlug(slug: string): Promise<IOrganization | null>;
  updateOrganization(id: ID, data: OrganizationUpdateData): Promise<IOrganization>;
  deleteOrganization(id: ID): Promise<boolean>;
  getUserOrganizations(userId: ID): Promise<IOrganizationBasicData[]>;
  inviteUserToOrganization(organizationId: ID, email: string, role: string, invitedBy: ID): Promise<IOrganizationInvitation>;
  acceptInvitation(token: string, userId: ID): Promise<IOrganizationMember>;
  declineInvitation(token: string): Promise<boolean>;
  removeUserFromOrganization(organizationId: ID, userId: ID): Promise<boolean>;
  updateUserRole(organizationId: ID, userId: ID, role: string): Promise<IOrganizationMember>;
  addIntegration(organizationId: ID, integration: Omit<IOrganizationIntegration, 'id'>): Promise<IOrganizationIntegration>;
  updateIntegration(organizationId: ID, integrationId: ID, data: Partial<IOrganizationIntegration>): Promise<IOrganizationIntegration>;
  removeIntegration(organizationId: ID, integrationId: ID): Promise<boolean>;
}