/**
 * Organization Controller Implementation
 * Handles organization-related HTTP requests with TypeScript support
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/container';
import { BaseController } from './base.controller';
import { IApiResponse, ID, IPaginationParams } from '@/types/base.types';
import { 
  HttpStatus, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from '@/types/error.types';
import { 
  IOrganization, 
  IOrganizationService,
  OrganizationCreateData,
  OrganizationUpdateData,
  IOrganizationBasicData,
  IOrganizationInvitation,
  IOrganizationMember,
  IOrganizationIntegration
} from '@/domain/interfaces/organization.interface';
import { logger } from '@/utils/logger';

/**
 * Organization controller interface
 */
export interface IOrganizationController {
  // Base methods
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  
  // Organization-specific methods
  getUserOrganizations(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
  inviteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void>;
  declineInvitation(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void>;
  addIntegration(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateIntegration(req: Request, res: Response, next: NextFunction): Promise<void>;
  removeIntegration(req: Request, res: Response, next: NextFunction): Promise<void>;
  searchOrganizations(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Organization controller implementation
 */
@injectable()
export class OrganizationController extends BaseController<IOrganization> implements IOrganizationController {
  /**
   * Constructor
   * @param organizationService - Organization service
   */
  constructor(
    @inject(TYPES.OrganizationService) private organizationService: IOrganizationService
  ) {
    super();
  }

  /**
   * Gets all organizations
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getAll(
    req: Request, 
    res: Response<IApiResponse<IOrganization[]>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      // This would typically include pagination and filtering
      // For simplicity, we're returning an empty array
      this.sendSuccess(res, []);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets an organization by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getById(
    req: Request, 
    res: Response<IApiResponse<IOrganization>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      const organization = await this.organizationService.getOrganizationById(id);
      
      if (!organization) {
        throw new NotFoundError(`Organization not found with id: ${id}`);
      }
      
      this.sendSuccess(res, organization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async create(
    req: Request, 
    res: Response<IApiResponse<IOrganization>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationData = req.body as OrganizationCreateData;
      
      // Set owner ID from authenticated user
      const authUser = this.getAuthUser(req);
      organizationData.ownerId = authUser.id;
      
      const createdOrganization = await this.organizationService.createOrganization(organizationData);
      
      this.sendSuccess(res, createdOrganization, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async update(
    req: Request, 
    res: Response<IApiResponse<IOrganization>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      const organizationData = req.body as OrganizationUpdateData;
      
      // Ensure user is owner or admin
      const authUser = this.getAuthUser(req);
      const organization = await this.organizationService.getOrganizationById(id);
      
      if (!organization) {
        throw new NotFoundError(`Organization not found with id: ${id}`);
      }
      
      if (organization.ownerId.toString() !== authUser.id.toString() && authUser.role !== 'admin') {
        throw new UnauthorizedError('You do not have permission to update this organization');
      }
      
      const updatedOrganization = await this.organizationService.updateOrganization(id, organizationData);
      
      this.sendSuccess(res, updatedOrganization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes an organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async delete(
    req: Request, 
    res: Response<IApiResponse<null>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getIdParam(req);
      
      // Ensure user is owner or admin
      const authUser = this.getAuthUser(req);
      const organization = await this.organizationService.getOrganizationById(id);
      
      if (!organization) {
        throw new NotFoundError(`Organization not found with id: ${id}`);
      }
      
      if (organization.ownerId.toString() !== authUser.id.toString() && authUser.role !== 'admin') {
        throw new UnauthorizedError('You do not have permission to delete this organization');
      }
      
      const result = await this.organizationService.deleteOrganization(id);
      
      if (!result) {
        throw new NotFoundError(`Organization not found with id: ${id}`);
      }
      
      this.sendSuccess(res, null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets organizations for the current user
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getUserOrganizations(
    req: Request, 
    res: Response<IApiResponse<IOrganizationBasicData[]>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const authUser = this.getAuthUser(req);
      const organizations = await this.organizationService.getUserOrganizations(authUser.id);
      
      this.sendSuccess(res, organizations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets an organization by slug
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getBySlug(
    req: Request, 
    res: Response<IApiResponse<IOrganization>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        throw new ValidationError('Slug parameter is required');
      }
      
      const organization = await this.organizationService.getOrganizationBySlug(slug);
      
      if (!organization) {
        throw new NotFoundError(`Organization not found with slug: ${slug}`);
      }
      
      this.sendSuccess(res, organization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Invites a user to the organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async inviteUser(
    req: Request, 
    res: Response<IApiResponse<IOrganizationInvitation>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const { email, role } = req.body;
      
      if (!email || !role) {
        throw new ValidationError('Email and role are required');
      }
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to invite users to the organization');
      }
      
      const invitation = await this.organizationService.inviteUserToOrganization(
        organizationId,
        email,
        role,
        authUser.id
      );
      
      this.sendSuccess(res, invitation, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accepts an invitation
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async acceptInvitation(
    req: Request, 
    res: Response<IApiResponse<IOrganizationMember>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ValidationError('Token is required');
      }
      
      const authUser = this.getAuthUser(req);
      const member = await this.organizationService.acceptInvitation(token, authUser.id);
      
      this.sendSuccess(res, member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Declines an invitation
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async declineInvitation(
    req: Request, 
    res: Response<IApiResponse<{ success: boolean }>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ValidationError('Token is required');
      }
      
      const result = await this.organizationService.declineInvitation(token);
      
      this.sendSuccess(res, { success: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes a user from the organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async removeUser(
    req: Request, 
    res: Response<IApiResponse<{ success: boolean }>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const userId = this.getIdParam(req);
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to remove users from the organization');
      }
      
      const result = await this.organizationService.removeUserFromOrganization(organizationId, userId);
      
      this.sendSuccess(res, { success: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates a user's role in the organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async updateUserRole(
    req: Request, 
    res: Response<IApiResponse<IOrganizationMember>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        throw new ValidationError('User ID and role are required');
      }
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to update user roles in the organization');
      }
      
      const member = await this.organizationService.updateUserRole(
        organizationId,
        userId as ID,
        role
      );
      
      this.sendSuccess(res, member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds an integration to the organization
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async addIntegration(
    req: Request, 
    res: Response<IApiResponse<IOrganizationIntegration>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const integration = req.body as Omit<IOrganizationIntegration, 'id'>;
      
      if (!integration.type || !integration.name) {
        throw new ValidationError('Integration type and name are required');
      }
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to add integrations to the organization');
      }
      
      const addedIntegration = await this.organizationService.addIntegration(
        organizationId,
        integration
      );
      
      this.sendSuccess(res, addedIntegration, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an integration
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async updateIntegration(
    req: Request, 
    res: Response<IApiResponse<IOrganizationIntegration>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const integrationId = this.getIdParam(req);
      const data = req.body as Partial<IOrganizationIntegration>;
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to update integrations in the organization');
      }
      
      const updatedIntegration = await this.organizationService.updateIntegration(
        organizationId,
        integrationId,
        data
      );
      
      this.sendSuccess(res, updatedIntegration);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes an integration
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async removeIntegration(
    req: Request, 
    res: Response<IApiResponse<{ success: boolean }>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const organizationId = this.getOrganizationId(req);
      const integrationId = this.getIdParam(req);
      
      // Check if user is an admin or manager
      const authUser = this.getAuthUser(req);
      
      if (!['admin', 'manager'].includes(authUser.role || '')) {
        throw new UnauthorizedError('You do not have permission to remove integrations from the organization');
      }
      
      const result = await this.organizationService.removeIntegration(
        organizationId,
        integrationId
      );
      
      this.sendSuccess(res, { success: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Searches organizations
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async searchOrganizations(
    req: Request, 
    res: Response<IApiResponse<IOrganization[]>>, 
    next: NextFunction
  ): Promise<void> {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        throw new ValidationError('Query parameter is required');
      }
      
      // Extract pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      const result = await this.organizationService.searchOrganizations(query, { page, limit });
      
      this.sendPaginatedSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}