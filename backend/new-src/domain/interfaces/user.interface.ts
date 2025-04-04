/**
 * User domain interfaces
 * Defines the core User entity and related types
 */
import { IBaseEntity, ID, UserRole } from '@/types/base.types';

/**
 * User status enum
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'locked' | 'suspended';

/**
 * User preferences interface
 */
export interface IUserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

/**
 * User contact information interface
 */
export interface IUserContact {
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
 * User profile interface
 */
export interface IUserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  contact?: IUserContact;
}

/**
 * User organization relationship interface
 */
export interface IUserOrganization {
  organizationId: ID;
  role: UserRole;
  isDefault?: boolean;
  joinedAt: Date;
}

/**
 * User entity interface
 */
export interface IUser extends IBaseEntity {
  email: string;
  passwordHash: string;
  status: UserStatus;
  profile: IUserProfile;
  preferences: IUserPreferences;
  organizations: IUserOrganization[];
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  emailVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * User creation data interface
 */
export type UserCreateData = Omit<
  IUser, 
  'id' | 'createdAt' | 'updatedAt' | 'passwordHash'
> & {
  password: string;
};

/**
 * User update data interface
 */
export type UserUpdateData = Partial<Omit<
  IUser, 
  'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'email' | 'emailVerified'
>> & {
  password?: string;
};

/**
 * User login credentials
 */
export interface IUserCredentials {
  email: string;
  password: string;
}

/**
 * User authentication tokens
 */
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Basic user data for API responses
 */
export interface IUserBasicData {
  id: ID;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
}

/**
 * User service interface
 */
export interface IUserService {
  createUser(userData: UserCreateData): Promise<IUser>;
  getUserById(id: ID): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: ID, userData: UserUpdateData): Promise<IUser>;
  deleteUser(id: ID): Promise<boolean>;
  validateCredentials(credentials: IUserCredentials): Promise<IUser>;
  generateAuthTokens(user: IUser): IAuthTokens;
  addUserToOrganization(userId: ID, organizationId: ID, role: UserRole): Promise<IUser>;
  removeUserFromOrganization(userId: ID, organizationId: ID): Promise<IUser>;
  setDefaultOrganization(userId: ID, organizationId: ID): Promise<IUser>;
  getUsersByOrganization(organizationId: ID): Promise<IUserBasicData[]>;
}