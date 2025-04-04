/**
 * User Repository Implementation
 * Provides type-safe database operations for User entities
 */
import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '@/repositories/base.repository';
import { ID } from '@/types/base.types';
import { NotFoundError } from '@/types/error.types';
import { IUser, IUserOrganization, UserStatus } from '../interfaces/user.interface';
import UserModel, { IUserDocument } from '../models/user.model';

/**
 * User repository interface
 */
export interface IUserRepository {
  // Base repository methods
  create(data: Partial<IUser>): Promise<IUser>;
  findById(id: ID): Promise<IUser | null>;
  update(id: ID, data: Partial<IUser>): Promise<IUser>;
  delete(id: ID): Promise<boolean>;
  
  // User specific methods
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailOrFail(email: string): Promise<IUser>;
  findByIdOrFail(id: ID): Promise<IUser>;
  findByOrganization(organizationId: ID): Promise<IUser[]>;
  findActiveUsers(): Promise<IUser[]>;
  addOrganization(userId: ID, organizationData: IUserOrganization): Promise<IUser>;
  removeOrganization(userId: ID, organizationId: ID): Promise<IUser>;
  setDefaultOrganization(userId: ID, organizationId: ID): Promise<IUser>;
  updateStatus(userId: ID, status: UserStatus): Promise<IUser>;
  updatePassword(userId: ID, passwordHash: string): Promise<IUser>;
  incrementLoginAttempts(userId: ID): Promise<number>;
  resetLoginAttempts(userId: ID): Promise<void>;
  setResetToken(userId: ID, token: string, expiresIn: number): Promise<void>;
}

/**
 * User repository implementation using Mongoose
 */
@injectable()
export class UserRepository extends BaseRepository<IUser, IUserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  /**
   * Finds a user by email
   * @param email - User email
   * @returns User or null
   */
  public async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Finds a user by email or throws NotFoundError
   * @param email - User email
   * @returns User
   * @throws NotFoundError
   */
  public async findByEmailOrFail(email: string): Promise<IUser> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User not found with email: ${email}`);
    }
    return user;
  }

  /**
   * Finds a user by ID or throws NotFoundError
   * @param id - User ID
   * @returns User
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError(`User not found with id: ${id}`);
    }
    return user;
  }

  /**
   * Finds users belonging to an organization
   * @param organizationId - Organization ID
   * @returns Array of users
   */
  public async findByOrganization(organizationId: ID): Promise<IUser[]> {
    const filter: FilterQuery<IUserDocument> = {
      'organizations.organizationId': organizationId.toString()
    };
    
    const result = await this.find(filter, { 
      limit: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Finds active users
   * @returns Array of active users
   */
  public async findActiveUsers(): Promise<IUser[]> {
    const filter: FilterQuery<IUserDocument> = {
      status: 'active'
    };
    
    const result = await this.find(filter, {
      limit: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result.items;
  }

  /**
   * Adds an organization to a user
   * @param userId - User ID
   * @param organizationData - Organization data
   * @returns Updated user
   */
  public async addOrganization(userId: ID, organizationData: IUserOrganization): Promise<IUser> {
    const user = await this.findByIdOrFail(userId);
    
    // Check if user already has this organization
    const existingOrgIndex = user.organizations?.findIndex(
      org => org.organizationId.toString() === organizationData.organizationId.toString()
    );
    
    if (existingOrgIndex !== -1 && existingOrgIndex !== undefined) {
      // Update existing organization
      if (user.organizations) {
        user.organizations[existingOrgIndex] = {
          ...user.organizations[existingOrgIndex],
          ...organizationData,
        };
      }
    } else {
      // Add new organization
      if (!user.organizations) {
        user.organizations = [];
      }
      user.organizations.push(organizationData);
    }
    
    return this.update(userId, { organizations: user.organizations });
  }

  /**
   * Removes an organization from a user
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Updated user
   */
  public async removeOrganization(userId: ID, organizationId: ID): Promise<IUser> {
    const user = await this.findByIdOrFail(userId);
    
    if (!user.organizations) {
      return user;
    }
    
    // Filter out the organization
    const updatedOrganizations = user.organizations.filter(
      org => org.organizationId.toString() !== organizationId.toString()
    );
    
    return this.update(userId, { organizations: updatedOrganizations });
  }

  /**
   * Sets the default organization for a user
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Updated user
   */
  public async setDefaultOrganization(userId: ID, organizationId: ID): Promise<IUser> {
    const user = await this.findByIdOrFail(userId);
    
    if (!user.organizations) {
      return user;
    }
    
    // Update isDefault flag for all organizations
    const updatedOrganizations = user.organizations.map(org => ({
      ...org,
      isDefault: org.organizationId.toString() === organizationId.toString()
    }));
    
    return this.update(userId, { organizations: updatedOrganizations });
  }

  /**
   * Updates a user's status
   * @param userId - User ID
   * @param status - New status
   * @returns Updated user
   */
  public async updateStatus(userId: ID, status: UserStatus): Promise<IUser> {
    return this.update(userId, { status });
  }

  /**
   * Updates a user's password
   * @param userId - User ID
   * @param passwordHash - New password hash
   * @returns Updated user
   */
  public async updatePassword(userId: ID, passwordHash: string): Promise<IUser> {
    return this.update(userId, { 
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      failedLoginAttempts: 0
    });
  }

  /**
   * Increments failed login attempts for a user
   * @param userId - User ID
   * @returns New attempts count
   */
  public async incrementLoginAttempts(userId: ID): Promise<number> {
    const user = await this.findByIdOrFail(userId);
    const attempts = (user.failedLoginAttempts || 0) + 1;
    
    const updatedUser = await this.update(userId, { 
      failedLoginAttempts: attempts,
      status: attempts >= 5 ? 'locked' : user.status
    });
    
    return updatedUser.failedLoginAttempts || 0;
  }

  /**
   * Resets failed login attempts for a user
   * @param userId - User ID
   */
  public async resetLoginAttempts(userId: ID): Promise<void> {
    await this.update(userId, { 
      failedLoginAttempts: 0,
      lastLoginAt: new Date()
    });
  }

  /**
   * Sets a password reset token for a user
   * @param userId - User ID
   * @param token - Reset token
   * @param expiresIn - Expiration time in minutes
   */
  public async setResetToken(userId: ID, token: string, expiresIn: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresIn);
    
    await this.update(userId, { 
      passwordResetToken: token,
      passwordResetExpires: expiresAt
    });
  }
}