/**
 * Organization Service Implementation
 * Provides business logic for organization operations with TypeScript support
 */
import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '@/config/container';
import { ID, IPaginatedResult, IPaginationParams } from '@/types/base.types';
import { BadRequestError, ConflictError, NotFoundError } from '@/types/error.types';
import { 
  IOrganization, 
  IOrganizationService, 
  IOrganizationBasicData,
  OrganizationCreateData,
  OrganizationUpdateData,
  IOrganizationIntegration,
  IOrganizationInvitation,
  IOrganizationMember,
  OrganizationStatus
} from '../interfaces/organization.interface';
import { IOrganizationRepository } from '../repositories/organization.repository';
import { IUserRepository } from '../repositories/user.repository';
import { logger } from '@/utils/logger';

/**
 * Organization service implementation
 */
@injectable()
export class OrganizationService implements IOrganizationService {
  /**
   * Constructor
   * @param organizationRepository - Organization repository
   * @param userRepository - User repository
   */
  constructor(
    @inject(TYPES.OrganizationRepository) private organizationRepository: IOrganizationRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  /**
   * Creates a new organization
   * @param data - Organization creation data
   * @returns Created organization
   */
  public async createOrganization(data: OrganizationCreateData): Promise<IOrganization> {
    try {
      // Check if an organization with this slug already exists
      const slugifiedName = this.slugify(data.name);
      const organizationSlug = data.slug || slugifiedName;

      const existingOrg = await this.organizationRepository.findBySlug(organizationSlug);
      if (existingOrg) {
        throw new ConflictError(`Organization with slug ${organizationSlug} already exists`);
      }

      // Create the organization
      const organization = await this.organizationRepository.create({
        ...data,
        slug: organizationSlug,
      });

      return organization;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.error('Error creating organization:', error);
      throw new BadRequestError('Failed to create organization');
    }
  }

  /**
   * Gets an organization by ID
   * @param id - Organization ID
   * @returns Organization or null
   */
  public async getOrganizationById(id: ID): Promise<IOrganization | null> {
    return this.organizationRepository.findById(id);
  }

  /**
   * Gets an organization by slug
   * @param slug - Organization slug
   * @returns Organization or null
   */
  public async getOrganizationBySlug(slug: string): Promise<IOrganization | null> {
    return this.organizationRepository.findBySlug(slug);
  }

  /**
   * Updates an organization
   * @param id - Organization ID
   * @param data - Organization update data
   * @returns Updated organization
   */
  public async updateOrganization(id: ID, data: OrganizationUpdateData): Promise<IOrganization> {
    try {
      // If slug is updated, check if it's already taken
      if (data.slug) {
        const existingOrg = await this.organizationRepository.findBySlug(data.slug);
        if (existingOrg && existingOrg.id.toString() !== id.toString()) {
          throw new ConflictError(`Organization with slug ${data.slug} already exists`);
        }
      }

      // Update the organization
      return this.organizationRepository.update(id, data);
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error updating organization:', error);
      throw new BadRequestError('Failed to update organization');
    }
  }

  /**
   * Deletes an organization
   * @param id - Organization ID
   * @returns Whether organization was deleted
   */
  public async deleteOrganization(id: ID): Promise<boolean> {
    return this.organizationRepository.delete(id);
  }

  /**
   * Gets organizations by user
   * @param userId - User ID
   * @returns Array of organizations
   */
  public async getUserOrganizations(userId: ID): Promise<IOrganizationBasicData[]> {
    try {
      // First, get the user to find their organizations
      const user = await this.userRepository.findByIdOrFail(userId);
      
      if (!user.organizations || user.organizations.length === 0) {
        return [];
      }
      
      // Get organization IDs from user
      const organizationIds = user.organizations.map(org => org.organizationId);
      
      // Fetch organizations
      const organizations: IOrganizationBasicData[] = [];
      
      for (const orgId of organizationIds) {
        const org = await this.organizationRepository.findById(orgId);
        if (org) {
          organizations.push({
            id: org.id,
            name: org.name,
            slug: org.slug,
            description: org.description,
            logoUrl: org.settings?.logoUrl,
            type: org.type,
          });
        }
      }
      
      return organizations;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return [];
      }
      
      logger.error('Error getting user organizations:', error);
      throw new BadRequestError('Failed to get user organizations');
    }
  }

