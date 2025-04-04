/**
 * Membership Controller
 * Handles HTTP requests for user-organization membership management
 */
import { Request, Response, NextFunction } from 'express';
import { UserOrganizationService } from '../../../services/firestore/user-organization.service';
import { InvitationService } from '../../../services/firestore/invitation.service';
import { OrganizationService } from '../../../services/firestore/organization.service';
import { RoleService } from '../../../services/firestore/role.service';
import { UserService } from '../../../services/user.service';
import { MembershipType, MembershipStatus } from '../../../models/firestore';

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
 * Controller for user-organization membership management
 */
export class MembershipController {
  private userOrganizationService: UserOrganizationService;
  private invitationService: InvitationService;
  private organizationService: OrganizationService;
  private roleService: RoleService;
  private userService: UserService;
  
  constructor() {
    this.userOrganizationService = new UserOrganizationService();
    this.invitationService = new InvitationService();
    this.organizationService = new OrganizationService();
    this.roleService = new RoleService();
    this.userService = new UserService();
  }
  

  /**
   * getOrganizationUsers
   * Get all users in the current organization
   * @route GET /api/memberships/users
   */
  async getOrganizationUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      // Get all members in the organization
      const members = await this.userOrganizationService.getOrganizationMembers(organizationId);
      
      // Filter out sensitive information
      const safeMembers = members.map(member => ({
        userId: member.userId,
        organizationId: member.organizationId,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        type: member.type,
        status: member.status,
        roles: member.roles,
        dateJoined: member.dateJoined,
        lastActive: member.lastActive,
        isActive: member.status === MembershipStatus.ACTIVE
      }));
      
