/**
 * Role Controller
 * Handles HTTP requests for role and permission management
 */
import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../../../services/firestore/role.service';
import { UserOrganizationService } from '../../../services/firestore/user-organization.service';
import { RoleScope } from '../../../models/firestore';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * Controller for role management
 */
export class RoleController {
  private roleService: RoleService;
  private userOrganizationService: UserOrganizationService;
  
  constructor() {
    this.roleService = new RoleService();
    this.userOrganizationService = new UserOrganizationService();
  }
  

  /**
   * getRoles
   * Get all roles for the current organization
   * @route GET /api/roles/all
   */
  async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      // Get organization-specific roles
      const organizationRoles = await this.roleService.getOrganizationRoles(organizationId);
      
      // Get system roles
      const systemRoles = await this.roleService.getSystemRoles();
      
      // Combine and categorize roles
      const roles = {
        system: systemRoles.filter(role => role.scope === RoleScope.SYSTEM),
        organization: organizationRoles.filter(role => role.scope === RoleScope.ORGANIZATION),
        custom: organizationRoles.filter(role => !role.isBuiltIn)
      };
      
      res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getAvailablePermissions
   * Get all available permissions
   * @route GET /api/roles/permissions
   */
  async getAvailablePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Import at method level to avoid circular dependencies
      const { PermissionResource, PermissionAction } = require('../../../models/firestore');
      
      // Get all available resources and actions
      const resources = Object.values(PermissionResource);
      const actions = Object.values(PermissionAction);
      
      // Create examples of common permission combinations
      const examples = [
        { resource: 'organization', action: 'read', description: 'View organization details' },
        { resource: 'organization', action: 'update', description: 'Update organization settings' },
        { resource: 'user', action: 'create', description: 'Invite users to the organization' },
        { resource: 'user', action: 'read', description: 'View users in the organization' },
        { resource: 'role', action: 'manage', description: 'Full control over roles' },
        { resource: 'inventory', action: '*', description: 'Full access to inventory' },
        { resource: '*', action: 'read', description: 'Read-only access to all resources' },
        { resource: '*', action: '*', description: 'Full access to all resources (admin)' }
      ];
      
      // Group resources by category
      const resourceCategories = {
        core: ['organization', 'user', 'role'],
        business: ['inventory', 'order', 'customer', 'supplier', 'project', 'task'],
        reporting: ['analytics', 'report', 'feedback'],
        integrations: ['marketplace', 'connection', 'warehouse', 'accounting'],
        system: ['settings', 'billing', 'audit', 'log', 'notification']
      };
      
      res.status(200).json({
        success: true,
        resources,
        actions,
        resourceCategories,
        examples
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getUserPermissions
   * Get permissions for a specific user
   * @route GET /api/roles/user/:userId/permissions
   */
  async getUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { organizationId } = req.query;
      
      // Use specified organization or current organization
      const targetOrgId = (organizationId as string) || req.user!.currentOrganizationId;
      
      // Check if user has permission to view this info
      if (userId !== req.user!.id && !req.user!.isSystemAdmin && req.user!.currentOrganizationId !== targetOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to view this user\'s permissions'
        });
      }
      
