import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';
import '../middleware/auth.middleware'; // Import for req.user definition
import { Types } from 'mongoose';
import { generateToken, generateResetToken } from '../utils/jwt.utils';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
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
    
    // Return user without password
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
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
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id ? user._id.toString() : '');
    
    // Log login activity
    await ActivityService.logUserLogin(user._id as unknown as Types.ObjectId);
    
    // Return user without password
    const userWithoutPassword = {
      _id: user._id,
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * @access  Private
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Return user without password
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      return res.status(200).json({
        success: true,
        message: 'If your email exists in our system, you will receive password reset instructions shortly.',
      });
    }
    
    // Generate reset token (would typically send email with this token)
    const resetToken = generateResetToken(user._id as unknown as Types.ObjectId);
    
    // For demo purpose, just return the token
    // In production, send email with reset link
    res.status(200).json({
      success: true,
      message: 'If your email exists in our system, you will receive password reset instructions shortly.',
      // Include token for demo purposes only
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      throw new ApiError(400, 'Please provide token and password', {
        ...(token ? {} : { token: ['Token is required'] }),
        ...(password ? {} : { password: ['Password is required'] }),
      });
    }
    
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long', {
        password: ['Password must be at least 8 characters long'],
      });
    }
    
    try {
      // Verify token
      const resetSecret = process.env.JWT_RESET_SECRET || 'reset_secret';
      const resetSecretKey = Buffer.from(resetSecret, 'utf-8');
      // Use type assertion for the secret and specify the return type
      const decoded = jwt.verify(token, resetSecretKey) as { id: string };
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new ApiError(400, 'Invalid or expired token');
      }
      
      // Update password
      user.password = password;
      await user.save();
      
      // Log activity
      await ActivityService.logActivity({
        description: 'Password reset successful',
        entityType: 'user',
        entityId: user._id as unknown as Types.ObjectId,
        action: 'update',
        status: 'completed',
        userId: user._id as unknown as Types.ObjectId,
      });
      
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      throw new ApiError(400, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a token-based authentication system, the client is responsible
    // for removing the token. Server-side, we just log the activity.
    if (req.user) {
      await ActivityService.logUserLogout(req.user._id as unknown as Types.ObjectId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};