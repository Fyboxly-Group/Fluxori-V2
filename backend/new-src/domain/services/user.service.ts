/**
 * User Service Implementation
 * Provides business logic for user operations with TypeScript support
 */
import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { TYPES } from '@/config/container';
import { ID, createID } from '@/types/base.types';
import { 
  BadRequestError, 
  ConflictError, 
  NotFoundError, 
  UnauthorizedError
} from '@/types/error.types';
import { 
  IUser, 
  IUserService, 
  UserCreateData, 
  UserUpdateData, 
  IUserCredentials,
  IAuthTokens,
  IUserBasicData,
  IUserOrganization,
  UserStatus
} from '../interfaces/user.interface';
import { IUserRepository } from '../repositories/user.repository';
import { generateToken } from '@/utils/token';
import { IJwtPayload } from '@/middlewares/auth.middleware';
import { logger } from '@/utils/logger';

/**
 * User service implementation
 */
@injectable()
export class UserService implements IUserService {
  /**
   * Constructor
   * @param userRepository - User repository
   */
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  /**
   * Creates a new user
   * @param userData - User creation data
   * @returns Created user
   */
  public async createUser(userData: UserCreateData): Promise<IUser> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError(`User with email ${userData.email} already exists`);
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user with hashed password
      const user = await this.userRepository.create({
        ...userData,
        passwordHash,
        email: userData.email.toLowerCase()
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating user:', error);
      throw new BadRequestError('Failed to create user');
    }
  }

  /**
   * Gets a user by ID
   * @param id - User ID
   * @returns User or null
   */
  public async getUserById(id: ID): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Gets a user by email
   * @param email - User email
   * @returns User or null
   */
  public async getUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Updates a user
   * @param id - User ID
   * @param userData - User update data
   * @returns Updated user
   */
  public async updateUser(id: ID, userData: UserUpdateData): Promise<IUser> {
    try {
      // If password is provided, hash it
      if (userData.password) {
        userData.passwordHash = await this.hashPassword(userData.password);
        delete userData.password;
      }

      // Update user
      return this.userRepository.update(id, userData);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error updating user:', error);
      throw new BadRequestError('Failed to update user');
    }
  }

  /**
   * Deletes a user
   * @param id - User ID
   * @returns Whether user was deleted
   */
  public async deleteUser(id: ID): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  /**
   * Validates user credentials
   * @param credentials - User credentials
   * @returns User
   * @throws UnauthorizedError
   */
  public async validateCredentials(credentials: IUserCredentials): Promise<IUser> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'active') {
        if (user.status === 'locked') {
          throw new UnauthorizedError('Account is locked. Please contact support.');
        }
        
        if (user.status === 'suspended') {
          throw new UnauthorizedError('Account is suspended. Please contact support.');
        }
        
        throw new UnauthorizedError('Account is not active');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.userRepository.incrementLoginAttempts(user.id);
        throw new UnauthorizedError('Invalid email or password');
      }

      // Reset failed login attempts
      await this.userRepository.resetLoginAttempts(user.id);

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      logger.error('Error validating credentials:', error);
      throw new UnauthorizedError('Failed to validate credentials');
    }
  }

  /**
   * Generates authentication tokens
   * @param user - User
   * @returns Authentication tokens
   */
  public generateAuthTokens(user: IUser): IAuthTokens {
    // Default organization if user has organizations
    const defaultOrg = user.organizations?.find(org => org.isDefault);
    const organizationId = defaultOrg?.organizationId;

    // Create token payload
    const payload: Omit<IJwtPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      role: defaultOrg?.role || 'user',
      organizationId: organizationId,
    };

    // Generate tokens
    const accessToken = generateToken(payload, 'access');
    const refreshToken = generateToken(payload, 'refresh');

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Adds a user to an organization
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param role - User role
   * @returns Updated user
   */
  public async addUserToOrganization(userId: ID, organizationId: ID, role: string): Promise<IUser> {
    const orgData: IUserOrganization = {
      organizationId,
      role: role as any, // we assume valid roles are passed
      joinedAt: new Date(),
      isDefault: false,
    };
    
    return this.userRepository.addOrganization(userId, orgData);
  }

  /**
   * Removes a user from an organization
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Updated user
   */
  public async removeUserFromOrganization(userId: ID, organizationId: ID): Promise<IUser> {
    return this.userRepository.removeOrganization(userId, organizationId);
  }

  /**
   * Sets default organization for a user
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Updated user
   */
  public async setDefaultOrganization(userId: ID, organizationId: ID): Promise<IUser> {
    return this.userRepository.setDefaultOrganization(userId, organizationId);
  }

  /**
   * Gets users by organization
   * @param organizationId - Organization ID
   * @returns Array of users
   */
  public async getUsersByOrganization(organizationId: ID): Promise<IUserBasicData[]> {
    const users = await this.userRepository.findByOrganization(organizationId);
    
    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      displayName: user.profile.displayName,
      avatar: user.profile.avatar,
    }));
  }

  /**
   * Requests a password reset
   * @param email - User email
   * @returns Whether reset was requested
   */
  public async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // We don't want to reveal if email exists or not
        return true;
      }
      
      // Generate reset token (crypto.randomBytes is more secure than Math.random)
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set token with 1 hour expiration
      await this.userRepository.setResetToken(user.id, token, 60);
      
      // In a real application, you would send an email with the reset link
      // For now, we just log it
      logger.info(`Reset token for ${email}: ${token}`);
      
      return true;
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      return false;
    }
  }

  /**
   * Resets a password
   * @param token - Reset token
   * @param newPassword - New password
   * @returns Whether password was reset
   */
  public async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user by reset token
      const user = await this.userRepository.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });
      
      if (!user) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }
      
      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);
      
      // Update user with new password and remove reset token
      await this.userRepository.update(user.id, {
        passwordHash,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        status: user.status === 'locked' ? 'active' : user.status,
        failedLoginAttempts: 0,
      });
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      logger.error('Error resetting password:', error);
      throw new BadRequestError('Failed to reset password');
    }
  }

  /**
   * Updates a user's status
   * @param userId - User ID
   * @param status - New status
   * @returns Updated user
   */
  public async updateUserStatus(userId: ID, status: UserStatus): Promise<IUser> {
    return this.userRepository.updateStatus(userId, status);
  }

  /**
   * Hashes a password
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a password with a hash
   * @param password - Plain text password
   * @param hash - Password hash
   * @returns Whether password matches
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}