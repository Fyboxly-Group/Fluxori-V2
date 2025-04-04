import { injectable } from 'inversify';
import 'reflect-metadata';
import User, { IUserDocument } from '../models/user.model';
import { IUserService } from '../types/user-management';
import { Types } from 'mongoose';
import { ActivityService } from './activity.service';

/**
 * Service for managing users
 * Provides methods for user CRUD operations
 */
@injectable()
export class UserService implements IUserService {
  /**
   * Get all users in the system
   * @returns List of all users
   */
  public async getAllUsers(): Promise<IUserDocument[]> {
    return User.find({});
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User document or null if not found
   */
  public async getUserById(id: string): Promise<IUserDocument | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to get user: ${String(error)}`);
      }
    }
  }

  /**
   * Create a new user
   * @param userData User data including email, password, firstName, lastName
   * @returns Created user document
   */
  public async createUser(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    try {
      const { email, password, firstName, lastName, role } = userData;

      // Check if user exists
      const userExists = await User.findOne({ email });
      
      if (userExists) {
        throw new Error('User with this email already exists');
      }
      
      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: role || 'user'
      });

      // Log activity
      await ActivityService.logActivity({
        description: `User ${email} created`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'create',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to create user: ${String(error)}`);
      }
    }
  }

  /**
   * Update a user
   * @param id User ID
   * @param userData New user data
   * @returns Updated user document or null if not found
   */
  public async updateUser(id: string, userData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    try {
      // Ensure password is handled properly when updating
      const { password, ...otherData } = userData;
      
      const user = await User.findById(id);
      if (!user) {
        return null;
      }

      // Update fields
      Object.assign(user, otherData);
      
      // If password is provided, update it
      if (password) {
        user.password = password;
      }
      
      await user.save();

      // Log activity
      await ActivityService.logActivity({
        description: `User ${user.email} updated`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to update user: ${String(error)}`);
      }
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Whether the deletion was successful
   */
  public async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await User.findById(id);
      if (!user) {
        return false;
      }

      const userId = user._id;
      const userEmail = user.email;

      const result = await User.deleteOne({ _id: id });
      
      if (result.deletedCount === 1) {
        // Log activity
        await ActivityService.logActivity({
          description: `User ${userEmail} deleted`,
          entityType: 'user',
          entityId: userId as unknown as Types.ObjectId,
          action: 'delete',
          status: 'completed',
          userId: userId as unknown as Types.ObjectId,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to delete user: ${String(error)}`);
      }
    }
  }

  /**
   * Activate a user
   * @param id User ID
   * @returns Updated user document or null if not found
   */
  public async activateUser(id: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findById(id);
      if (!user) {
        return null;
      }
      
      user.isActive = true;
      await user.save();

      // Log activity
      await ActivityService.logActivity({
        description: `User ${user.email} activated`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to activate user: ${String(error)}`);
      }
    }
  }

  /**
   * Deactivate a user
   * @param id User ID
   * @returns Updated user document or null if not found
   */
  public async deactivateUser(id: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findById(id);
      if (!user) {
        return null;
      }
      
      user.isActive = false;
      await user.save();

      // Log activity
      await ActivityService.logActivity({
        description: `User ${user.email} deactivated`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to deactivate user: ${String(error)}`);
      }
    }
  }

  /**
   * Change a user's role
   * @param id User ID
   * @param role New role
   * @returns Updated user document or null if not found
   */
  public async changeUserRole(id: string, role: string): Promise<IUserDocument | null> {
    try {
      if (!['admin', 'user', 'guest'].includes(role)) {
        throw new Error('Invalid role');
      }
      
      const user = await User.findById(id);
      if (!user) {
        return null;
      }
      
      user.role = role as 'admin' | 'user' | 'guest';
      await user.save();

      // Log activity
      await ActivityService.logActivity({
        description: `User ${user.email} role changed to ${role}`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to change user role: ${String(error)}`);
      }
    }
  }

  /**
   * Reset a user's password
   * @param id User ID
   * @param newPassword New password
   * @returns Whether the password reset was successful
   */
  public async resetUserPassword(id: string, newPassword: string): Promise<boolean> {
    try {
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const user = await User.findById(id);
      if (!user) {
        return false;
      }
      
      user.password = newPassword;
      await user.save();

      // Log activity
      await ActivityService.logActivity({
        description: `User ${user.email} password reset`,
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to reset user password: ${String(error)}`);
      }
    }
  }

  /**
   * Get all organizations a user belongs to
   * @param userId User ID
   * @returns List of organizations the user belongs to
   */
  public async getUserOrganizations(userId: string): Promise<any[]> {
    try {
      // This is a placeholder for actual implementation
      // In a real implementation, this would query the UserOrganizationService
      return [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to get user organizations: ${String(error)}`);
      }
    }
  }
}