import { injectable, inject } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUserDocument } from '../models/user.model';
import { TYPES } from '../config/inversify.types';
import { ILoggerService } from './logger.service';
import { ApiError } from '../middleware/error.middleware';

/**
 * JWT Token payload interface
 */
export interface JwtTokenPayload {
  id: string;
  email?: string;
  role?: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Token validation result interface
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: JwtTokenPayload;
  error?: string;
}

/**
 * Token configuration interface
 */
export interface TokenConfig {
  secret: string;
  expiresIn: string | number;
}

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Generate a JWT token for a user
   */
  generateToken(id: string | Types.ObjectId, additionalPayload?: Partial<JwtTokenPayload>): string;

  /**
   * Generate a reset token for password recovery
   */
  generateResetToken(id: string | Types.ObjectId): string;

  /**
   * Validate a JWT token
   */
  validateToken(token: string, options?: { resetToken?: boolean }): TokenValidationResult;

  /**
   * Get user by ID with error handling
   */
  getUserById(id: string): Promise<IUserDocument>;

  /**
   * Authenticate a user with email and password
   */
  authenticateUser(email: string, password: string): Promise<{ user: IUserDocument; token: string }>;
}

/**
 * Authentication service implementation
 * Provides type-safe JWT operations and user authentication
 */
@injectable()
export class AuthService implements IAuthService {
  // Default token configurations
  private readonly tokenConfig: TokenConfig = {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  private readonly resetTokenConfig: TokenConfig = {
    secret: process.env.JWT_RESET_SECRET || 'reset_secret',
    expiresIn: '1h',
  };

  constructor(@inject(TYPES.LoggerService) private logger: ILoggerService) {}

  /**
   * Generate a JWT token for a user
   * @param id User ID
   * @param additionalPayload Additional payload data
   * @returns JWT token
   */
  public generateToken(id: string | Types.ObjectId, additionalPayload: Partial<JwtTokenPayload> = {}): string {
    try {
      // Convert id to string if needed
      const idStr = typeof id === 'string' ? id : id.toString();

      // Prepare the payload
      const payload: JwtTokenPayload = {
        id: idStr,
        ...additionalPayload,
      };

      // Convert secret to Buffer for type safety
      const secretKey = Buffer.from(this.tokenConfig.secret, 'utf-8');

      // Generate the token
      return jwt.sign(payload, secretKey, { expiresIn: this.tokenConfig.expiresIn });
    } catch (error) {
      this.logger.error('Error generating JWT token', { error });
      throw new ApiError(500, 'Failed to generate authentication token');
    }
  }

  /**
   * Generate a reset token for password recovery
   * @param id User ID
   * @returns Reset token
   */
  public generateResetToken(id: string | Types.ObjectId): string {
    try {
      // Convert id to string if needed
      const idStr = typeof id === 'string' ? id : id.toString();

      // Prepare the payload
      const payload: JwtTokenPayload = {
        id: idStr,
      };

      // Convert secret to Buffer for type safety
      const secretKey = Buffer.from(this.resetTokenConfig.secret, 'utf-8');

      // Generate the token
      return jwt.sign(payload, secretKey, { expiresIn: this.resetTokenConfig.expiresIn });
    } catch (error) {
      this.logger.error('Error generating reset token', { error });
      throw new ApiError(500, 'Failed to generate password reset token');
    }
  }

  /**
   * Validate a JWT token
   * @param token JWT token
   * @param options Validation options
   * @returns Token validation result
   */
  public validateToken(token: string, options: { resetToken?: boolean } = {}): TokenValidationResult {
    try {
      // Determine which token config to use
      const config = options.resetToken ? this.resetTokenConfig : this.tokenConfig;

      // Convert secret to Buffer for type safety
      const secretKey = Buffer.from(config.secret, 'utf-8');

      // Verify the token
      const decoded = jwt.verify(token, secretKey) as JwtTokenPayload;

      // Validate the payload
      if (!decoded.id) {
        return {
          valid: false,
          error: 'Invalid token payload: missing id',
        };
      }

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Token validation failed', { error: errorMessage });

      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get user by ID with error handling
   * @param id User ID
   * @returns User document
   */
  public async getUserById(id: string): Promise<IUserDocument> {
    try {
      const user = await User.findById(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'User account is deactivated');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this.logger.error('Error fetching user by ID', { id, error });
      throw new ApiError(500, 'Failed to fetch user');
    }
  }

  /**
   * Authenticate a user with email and password
   * @param email User email
   * @param password User password
   * @returns User document and JWT token
   */
  public async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    try {
      // Check for required fields
      if (!email || !password) {
        throw new ApiError(400, 'Please provide email and password', {
          ...(email ? {} : { email: ['Email is required'] }),
          ...(password ? {} : { password: ['Password is required'] }),
        });
      }

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      // Verify password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Your account has been deactivated');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token with user information
      const additionalPayload: Partial<JwtTokenPayload> = {
        email: user.email,
        role: user.role,
      };

      const token = this.generateToken(user._id, additionalPayload);

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      this.logger.error('Authentication error', { email, error });
      throw new ApiError(500, 'Authentication failed');
    }
  }
}