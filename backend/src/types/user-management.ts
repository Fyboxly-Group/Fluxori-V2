import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from '../models/user.model';
import { MembershipType } from '../models/firestore';
import { Types } from 'mongoose';

/**
 * Extended authenticated request with organization data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    currentOrganizationId: string;
    email?: string;
    role?: string;
    isSystemAdmin?: boolean;
    membershipType?: MembershipType;
    permissions?: Set<string>;
    organizations?: string[];
    firstName?: string;
    lastName?: string;
    _id?: Types.ObjectId;
  };
}

/**
 * User response data without password
 */
export interface UserResponseData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

/**
 * User controller interface
 */
export interface IUserController {
  getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  activateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  changeUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  getUserOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * User service interface
 */
export interface IUserService {
  getAllUsers(): Promise<IUserDocument[]>;
  getUserById(id: string): Promise<IUserDocument | null>;
  createUser(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  updateUser(id: string, userData: Partial<IUserDocument>): Promise<IUserDocument | null>;
  deleteUser(id: string): Promise<boolean>;
  activateUser(id: string): Promise<IUserDocument | null>;
  deactivateUser(id: string): Promise<IUserDocument | null>;
  changeUserRole(id: string, role: string): Promise<IUserDocument | null>;
  resetUserPassword(id: string, newPassword: string): Promise<boolean>;
  getUserOrganizations(userId: string): Promise<any[]>;
}

/**
 * Filter for user data to exclude sensitive information
 * @param user The user document to filter
 * @returns Filtered user data without sensitive fields
 */
export const filterUserData = (user: IUserDocument): UserResponseData => {
  return {
    _id: user._id?.toString() || '',
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};