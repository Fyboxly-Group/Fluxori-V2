/**
 * User schema for multi-account architecture
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * User status types
 */
export enum UserStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

/**
 * User types
 */
export enum UserType {
  REGULAR = 'regular',
  ADMIN = 'admin',
  SERVICE = 'service', // Service accounts
  INTEGRATION = 'integration' // Integration accounts
}

/**
 * Authentication provider types
 */
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  SAML = 'saml'
}

/**
 * Interface for User
 */
export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  type: UserType;
  phoneNumber?: string;
  photoURL?: string;
  defaultOrganizationId?: string; // User's primary organization
  organizations?: string[]; // Array of organization IDs the user belongs to
  authProvider: AuthProvider;
  passwordLastChanged?: Date | Timestamp;
  mfaEnabled: boolean;
  lastLogin?: Date | Timestamp;
  lastActiveOrganizationId?: string; // Last organization the user accessed
  preferredLanguage?: string;
  timezone?: string;
  preferences?: {
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    dashboardLayout?: any;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * User with ID field
 */
export interface IUserWithId extends IUser {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const userConverter = {
  toFirestore(user: IUser): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      email: user.email.toLowerCase(),
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      type: user.type,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      defaultOrganizationId: user.defaultOrganizationId,
      organizations: user.organizations || [],
      authProvider: user.authProvider,
      passwordLastChanged: user.passwordLastChanged instanceof Date 
        ? Timestamp.fromDate(user.passwordLastChanged) 
        : user.passwordLastChanged,
      mfaEnabled: user.mfaEnabled || false,
      lastLogin: user.lastLogin instanceof Date 
        ? Timestamp.fromDate(user.lastLogin) 
        : user.lastLogin,
      lastActiveOrganizationId: user.lastActiveOrganizationId,
      preferredLanguage: user.preferredLanguage || 'en',
      timezone: user.timezone || 'UTC',
      preferences: user.preferences || {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      metadata: user.metadata || {},
      createdAt: user.createdAt instanceof Date 
        ? Timestamp.fromDate(user.createdAt) 
        : user.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IUserWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      status: data.status,
      type: data.type,
      phoneNumber: data.phoneNumber,
      photoURL: data.photoURL,
      defaultOrganizationId: data.defaultOrganizationId,
      organizations: data.organizations,
      authProvider: data.authProvider,
      passwordLastChanged: data.passwordLastChanged,
      mfaEnabled: data.mfaEnabled,
      lastLogin: data.lastLogin,
      lastActiveOrganizationId: data.lastActiveOrganizationId,
      preferredLanguage: data.preferredLanguage,
      timezone: data.timezone,
      preferences: data.preferences,
      metadata: data.metadata,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IUserWithId;
  }
};