  /**
   * Invites a user to an organization
   * @param organizationId - Organization ID
   * @param email - User email
   * @param role - User role
   * @param invitedBy - User ID who sent the invitation
   * @returns Created invitation
   */
  public async inviteUserToOrganization(
    organizationId: ID,
    email: string,
    role: string,
    invitedBy: ID
  ): Promise<IOrganizationInvitation> {
    try {
      // Check if organization exists
      const organization = await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Create expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Create invitation
      const invitation: IOrganizationInvitation = {
        id: crypto.randomBytes(16).toString('hex') as ID,
        organizationId,
        email: email.toLowerCase(),
        role,
        token,
        invitedBy,
        expiresAt,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // In a real application, you would store this invitation in a database
      // and send an email to the user with the invitation link
      
      logger.info(`Invitation for ${email} to join ${organization.name}: ${token}`);
      
      return invitation;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error inviting user to organization:', error);
      throw new BadRequestError('Failed to invite user to organization');
    }
  }

  /**
   * Accepts an invitation
   * @param token - Invitation token
   * @param userId - User ID
   * @returns Created organization member
   */
  public async acceptInvitation(token: string, userId: ID): Promise<IOrganizationMember> {
    try {
      // In a real application, you would validate the token against stored invitations
      // For now, we simulate finding the invitation
      const invitation: IOrganizationInvitation = {
        id: crypto.randomBytes(16).toString('hex') as ID,
        organizationId: crypto.randomBytes(16).toString('hex') as ID,
        email: 'user@example.com',
        role: 'user',
        token,
        invitedBy: crypto.randomBytes(16).toString('hex') as ID,
        expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
        throw new BadRequestError('Invalid or expired invitation');
      }
      
      // Find the user
      const user = await this.userRepository.findByIdOrFail(userId);
      
      // Add user to organization
      await this.userRepository.addOrganization(userId, {
        organizationId: invitation.organizationId,
        role: invitation.role as any,
        joinedAt: new Date(),
        isDefault: false,
      });
      
      // Create the member record
      const member: IOrganizationMember = {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
        joinedAt: new Date(),
        invitedBy: invitation.invitedBy,
        status: 'active',
      };
      
      // In a real application, you would update the invitation status to 'accepted'
      
      return member;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      logger.error('Error accepting invitation:', error);
      throw new BadRequestError('Failed to accept invitation');
    }
  }

  /**
   * Declines an invitation
   * @param token - Invitation token
   * @returns Whether invitation was declined
   */
  public async declineInvitation(token: string): Promise<boolean> {
    try {
      // In a real application, you would update the invitation status to 'declined'
      return true;
    } catch (error) {
      logger.error('Error declining invitation:', error);
      throw new BadRequestError('Failed to decline invitation');
    }
  }

  /**
   * Removes a user from an organization
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @returns Whether user was removed
   */
  public async removeUserFromOrganization(organizationId: ID, userId: ID): Promise<boolean> {
    try {
      // Check if organization exists
      await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Check if user exists
      const user = await this.userRepository.findByIdOrFail(userId);
      
      // Check if user is in the organization
      const orgIndex = user.organizations?.findIndex(org => 
        org.organizationId.toString() === organizationId.toString()
      );
      
      if (orgIndex === undefined || orgIndex === -1) {
        throw new BadRequestError('User is not a member of this organization');
      }
      
      // Remove user from organization
      await this.userRepository.removeOrganization(userId, organizationId);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      logger.error('Error removing user from organization:', error);
      throw new BadRequestError('Failed to remove user from organization');
    }
  }

  /**
   * Updates a user's role in an organization
   * @param organizationId - Organization ID
   * @param userId - User ID
   * @param role - New role
   * @returns Updated organization member
   */
  public async updateUserRole(
    organizationId: ID,
    userId: ID,
    role: string
  ): Promise<IOrganizationMember> {
    try {
      // Check if organization exists
      await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Check if user exists
      const user = await this.userRepository.findByIdOrFail(userId);
      
      // Check if user is in the organization
      const orgIndex = user.organizations?.findIndex(org => 
        org.organizationId.toString() === organizationId.toString()
      );
      
      if (orgIndex === undefined || orgIndex === -1) {
        throw new BadRequestError('User is not a member of this organization');
      }
      
      // Update user's role in organization
      if (user.organizations) {
        const updatedOrgs = [...user.organizations];
        updatedOrgs[orgIndex].role = role as any;
        
        await this.userRepository.update(userId, { organizations: updatedOrgs });
      }
      
      // Return the updated member
      return {
        userId,
        organizationId,
        role,
        joinedAt: user.organizations?.[orgIndex].joinedAt || new Date(),
        status: 'active',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      logger.error('Error updating user role:', error);
      throw new BadRequestError('Failed to update user role');
    }
  }

  /**
   * Adds an integration to an organization
   * @param organizationId - Organization ID
   * @param integration - Integration data
   * @returns Updated organization
   */
  public async addIntegration(
    organizationId: ID,
    integration: Omit<IOrganizationIntegration, 'id'>
  ): Promise<IOrganizationIntegration> {
    try {
      // Check if organization exists
      await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Add integration to organization
      const updatedOrg = await this.organizationRepository.addIntegration(
        organizationId,
        integration
      );
      
      // Return the added integration
      const addedIntegration = updatedOrg.integrations?.find(i => 
        i.type === integration.type && i.name === integration.name
      );
      
      if (!addedIntegration) {
        throw new BadRequestError('Failed to add integration');
      }
      
      return addedIntegration;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error adding integration:', error);
      throw new BadRequestError('Failed to add integration');
    }
  }

  /**
   * Updates an integration
   * @param organizationId - Organization ID
   * @param integrationId - Integration ID
   * @param data - Update data
   * @returns Updated integration
   */
  public async updateIntegration(
    organizationId: ID,
    integrationId: ID,
    data: Partial<IOrganizationIntegration>
  ): Promise<IOrganizationIntegration> {
    try {
      // Check if organization exists
      const org = await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Check if integration exists
      const integrationIndex = org.integrations?.findIndex(i => 
        i.id.toString() === integrationId.toString()
      );
      
      if (integrationIndex === undefined || integrationIndex === -1) {
        throw new NotFoundError(`Integration not found with id: ${integrationId}`);
      }
      
      // Update integration
      const updatedOrg = await this.organizationRepository.updateIntegration(
        organizationId,
        integrationId,
        data
      );
      
      // Return the updated integration
      const updatedIntegration = updatedOrg.integrations?.find(i => 
        i.id.toString() === integrationId.toString()
      );
      
      if (!updatedIntegration) {
        throw new BadRequestError('Failed to update integration');
      }
      
      return updatedIntegration;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error updating integration:', error);
      throw new BadRequestError('Failed to update integration');
    }
  }

  /**
   * Removes an integration
   * @param organizationId - Organization ID
   * @param integrationId - Integration ID
   * @returns Whether integration was removed
   */
  public async removeIntegration(organizationId: ID, integrationId: ID): Promise<boolean> {
    try {
      // Check if organization exists
      const org = await this.organizationRepository.findByIdOrFail(organizationId);
      
      // Check if integration exists
      const integrationIndex = org.integrations?.findIndex(i => 
        i.id.toString() === integrationId.toString()
      );
      
      if (integrationIndex === undefined || integrationIndex === -1) {
        throw new NotFoundError(`Integration not found with id: ${integrationId}`);
      }
      
      // Remove integration
      await this.organizationRepository.removeIntegration(organizationId, integrationId);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error('Error removing integration:', error);
      throw new BadRequestError('Failed to remove integration');
    }
  }

  /**
   * Updates an organization's status
   * @param id - Organization ID
   * @param status - New status
   * @returns Updated organization
   */
  public async updateOrganizationStatus(id: ID, status: OrganizationStatus): Promise<IOrganization> {
    return this.organizationRepository.updateStatus(id, status);
  }

  /**
   * Searches organizations
   * @param query - Search query
   * @param options - Pagination options
   * @returns Paginated organizations
   */
  public async searchOrganizations(
    query: string, 
    options?: IPaginationParams
  ): Promise<IPaginatedResult<IOrganization>> {
    return this.organizationRepository.searchOrganizations(query, options);
  }

  /**
   * Slugifies a string
   * @param name - String to slugify
   * @returns Slugified string
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}