      res.status(200).json({
        success: true,
        users: safeMembers
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in getOrganizationUsers:`, error);
      next(error);
    }
  }

  /**
   * getUserMemberships
   * Get all memberships for the current user
   * @route GET /api/memberships/me
   */
  async getUserMemberships(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Get all user memberships
      const memberships = await this.userOrganizationService.getUserOrganizationMemberships(userId);
      
      // Fetch organization details for each membership
      const enrichedMemberships = await Promise.all(
        memberships.map(async (membership) => {
          const organization = await this.organizationService.getOrganizationById(
            membership.organizationId
          );
          
          return {
            ...membership,
            organization: organization ? {
              id: organization.id,
              name: organization.name,
              type: organization.type,
              status: organization.status,
              settings: organization.settings,
              isDefault: membership.isDefault
            } : null
          };
        })
      );
      
      res.status(200).json({
        success: true,
        memberships: enrichedMemberships
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in getUserMemberships:`, error);
      next(error);
    }
  }

  /**
   * getOrganizationInvitations
   * Get all invitations for the current organization
   * @route GET /api/memberships/organization-invitations
   */
  async getOrganizationInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if user has permission to view invitations (owner, admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:invite')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to view invitations'
        });
      }
      
      // Get all invitations for the organization (both pending and processed)
      const invitations = await this.invitationService.getAllOrganizationInvitations(organizationId);
      
      // Group invitations by status
      const result = {
        pending: invitations.filter(inv => inv.status === 'PENDING'),
        accepted: invitations.filter(inv => inv.status === 'ACCEPTED'),
        declined: invitations.filter(inv => inv.status === 'DECLINED'),
        expired: invitations.filter(inv => inv.status === 'EXPIRED'),
        revoked: invitations.filter(inv => inv.status === 'REVOKED')
      };
      
      res.status(200).json({
        success: true,
        invitations: result
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in getOrganizationInvitations:`, error);
      next(error);
    }
  }

  /**
   * cancelInvitation
   * Cancel a pending invitation
   * @route DELETE /api/memberships/invitation/:id
   */
  async cancelInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if invitation exists and belongs to this organization
      const invitation = await this.invitationService.getInvitationById(id);
      
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitation not found'
        });
      }
      
      // Verify the invitation belongs to this organization
      if (invitation.organizationId !== organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: This invitation does not belong to your organization'
        });
      }
      
      // Check if the invitation is still pending
      if (invitation.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel invitation with status ${invitation.status}`
        });
      }
      
      // Check permission to cancel invitations
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:invite') &&
        invitation.invitedBy !== req.user!.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to cancel this invitation'
        });
      }
      
      // Cancel the invitation
      await this.invitationService.updateInvitationStatus(
        id,
        'REVOKED',
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'Invitation cancelled successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in cancelInvitation:`, error);
      next(error);
    }
  }

  /**
   * resendInvitation
   * Resend an invitation email
   * @route POST /api/memberships/invitation/:id/resend
   */
  async resendInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if invitation exists and belongs to this organization
      const invitation = await this.invitationService.getInvitationById(id);
      
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitation not found'
        });
      }
      
      // Verify the invitation belongs to this organization
      if (invitation.organizationId !== organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: This invitation does not belong to your organization'
        });
      }
      
      // Check if the invitation is still pending
      if (invitation.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Cannot resend invitation with status ${invitation.status}`
        });
      }
      
      // Check permission to resend invitations
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:invite') &&
        invitation.invitedBy !== req.user!.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to resend this invitation'
        });
      }
      
      // Resend the invitation
      await this.invitationService.resendInvitation(
        id,
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'Invitation resent successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in resendInvitation:`, error);
      next(error);
    }
  }

  /**
   * getUserMembershipDetails
   * Get detailed membership information for a user
   * @route GET /api/memberships/users/:userId/details
   */
  async getUserMembershipDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate that we can view this user's membership
      if (
        userId !== req.user!.id && 
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to view this user\'s membership details'
        });
      }
      
      // Get membership details
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Get role information
      const roles = [];
      for (const roleId of membership.roles || []) {
        const role = await this.roleService.getRoleById(roleId);
        if (role) {
          roles.push(role);
        }
      }
      
      // Get effective permissions
      const effectivePermissions = await this.roleService.getUserEffectivePermissions(
        userId,
        organizationId
      );
      
      // Get user information
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Compile and return detailed membership information
      res.status(200).json({
        success: true,
        details: {
          membership: {
            userId: membership.userId,
            organizationId: membership.organizationId,
            email: membership.email,
            firstName: membership.firstName,
            lastName: membership.lastName,
            type: membership.type,
            status: membership.status,
            roles: membership.roles,
            permissions: membership.permissions,
            dateJoined: membership.dateJoined,
            lastActive: membership.lastActive,
            isDefault: membership.isDefault
          },
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          roles,
          effectivePermissions: Array.from(effectivePermissions),
          customPermissions: membership.permissions?.customPermissions || [],
          restrictedPermissions: membership.permissions?.restrictedPermissions || []
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in getUserMembershipDetails:`, error);
      next(error);
    }
  }

  /**
   * updateUserRoles
   * Update a user's roles in the organization
   * @route PUT /api/memberships/users/:userId/roles
   */
  async updateUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { roles } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate request body
      if (!roles || !Array.isArray(roles)) {
        return res.status(400).json({
          success: false,
          message: 'Roles must be provided as an array'
        });
      }
      
      // Check if user has permission to update roles
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:assign')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to update user roles'
        });
      }
      
      // Get current membership
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Cannot update user's roles if they are the owner
      if (membership.type === MembershipType.OWNER && !req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update roles for the organization owner'
        });
      }
      
      // Verify all roles exist and belong to this organization
      for (const roleId of roles) {
        const role = await this.roleService.getRoleById(roleId);
        
        if (!role) {
          return res.status(400).json({
            success: false,
            message: `Role with ID ${roleId} not found`
          });
        }
        
        // Check if role belongs to this organization or is a system role
        if (role.organizationId !== organizationId && role.scope !== 'SYSTEM') {
          return res.status(403).json({
            success: false,
            message: `Role with ID ${roleId} does not belong to this organization`
          });
        }
      }
      
      // Update roles
      const updatedMembership = await this.userOrganizationService.updateUserRoles(
        userId,
        organizationId,
        roles,
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'User roles updated successfully',
        membership: {
          userId: updatedMembership.userId,
          organizationId: updatedMembership.organizationId,
          roles: updatedMembership.roles,
          type: updatedMembership.type,
          status: updatedMembership.status
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in updateUserRoles:`, error);
      next(error);
    }
  }

  /**
   * updateUserCustomPermissions
   * Update a user's custom permissions
   * @route PUT /api/memberships/users/:userId/permissions
   */
  async updateUserCustomPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { permissions, action } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate request body
      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be provided as an array'
        });
      }
      
      if (!action || !['add', 'remove', 'set'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action must be one of: add, remove, set'
        });
      }
      
      // Check if user has permission to update permissions
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to update user permissions'
        });
      }
      
      // Get current membership
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Cannot update permissions if the user is the owner
      if (membership.type === MembershipType.OWNER && !req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update permissions for the organization owner'
        });
      }
      
      // Update permissions based on the specified action
      let updatedMembership;
      switch (action) {
        case 'add':
          // Add new permissions
          updatedMembership = await this.userOrganizationService.addCustomPermissions(
            userId,
            organizationId,
            permissions,
            req.user!.id,
            req.user!.email
          );
          break;
        case 'remove':
          // Remove specified permissions
          updatedMembership = await this.userOrganizationService.removeCustomPermissions(
            userId,
            organizationId,
            permissions,
            req.user!.id,
            req.user!.email
          );
          break;
        case 'set':
          // Replace all custom permissions
          updatedMembership = await this.userOrganizationService.setCustomPermissions(
            userId,
            organizationId,
            permissions,
            req.user!.id,
            req.user!.email
          );
          break;
      }
      
      // Get effective permissions after update
      const effectivePermissions = await this.roleService.getUserEffectivePermissions(
        userId,
        organizationId
      );
      
      res.status(200).json({
        success: true,
        message: 'User permissions updated successfully',
        membership: {
          userId: updatedMembership.userId,
          organizationId: updatedMembership.organizationId,
          customPermissions: updatedMembership.permissions?.customPermissions || [],
          restrictedPermissions: updatedMembership.permissions?.restrictedPermissions || [],
          effectivePermissions: Array.from(effectivePermissions)
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in updateUserCustomPermissions:`, error);
      next(error);
    }
  }

  /**
   * updateMembershipType
   * Change a user's membership type
   * @route PUT /api/memberships/users/:userId/type
   */
  async updateMembershipType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate membership type
      if (!type || !Object.values(MembershipType).includes(type as MembershipType)) {
        return res.status(400).json({
          success: false,
          message: 'Valid membership type is required'
        });
      }
      
      // Check if user has permission to change membership types
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only organization owners can change membership types'
        });
      }
      
      // Get current membership
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Cannot change membership type if user is already the owner
      if (membership.type === MembershipType.OWNER && type !== MembershipType.OWNER) {
        return res.status(400).json({
          success: false,
          message: 'To change the organization owner, use the transfer ownership functionality'
        });
      }
      
      // Cannot set someone else to owner
      if (type === MembershipType.OWNER && membership.type !== MembershipType.OWNER) {
        return res.status(400).json({
          success: false,
          message: 'To set a new organization owner, use the transfer ownership functionality'
        });
      }
      
      // Update membership type
      const updatedMembership = await this.userOrganizationService.changeUserMembershipType(
        userId,
        organizationId,
        type as MembershipType,
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'Membership type updated successfully',
        membership: {
          userId: updatedMembership.userId,
          organizationId: updatedMembership.organizationId,
          type: updatedMembership.type,
          status: updatedMembership.status,
          roles: updatedMembership.roles
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in updateMembershipType:`, error);
      next(error);
    }
  }

  /**
   * removeUserFromOrganization
   * Remove a user from the organization
   * @route DELETE /api/memberships/users/:userId/remove
   */
  async removeUserFromOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if user has permission to remove members
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:remove')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to remove users'
        });
      }
      
      // Cannot remove yourself with this method
      if (userId === req.user!.id) {
        return res.status(400).json({
          success: false,
          message: 'To leave an organization, use the leave organization endpoint'
        });
      }
      
      // Get current membership
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Cannot remove the organization owner
      if (membership.type === MembershipType.OWNER) {
        return res.status(403).json({
          success: false,
          message: 'Cannot remove the organization owner'
        });
      }
      
      // Remove user from organization
      await this.userOrganizationService.removeUserFromOrganization(
        userId,
        organizationId,
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'User removed from organization successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in removeUserFromOrganization:`, error);
      next(error);
    }
  }

  /**
   * leaveOrganization
   * Leave the current organization
   * @route POST /api/memberships/leave
   */
  async leaveOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const organizationId = req.user!.currentOrganizationId;
      
      // Get current membership
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        userId,
        organizationId
      );
      
      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      // Cannot leave if you are the owner
      if (membership.type === MembershipType.OWNER) {
        return res.status(403).json({
          success: false,
          message: 'Organization owners cannot leave. Transfer ownership first.'
        });
      }
      
      // Get user's organizations to find a new default if needed
      const userOrganizations = await this.userOrganizationService.getUserOrganizationMemberships(userId);
      const otherOrganizations = userOrganizations.filter(
        org => org.organizationId !== organizationId && org.status === MembershipStatus.ACTIVE
      );
      
      if (userOrganizations.length === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot leave your only organization. Create a new one first.'
        });
      }
      
      // Remove user from organization
      await this.userOrganizationService.removeUserFromOrganization(
        userId,
        organizationId,
        userId,
        req.user!.email
      );
      
      // If this was the default organization, set a new default
      if (membership.isDefault && otherOrganizations.length > 0) {
        await this.userOrganizationService.setDefaultOrganization(
          userId,
          otherOrganizations[0].organizationId,
          userId,
          req.user!.email
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'Successfully left the organization',
        nextOrganization: otherOrganizations.length > 0 ? otherOrganizations[0].organizationId : null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in leaveOrganization:`, error);
      next(error);
    }
  }
  /**
   * Invite a user to join an organization
   * @route POST /api/memberships/invite
   */
  async inviteUser(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { email, roles, type, message, expiresIn } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      // Validate membership type
      if (type && !Object.values(MembershipType).includes(type as MembershipType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid membership type'
        });
      }
      
      // Check if user has permission to invite (owner, admin, or has explicit permission)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:invite')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to invite users'
        });
      }
      
      // Create invitation
      const invitation = await this.invitationService.createInvitation(
        email,
        organizationId,
        roles,
        type || MembershipType.MEMBER,
        message,
        expiresIn,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        invitation
      });
    } catch (error: any) {
      console.error('Error inviting user:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already pending')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already a member')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Invite a client to create a new organization (agency feature)
   * @route POST /api/memberships/invite-client
   */
  async inviteClient(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { email, organizationName, message, expiresIn } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!email || !organizationName) {
        return res.status(400).json({
          success: false,
          message: 'Email and organization name are required'
        });
      }
      
      // Check if user has permission to invite clients (owner, admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('organization:create')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to invite clients'
        });
      }
      
      // Create agency invitation
      const invitation = await this.invitationService.createAgencyInvitation(
        email,
        organizationId,
        organizationName,
        message,
        expiresIn,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(201).json({
        success: true,
        message: 'Client invitation sent successfully',
        invitation
      });
    } catch (error: any) {
      console.error('Error inviting client:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('not an agency')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already pending')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Get pending invitations for the current organization
   * @route GET /api/memberships/invitations
   */
  async getPendingInvitations(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      const invitations = await this.invitationService.getPendingOrganizationInvitations(
        organizationId
      );
      
      return res.status(200).json({
        success: true,
        invitations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get agency invitations
   * @route GET /api/memberships/agency-invitations
   */
  async getAgencyInvitations(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      const invitations = await this.invitationService.getPendingAgencyInvitations(
        organizationId
      );
      
      return res.status(200).json({
        success: true,
        invitations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Revoke an invitation
   * @route DELETE /api/memberships/invitations/:id
   */
  async revokeInvitation(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      await this.invitationService.revokeInvitation(
        id,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Invitation revoked successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get pending invitations for the current user
   * @route GET /api/memberships/my-invitations
   */
  async getUserInvitations(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const invitations = await this.invitationService.getPendingInvitationsForEmail(
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        invitations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Accept an invitation
   * @route POST /api/memberships/accept-invitation
   */
  async acceptInvitation(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Invitation token is required'
        });
      }
      
      await this.invitationService.acceptInvitation(
        token,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully'
      });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      
      if (
        (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('expired') || 
        (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already been') ||
        (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('does not match')
      ) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Decline an invitation
   * @route POST /api/memberships/decline-invitation
   */
  async declineInvitation(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Invitation token is required'
        });
      }
      
      await this.invitationService.declineInvitation(
        token,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Invitation declined successfully'
      });
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      
      if (
        (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('expired') || 
        (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('already been')
      ) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Remove a user from the current organization
   * @route DELETE /api/memberships/users/:userId
   */
  async removeUser(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if user has permission to remove members (owner, admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:remove')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to remove users'
        });
      }
      
      // Cannot remove yourself
      if (userId === req.user!.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot remove yourself from the organization'
        });
      }
      
      await this.userOrganizationService.removeUserFromOrganization(
        userId,
        organizationId,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'User removed from organization successfully'
      });
    } catch (error: any) {
      console.error('Error removing user:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('organization owner')) {
        return res.status(403).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Change user's membership type
   * @route PATCH /api/memberships/users/:userId/type
   */
  async changeMembershipType(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Membership type is required'
        });
      }
      
      // Validate membership type
      if (!Object.values(MembershipType).includes(type as MembershipType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid membership type'
        });
      }
      
      // Check if user has permission to change member types (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('user:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to change membership types'
        });
      }
      
      const userOrg = await this.userOrganizationService.changeUserMembershipType(
        userId,
        organizationId,
        type as MembershipType,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Membership type changed successfully',
        userOrganization: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Add a custom permission to a user
   * @route POST /api/memberships/users/:userId/permissions
   */
  async addCustomPermission(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId } = req.params;
      const { permission } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!permission) {
        return res.status(400).json({
          success: false,
          message: 'Permission is required'
        });
      }
      
      // Check if user has permission to manage permissions (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to manage user permissions'
        });
      }
      
      const userOrg = await this.userOrganizationService.addCustomPermission(
        userId,
        organizationId,
        permission,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Custom permission added successfully',
        userOrganization: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove a custom permission from a user
   * @route DELETE /api/memberships/users/:userId/permissions/:permission
   */
  async removeCustomPermission(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId, permission } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if user has permission to manage permissions (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to manage user permissions'
        });
      }
      
      const userOrg = await this.userOrganizationService.removeCustomPermission(
        userId,
        organizationId,
        permission,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Custom permission removed successfully',
        userOrganization: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Add a permission restriction to a user
   * @route POST /api/memberships/users/:userId/restrictions
   */
  async addPermissionRestriction(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId } = req.params;
      const { permission } = req.body;
      const organizationId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!permission) {
        return res.status(400).json({
          success: false,
          message: 'Permission is required'
        });
      }
      
      // Check if user has permission to manage permissions (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to manage user permissions'
        });
      }
      
      const userOrg = await this.userOrganizationService.addRestrictedPermission(
        userId,
        organizationId,
        permission,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Permission restriction added successfully',
        userOrganization: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Remove a permission restriction from a user
   * @route DELETE /api/memberships/users/:userId/restrictions/:permission
   */
  async removePermissionRestriction(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId, permission } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Check if user has permission to manage permissions (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        req.user!.membershipType !== MembershipType.OWNER && 
        !req.user!.permissions.has('role:manage')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have permission to manage user permissions'
        });
      }
      
      const userOrg = await this.userOrganizationService.removeRestrictedPermission(
        userId,
        organizationId,
        permission,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Permission restriction removed successfully',
        userOrganization: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get user membership details
   * @route GET /api/memberships/users/:userId
   */
  async getUserMembership(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { userId } = req.params;
      const organizationId = req.user!.currentOrganizationId;
      
      // Get user-organization relationship
      const userOrgsSnapshot = await this.userOrganizationService.getUserOrganizationMemberships(
        userId
      );
      
      const userOrg = userOrgsSnapshot.find(org => org.organizationId === organizationId);
      
      if (!userOrg) {
        return res.status(404).json({
          success: false,
          message: 'User membership not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        membership: userOrg
      });
    } catch (error) {
      next(error);
    }
  }
}