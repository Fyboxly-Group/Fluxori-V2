import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../config/inversify';
import User, { IUserDocument } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';
import { IAuthService, AuthService } from '../services/auth.service';
import { ILoggerService } from '../services/logger.service';
import { AuthenticatedRequest } from '../types/express-extensions';
import { Types } from 'mongoose';

/**
 * Authentication controller
 * Handles user registration, login, and authentication
 */
@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService,
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               role:
 *                 type: string
 *                 enum: [admin, user, guest]
 *                 description: User's role (defaults to 'user')
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
public register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(email ? {} : { email: ['Email is required'] }),
        ...(password ? {} : { password: ['Password is required'] }),
        ...(firstName ? {} : { firstName: ['First name is required'] }),
        ...(lastName ? {} : { lastName: ['Last name is required'] }),
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      throw new ApiError(400, 'User already exists', {
        email: ['Email is already registered'],
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });
    
    // Generate token
    const token = this.authService.generateToken(user._id, {
      email: user.email,
      role: user.role,
    });
    
    // Return user without password
    const userWithoutPassword = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    res.status(201).json({
      success: true,
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    this.logger.error('Error registering user', { error });
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
public login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    try {
      // Authenticate user with auth service
      const { user, token } = await this.authService.authenticateUser(email, password);
      
      // Update last login (already done in the auth service)
      
      // Log login activity
      await ActivityService.logUserLogin(user._id as unknown as Types.ObjectId);
      
      // Return user without password
      const userWithoutPassword = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      
      res.status(200).json({
        success: true,
        token,
        user: userWithoutPassword,
      });
    } catch (authError) {
      // Rethrow authentication errors
      if (authError instanceof ApiError) {
        throw authError;
      }
      
      // Log and throw generic error
      this.logger.error('Authentication error', { email, error: authError });
      throw new ApiError(500, 'Authentication failed');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
public getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is guaranteed to exist on AuthenticatedRequest
    const userId = req.user.id;
    
    try {
      // Get user with full details from database
      const user = await this.authService.getUserById(userId);
      
      // Return user without password
      const userWithoutPassword = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: (user as any).organizationId?.toString() || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      
      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (fetchError) {
      // Log and handle user fetch errors
      this.logger.error('Error fetching user details', { userId, error: fetchError });
      throw new ApiError(500, 'Failed to fetch user details');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address
 *     responses:
 *       200:
 *         description: Password reset request processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If your email exists in our system, you will receive password reset instructions shortly.
 *       400:
 *         description: Email not provided
 */
public forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError(400, 'Please provide email', {
        email: ['Email is required'],
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Don't leak information about user existence
    if (!user) {
      this.logger.info('Password reset requested for non-existent email', { email });
      return res.status(200).json({
        success: true,
        message: 'If your email exists in our system, you will receive password reset instructions shortly.',
      });
    }
    
    // Generate reset token using the auth service
    const resetToken = this.authService.generateResetToken(user._id);
    
    // Log password reset request for security auditing
    this.logger.info('Password reset requested', { userId: user._id.toString(), email });
    
    // For demo purposes, return the token in development mode
    // In production, would send email with reset link
    res.status(200).json({
      success: true,
      message: 'If your email exists in our system, you will receive password reset instructions shortly.',
      // Include token for demo purposes only
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    this.logger.error('Error processing password reset request', { error });
    next(error);
  }
};

/**
 * Reset user password
 * @route POST /api/auth/reset-password
 * @access Public
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received from forgot-password
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password (min 8 characters)
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid input or password requirements not met
 *       401:
 *         description: Invalid or expired token
 */
public resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;
    
    // Validate input
    if (!token || !password) {
      throw new ApiError(400, 'Please provide token and password', {
        ...(token ? {} : { token: ['Token is required'] }),
        ...(password ? {} : { password: ['Password is required'] }),
      });
    }
    
    // Validate password requirements
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long', {
        password: ['Password must be at least 8 characters long'],
      });
    }
    
    try {
      // Verify token using auth service
      const validationResult = this.authService.validateToken(token, { resetToken: true });
      
      if (!validationResult.valid || !validationResult.payload) {
        throw new ApiError(401, 'Invalid or expired reset token');
      }
      
      // Get user ID from token payload
      const userId = validationResult.payload.id;
      
      // Find user by ID
      const user = await User.findById(userId);
      
      if (!user) {
        throw new ApiError(400, 'User not found');
      }
      
      // Update password
      user.password = password;
      await user.save();
      
      // Log activity for auditing
      await ActivityService.logActivity({
        description: 'Password reset successful',
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });
      
      this.logger.info('Password reset successful', { userId: user._id.toString() });
      
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (tokenError) {
      // Log token validation error
      this.logger.error('Reset token validation failed', { error: tokenError });
      
      // Preserve API errors
      if (tokenError instanceof ApiError) {
        throw tokenError;
      }
      
      throw new ApiError(401, 'Invalid or expired reset token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
public logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In a token-based authentication system, the client is responsible
    // for removing the token. Server-side, we just log the activity.
    
    // Log the logout activity for auditing
    await ActivityService.logUserLogout(req.user._id as unknown as Types.ObjectId);
    
    this.logger.info('User logged out', { 
      userId: req.user.id, 
      email: req.user.email 
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    this.logger.error('Error logging out user', { error });
    next(error);
  }
}
}