      // Get user's organization membership to get roles
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        targetOrgId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User is not a member of the specified organization'
        });
      }
      
      // Get all roles assigned to user
      const roles = [];
      for (const roleId of membership.roles) {
        const role = await this.roleService.getRoleById(roleId);
        if (role) {
          roles.push(role);
        }
      }
      
      // Get effective permissions
      const effectivePermissions = await this.roleService.getUserEffectivePermissions(
        userId,
        targetOrgId
      );
      
      // Organize custom permissions
      const customPermissions = membership.permissions?.customPermissions || [];
      const restrictedPermissions = membership.permissions?.restrictedPermissions || [];
      
      res.status(200).json({
        success: true,
        membership: {
          userId: membership.userId,
          organizationId: membership.organizationId,
          type: membership.type,
          status: membership.status,
          roles: membership.roles
        },
        roles,
        effectivePermissions: Array.from(effectivePermissions),
        customPermissions,
        restrictedPermissions
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create a custom role
   * @route POST /api/roles
   */
  async createRole(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { name, description, permissions } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!name || !description || !permissions) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and permissions are required'
        });
      }
      
      // Create role
      const role = await this.roleService.createRole(
        name,
        description,
        organizationId,
        permissions,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(201).json({
        success: true,
        message: 'Role created successfully',
        role
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Get all roles for the current organization
   * @route GET /api/roles
   */
  async getOrganizationRoles(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      const roles = await this.roleService.getOrganizationRoles(organizationId);
      
      return res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get role by ID
   * @route GET /api/roles/:id
   */
  async getRoleById(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      const role = await this.roleService.getRoleById(id);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      // Check if user has access to this role
      if (
        role.scope === RoleScope.ORGANIZATION && 
        role.organizationId !== req.user!.currentOrganizationId && 
        !req.user!.isSystemAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this role'
        });
      }
      
      return res.status(200).json({
        success: true,
        role
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update role
   * @route PATCH /api/roles/:id
   */
  async updateRole(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get role to check ownership
      const role = await this.roleService.getRoleById(id);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      // Check if user has access to modify this role
      if (
        role.scope === RoleScope.ORGANIZATION && 
        role.organizationId !== req.user!.currentOrganizationId && 
        !req.user!.isSystemAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to modify this role'
        });
      }
      
      // Additional check for built-in roles
      if (role.isBuiltIn) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify built-in roles'
        });
      }
      
      const updatedRole = await this.roleService.updateRole(
        id,
        updateData,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        role: updatedRole
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete role
   * @route DELETE /api/roles/:id
   */
  async deleteRole(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Get role to check ownership
      const role = await this.roleService.getRoleById(id);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      
      // Check if user has access to delete this role
      if (
        role.scope === RoleScope.ORGANIZATION && 
        role.organizationId !== req.user!.currentOrganizationId && 
        !req.user!.isSystemAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to delete this role'
        });
      }
      
      await this.roleService.deleteRole(
        id,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('built-in role')) {
        return res.status(403).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('is assigned to users')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Assign role to user
   * @route POST /api/roles/:id/assign
   */
  async assignRoleToUser(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Assign role
      await this.roleService.assignRoleToUser(
        id,
        userId,
        organizationId,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Role assigned successfully'
      });
    } catch (error: any) {
      console.error('Error assigning role:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('not a member')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Remove role from user
   * @route DELETE /api/roles/:id/assign/:userId
   */
  async removeRoleFromUser(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id, userId } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Remove role
      await this.roleService.removeRoleFromUser(
        id,
        userId,
        organizationId,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Role removed successfully'
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('owner role')) {
        return res.status(403).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Get users with a specific role
   * @route GET /api/roles/:id/users
   */
  async getUsersByRole(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      const userOrgs = await this.userOrganizationService.getOrganizationMembersByRole(
        organizationId,
        id
      );
      
      return res.status(200).json({
        success: true,
        users: userOrgs
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get current user's effective permissions
   * @route GET /api/roles/me/permissions
   */
  async getCurrentUserPermissions(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const permissions = await this.roleService.getUserEffectivePermissions(
        req.user!.id,
        req.user!.currentOrganizationId
      );
      
      return res.status(200).json({
        success: true,
        permissions: Array.from(permissions)
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Check if current user has a specific permission
   * @route GET /api/roles/check-permission
   */
  async checkPermission(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { resource, action, resourceId } = req.query;
      
      if (!resource || !action) {
        return res.status(400).json({
          success: false,
          message: 'Resource and action are required'
        });
      }
      
      const hasPermission = await this.roleService.hasPermission(
        req.user!.id,
        req.user!.currentOrganizationId,
        resource as string,
        action as string,
        resourceId as string
      );
      
      return res.status(200).json({
        success: true,
        hasPermission
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get system roles (admin only)
   * @route GET /api/roles/system
   */
  async getSystemRoles(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Check if user is system admin
      if (!req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: System administrator access required'
        });
      }
      
      const roles = await this.roleService.getSystemRoles();
      
      return res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Initialize system roles (admin only)
   * @route POST /api/roles/system/initialize
   */
  async initializeSystemRoles(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      // Check if user is system admin
      if (!req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: System administrator access required'
        });
      }
      
      await this.roleService.initializeSystemRoles();
      
      return res.status(200).json({
        success: true,
        message: 'System roles initialized successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}