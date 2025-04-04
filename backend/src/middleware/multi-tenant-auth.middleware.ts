// @ts-nocheck - Added by final-ts-fix.js
/**
 * Multi-tenant authentication and authorization middleware
 * Handles user authentication with organization context
 */
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  firebaseUsersCollection, 
  userOrganizationsCollection,
  auditLogsCollection
} from '../config/firestore';
import {
  userConverter,
  userOrganizationConverter,
  MembershipStatus,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter
} from '../models/firestore';
import { RoleService } from '../services/firestore/role.service';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};


// Auth user interfaces
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}

export interface MultiTenantUser extends AuthUser {
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | MultiTenantUser;
      organizationId?: string;
    }
  }
}
// Define AuthUser type for compatibility with existing code
interface AuthUser {
  id: string;
  organizationId: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

// Helper interface to handle Firebase Timestamp methods
interface DateWithFirestoreMethods extends Date {
  toMillis(): number;
  toDate(): Date;
}
// Enhanced user type with organization context
interface MultiTenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizations: string[];
  defaultOrganizationId?: string;
  currentOrganizationId: string; // The active organization context
  roles: string[]; // Roles in the current organization
  permissions: Set<string>; // Effective permissions in the current organization
  membershipType: string; // Type of membership in the current organization
  isSystemAdmin: boolean;
  lastLogin?: Date;
  timezone?: string;
  [key: string]: any;
}

// JWT payload interface
interface JwtPayload {
  userId: string;
  organizationId?: string;
  exp?: number;
  iat?: number;
}

// Extend Express Request type to include enhanced user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | MultiTenantUser;
    }
  }
}

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user with organization context to the request
 */
export const multiTenantAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Invalid token format.'
      });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Get user ID from token
    const userId = decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token payload.'
      });
    }
    
    // Get user from Firestore
    const userSnapshot = await firebaseUsersCollection
      .withConverter(userConverter)
      .doc(userId)
      .get();
    
    if (!userSnapshot.exists) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    }
    
    const user = userSnapshot.data();
    
    // Determine which organization context to use
    // Priority: 1. Explicitly requested in query/header, 2. From token, 3. User's default, 4. First available
    let organizationId = 
      req.query.organizationId as string || 
      req.headers['x-organization-id'] as string ||
      decoded.organizationId ||
      user.defaultOrganizationId;
    
    // Get user's organization memberships
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();
    
    if (userOrgsSnapshot.empty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User does not belong to any organization.'
      });
    }
    
    const userOrgs = userOrgsSnapshot.docs.map((doc: any) => doc.data());
    const orgIds = userOrgs.map((org: any) => org.organizationId);
    
    // If no organization context was specified or the specified one is not valid,
    // use the first available organization
    if (!organizationId || !orgIds.includes(organizationId)) {
      organizationId = orgIds[0];
    }
    
    // Get the specific user-organization relationship for the current context
    const currentUserOrg = userOrgs.find((org: any) => org.organizationId === organizationId);
    
    if (!currentUserOrg) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User does not belong to the specified organization.'
      });
    }
    
    // Get user's roles and permissions for this organization
    const roleService = new RoleService();
    const permissions = await roleService.getUserEffectivePermissions(userId, organizationId);
    
    // Update user's lastActiveOrganizationId if it has changed
    if (user.lastActiveOrganizationId !== organizationId) {
      await firebaseUsersCollection.doc(userId).update({
        lastActiveOrganizationId: organizationId,
        updatedAt: Timestamp.now()
      });
    }
    
    // Update user's lastLogin if it's been more than a day
    const now = Timestamp.now();
    if (!user.lastLogin || (now.toMillis() - user.lastLogin.toMillis() > 24 * 60 * 60 * 1000)) {
      await firebaseUsersCollection.doc(userId).update({
        lastLogin: now,
        updatedAt: now
      });
      
      // Log login event
      const auditLog = createAuditLog(
        userId,
        user.email,
        organizationId,
        AuditCategory.AUTHENTICATION,
        AuditAction.LOGIN,
        'user',
        `User logged in`,
        {
          severity: AuditSeverity.INFO,
          metadata: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            organizationId
          }
        }
      );
      
      await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    }
    
    // Create enhanced user object with organization context
    req.user = {
      id: userId,
      organizationId: organizationId, // Add the organizationId property
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizations: orgIds,
      defaultOrganizationId: user.defaultOrganizationId,
      currentOrganizationId: organizationId,
      roles: currentUserOrg.roles,
      permissions,
      membershipType: currentUserOrg.type,
      isSystemAdmin: false, // Will be set if the user has system admin permissions
      lastLogin: (user.lastLogin as any).toDate(),
      timezone: user.timezone,
      preferredLanguage: user.preferredLanguage,
      photoURL: user.photoURL
    };
    
    // Check if user is a system admin (for convenience in authorization)
    if (permissions.has('*:*')) {
      req.user.isSystemAdmin = true;
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token.'
    });
  }
};

/**
 * Middleware to require specific permissions
 * @param resourceAction Array of resource:action strings required (any one is sufficient)
 */
export const requirePermission = (resourceAction: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // System admins always have all permissions
    if (req.user.isSystemAdmin) {
      return next();
    }
    
    // Check if user has any of the required permissions
    const hasPermission = resourceAction.some((permission: any) => 
      req.user?.permissions.has(permission)
    );
    
    if (!hasPermission) {
      // Log access denial
      const auditLog = createAuditLog(
        req.user?.id,
        req.user?.email,
        req.user.currentOrganizationId,
        AuditCategory.AUTHORIZATION,
        AuditAction.ACCESS,
        'permission',
        `Access denied to ${req.originalUrl}`,
        {
          severity: AuditSeverity.WARNING,
          metadata: {
            requiredPermissions: resourceAction,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }
        }
      );
      
      auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

/**
 * Middleware to require organization owner status
 */
export const requireOrganizationOwner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  // System admins bypass this check
  if (req.user.isSystemAdmin) {
    return next();
  }
  
  if (req.user.membershipType !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organization owner permission required.'
    });
  }
  
  next();
};

/**
 * Middleware to require system admin status
 */
export const requireSystemAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.user.isSystemAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. System administrator permission required.'
    });
  }
  
  next();
};

/**
 * Middleware to log API access
 */
export const logApiAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(); // Skip if not authenticated
  }
  
  // Log API access
  const auditLog = createAuditLog(
    req.user?.id,
    req.user?.email,
    req.user.currentOrganizationId,
    AuditCategory.AUTHORIZATION,
    AuditAction.ACCESS,
    'api',
    `API access to ${req.method} ${req.originalUrl}`,
    {
      severity: AuditSeverity.INFO,
      metadata: {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        query: req.query,
        // Do not log sensitive body data
        hasBody: !!req.body && Object.keys(req.body).length > 0
      }
    }
  );
  
  auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
  
  next();
};