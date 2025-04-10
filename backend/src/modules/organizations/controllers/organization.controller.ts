/**
 * Organization Controller
 * Handles HTTP requests for organization management
 */
import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../../../services/firestore/organization.service';
import { UserOrganizationService } from '../../../services/firestore/user-organization.service';
import { RoleService } from '../../../services/firestore/role.service';
import { OrganizationType } from '../../../models/firestore';

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
 * Controller for organization management
 */
export class OrganizationController {
  private organizationService: OrganizationService;
  private userOrganizationService: UserOrganizationService;
  private roleService: RoleService;
  
  constructor() {
    this.organizationService = new OrganizationService();
    this.userOrganizationService = new UserOrganizationService();
    this.roleService = new RoleService();
  }
  

  /**
   * getOrganizationHierarchy
   * Get the hierarchy of organizations for the current organization
   * @route GET /api/organizations/hierarchy
   */
  async getOrganizationHierarchy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      // Get the current organization
      const organization = await this.organizationService.getOrganizationById(organizationId);
      
      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
        return;
      }
      
      // Initialize the hierarchy data structure
      const hierarchy: any = {
        current: organization,
        parent: null,
        root: null,
        children: [],
        siblings: []
      };
      
      // Get parent organization if exists
      if (organization.parentId) {
        const parent = await this.organizationService.getOrganizationById(organization.parentId);
        if (parent) {
          hierarchy.parent = parent;
        }
      }
      
      // Get root organization if different from parent and current
      if (organization.rootId && organization.rootId !== organization.parentId && organization.rootId !== organization.id) {
        const root = await this.organizationService.getOrganizationById(organization.rootId);
        if (root) {
          hierarchy.root = root;
        }
      }
      
      // Get child organizations
      hierarchy.children = await this.organizationService.getChildOrganizations(organizationId);
      
      // Get sibling organizations (organizations with the same parent)
      if (organization.parentId) {
        const allSiblings = await this.organizationService.getChildOrganizations(organization.parentId);
        hierarchy.siblings = allSiblings.filter(org => org.id !== organizationId);
      }
      
      res.status(200).json({
        success: true,
        hierarchy
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createClientOrganization
   * Create a new client organization (Agency only)
   * @route POST /api/organizations/client
   */
  async createClientOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, clientOwnerId, clientOwnerEmail, type } = req.body;
      const parentOrgId = req.user!.currentOrganizationId;
      
      // Validate required fields
      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Organization name is required'
        });
        return;
      }
      
      // Get the current organization to check if it's an agency
      const organization = await this.organizationService.getOrganizationById(parentOrgId);
      
      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Parent organization not found'
        });
        return;
      }
      
      // Check if the organization is an agency
      if (organization.type !== OrganizationType.AGENCY) {
        res.status(403).json({
          success: false,
          message: 'Only agency organizations can create client organizations'
        });
        return;
      }
      
      // Create client organization with parent as the agency
      const clientOrg = await this.organizationService.createOrganization(
        name,
        clientOwnerId || req.user!.id, // If no client owner specified, use current user
        clientOwnerEmail || req.user!.email,
        type || OrganizationType.BASIC,
        parentOrgId
      );
      
      // Create default roles for the client organization
      await this.organizationService.createDefaultRoles(clientOrg.id);
      
      // Update agency metadata to include this client
      if (!organization.agency) {
        organization.agency = {
          isAgency: true,
          clientIds: [clientOrg.id]
        };
      } else {
        organization.agency.clientIds = organization.agency.clientIds || [];
        organization.agency.clientIds.push(clientOrg.id);
      }
      
      await this.organizationService.updateOrganization(
        parentOrgId,
        { agency: organization.agency },
        req.user!.id,
        req.user!.email
      );
      
      res.status(201).json({
        success: true,
        message: 'Client organization created successfully',
        organization: clientOrg
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCurrentOrganization
   * Get details of the current organization
   * @route GET /api/organizations/current
   */
  async getCurrentOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.user!.currentOrganizationId;
      
      const organization = await this.organizationService.getOrganizationById(organizationId);
      
      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
        return;
      }
      
      // Get membership details for the current user in this organization
      const membership = await this.userOrganizationService.getUserOrganizationMembership(
        req.user!.id,
        organizationId
      );
      
      // Get roles assigned to the user
      const roles = [];
      if (membership?.roles) {
        for (const roleId of membership.roles) {
          const role = await this.roleService.getRoleById(roleId);
          if (role) {
            roles.push(role);
          }
        }
      }
      
      res.status(200).json({
        success: true,
        organization,
        membership,
        roles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateOrganizationType
   * Update the type of an organization (Admin only)
   * @route PUT /api/organizations/:id/type
   */
  async updateOrganizationType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { type } = req.body;
      
      // Validate required fields
      if (!type) {
        res.status(400).json({
          success: false,
          message: 'Organization type is required'
        });
        return;
      }
      
      // Check if the type is valid
      if (!Object.values(OrganizationType).includes(type as OrganizationType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid organization type'
        });
        return;
      }
      
      // Verify user is a system admin
      if (!req.user!.isSystemAdmin) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: Only system administrators can change organization types'
        });
        return;
      }
      
      // Update organization type
      const organization = await this.organizationService.updateOrganization(
        id,
        { 
          type,
          settings: {
            allowSuborganizations: 
              type === OrganizationType.ENTERPRISE || 
              type === OrganizationType.AGENCY,
            maxUsers: this.organizationService.getMaxUsersByType(type as OrganizationType),
            maxSuborganizations: this.organizationService.getMaxSubOrgsByType(type as OrganizationType)
          }
        },
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'Organization type updated successfully',
        organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * transferOwnership
   * Transfer ownership of an organization to another user
   * @route POST /api/organizations/:id/transfer-ownership
   */
  async transferOwnership(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newOwnerId } = req.body;
      
      // Validate required fields
      if (!newOwnerId) {
        res.status(400).json({
          success: false,
          message: 'New owner ID is required'
        });
        return;
      }
      
      // Verify user has permission to transfer ownership
      // Must be current owner or system admin
      const organization = await this.organizationService.getOrganizationById(id);
      
      if (!organization) {
        res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
        return;
      }
      
      if (!req.user!.isSystemAdmin && organization.ownerId !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: Only the current owner or system admin can transfer ownership'
        });
        return;
      }
      
      // Transfer ownership
      const updatedOrg = await this.organizationService.changeOrganizationOwner(
        id,
        newOwnerId,
        req.user!.id,
        req.user!.email
      );
      
      res.status(200).json({
        success: true,
        message: 'Organization ownership transferred successfully',
        organization: updatedOrg
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create a new organization
   * @route POST /api/organizations
   */
  async createOrganization(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { name, type, parentId } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Organization name is required'
        });
      }
      
      // Validate organization type
      if (type && !Object.values(OrganizationType).includes(type as OrganizationType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organization type'
        });
      }
      
      // Create organization
      const organization = await this.organizationService.createOrganization(
        name,
        req.user!.id,
        req.user!.email,
        type || OrganizationType.BASIC,
        parentId
      );
      
      // Create default roles for the organization
      await this.organizationService.createDefaultRoles(organization.id);
      
      return res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        organization
      });
    } catch (error: any) {
      console.error('Error creating organization:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('does not allow suborganizations')) {
        return res.status(403).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Get organizations for the current user
   * @route GET /api/organizations
   */
  async getUserOrganizations(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const organizations = await this.organizationService.getUserOrganizations(req.user!.id);
      
      return res.status(200).json({
        success: true,
        organizations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get organization by ID
   * @route GET /api/organizations/:id
   */
  async getOrganizationById(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user belongs to the organization
      if (id !== req.user!.currentOrganizationId && !req.user!.organizations.includes(id) && !req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this organization'
        });
      }
      
      const organization = await this.organizationService.getOrganizationById(id);
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        organization
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update organization
   * @route PATCH /api/organizations/:id
   */
  async updateOrganization(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Verify user has permission to update (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        !(req.user!.currentOrganizationId === id && req.user!.membershipType === 'owner')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only organization owners can update organization details'
        });
      }
      
      // Prevent changing certain fields
      const { ownerId, parentId, rootId, path, createdAt, updatedAt, ...safeUpdateData } = updateData;
      
      const organization = await this.organizationService.updateOrganization(
        id,
        safeUpdateData,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Organization updated successfully',
        organization
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get child organizations
   * @route GET /api/organizations/:id/children
   */
  async getChildOrganizations(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user belongs to the organization or is system admin
      if (id !== req.user!.currentOrganizationId && !req.user!.organizations.includes(id) && !req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this organization'
        });
      }
      
      const organizations = await this.organizationService.getChildOrganizations(id);
      
      return res.status(200).json({
        success: true,
        organizations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete organization
   * @route DELETE /api/organizations/:id
   */
  async deleteOrganization(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Verify user has permission to delete (owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        !(req.user!.currentOrganizationId === id && req.user!.membershipType === 'owner')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only organization owners can delete organizations'
        });
      }
      
      await this.organizationService.deleteOrganization(
        id,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Organization deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      
      if ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)).includes('child organizations')) {
        return res.status(400).json({
          success: false,
          message: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error))
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Change organization owner
   * @route PUT /api/organizations/:id/owner
   */
  async changeOrganizationOwner(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      const { newOwnerId } = req.body;
      
      // Validate required fields
      if (!newOwnerId) {
        return res.status(400).json({
          success: false,
          message: 'New owner ID is required'
        });
      }
      
      // Verify user has permission to change owner (current owner or admin)
      if (
        !req.user!.isSystemAdmin && 
        !(req.user!.currentOrganizationId === id && req.user!.membershipType === 'owner')
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only the current owner can transfer ownership'
        });
      }
      
      const organization = await this.organizationService.changeOrganizationOwner(
        id,
        newOwnerId,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Organization ownership transferred successfully',
        organization
      });
    } catch (error: any) {
      console.error('Error changing organization owner:', error);
      
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
   * Get organization members
   * @route GET /api/organizations/:id/members
   */
  async getOrganizationMembers(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user belongs to the organization or is system admin
      if (id !== req.user!.currentOrganizationId && !req.user!.organizations.includes(id) && !req.user!.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this organization'
        });
      }
      
      const members = await this.userOrganizationService.getOrganizationMembers(id);
      
      return res.status(200).json({
        success: true,
        members
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Set current organization
   * @route PUT /api/organizations/current/:id
   */
  async setCurrentOrganization(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user belongs to the organization
      if (!req.user!.organizations.includes(id)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You do not have access to this organization'
        });
      }
      
      // Update user's active organization
      await this.userOrganizationService.setDefaultOrganization(
        req.user!.id,
        id,
        req.user!.id,
        req.user!.email
      );
      
      return res.status(200).json({
        success: true,
        message: 'Current organization updated successfully',
        organizationId: id
      });
    } catch (error) {
      next(error);
    }
  }
}