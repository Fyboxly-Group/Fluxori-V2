/**
 * Organization Repository Implementation
 * Provides type-safe database operations for Organization entities
 */
import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '@/repositories/base.repository';
import { ID, IPaginatedResult, IPaginationParams } from '@/types/base.types';
import { NotFoundError } from '@/types/error.types';
import { 
  IOrganization, 
  IOrganizationIntegration, 
  OrganizationStatus 
} from '../interfaces/organization.interface';
import OrganizationModel, { IOrganizationDocument } from '../models/organization.model';

/**
 * Organization repository interface
 */
export interface IOrganizationRepository {
  // Base repository methods
  create(data: Partial<IOrganization>): Promise<IOrganization>;
  findById(id: ID): Promise<IOrganization | null>;
  update(id: ID, data: Partial<IOrganization>): Promise<IOrganization>;
  delete(id: ID): Promise<boolean>;
  
  // Organization specific methods
  findByIdOrFail(id: ID): Promise<IOrganization>;
  findBySlug(slug: string): Promise<IOrganization | null>;
  findBySlugOrFail(slug: string): Promise<IOrganization>;
  findByOwner(ownerId: ID): Promise<IOrganization[]>;
  findActiveById(id: ID): Promise<IOrganization | null>;
  findActiveByIdOrFail(id: ID): Promise<IOrganization>;
  findActiveBySlug(slug: string): Promise<IOrganization | null>;
  findChildren(organizationId: ID): Promise<IOrganization[]>;
  updateStatus(id: ID, status: OrganizationStatus): Promise<IOrganization>;
  addIntegration(id: ID, integration: Omit<IOrganizationIntegration, 'id'>): Promise<IOrganization>;
  updateIntegration(id: ID, integrationId: ID, data: Partial<IOrganizationIntegration>): Promise<IOrganization>;
  removeIntegration(id: ID, integrationId: ID): Promise<IOrganization>;
  searchOrganizations(query: string, options?: IPaginationParams): Promise<IPaginatedResult<IOrganization>>;
}

/**
 * Organization repository implementation using Mongoose
 */
@injectable()
export class OrganizationRepository extends BaseRepository<IOrganization, IOrganizationDocument> implements IOrganizationRepository {
  constructor() {
    super(OrganizationModel);
  }

  /**
   * Finds an organization by ID or throws NotFoundError
   * @param id - Organization ID
   * @returns Organization
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IOrganization> {
    const organization = await this.findById(id);
    if (!organization) {
      throw new NotFoundError(`Organization not found with id: ${id}`);
    }
    return organization;
  }

  /**
   * Finds an organization by slug
   * @param slug - Organization slug
   * @returns Organization or null
   */
  public async findBySlug(slug: string): Promise<IOrganization | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  /**
   * Finds an organization by slug or throws NotFoundError
   * @param slug - Organization slug
   * @returns Organization
   * @throws NotFoundError
   */
  public async findBySlugOrFail(slug: string): Promise<IOrganization> {
    const organization = await this.findBySlug(slug);
    if (!organization) {
      throw new NotFoundError(`Organization not found with slug: ${slug}`);
    }
    return organization;
  }

  /**
   * Finds organizations by owner
   * @param ownerId - Owner ID
   * @returns Array of organizations
   */
  public async findByOwner(ownerId: ID): Promise<IOrganization[]> {
    const filter: FilterQuery<IOrganizationDocument> = { ownerId: ownerId.toString() };
    const result = await this.find(filter);
    return result.items;
  }

  /**
   * Finds an active organization by ID
   * @param id - Organization ID
   * @returns Organization or null
   */
  public async findActiveById(id: ID): Promise<IOrganization | null> {
    return this.findOne({ _id: id, status: 'active' });
  }

  /**
   * Finds an active organization by ID or throws NotFoundError
   * @param id - Organization ID
   * @returns Organization
   * @throws NotFoundError
   */
  public async findActiveByIdOrFail(id: ID): Promise<IOrganization> {
    const organization = await this.findActiveById(id);
    if (!organization) {
      throw new NotFoundError(`Active organization not found with id: ${id}`);
    }
    return organization;
  }

  /**
   * Finds an active organization by slug
   * @param slug - Organization slug
   * @returns Organization or null
   */
  public async findActiveBySlug(slug: string): Promise<IOrganization | null> {
    return this.findOne({ slug: slug.toLowerCase(), status: 'active' });
  }

  /**
   * Finds child organizations of a parent organization
   * @param organizationId - Parent organization ID
   * @returns Array of organizations
   */
  public async findChildren(organizationId: ID): Promise<IOrganization[]> {
    const filter: FilterQuery<IOrganizationDocument> = { 
      parentOrganizationId: organizationId.toString() 
    };
    
    const result = await this.find(filter, {
      sortBy: 'name',
      sortOrder: 'asc'
    });
    
    return result.items;
  }

  /**
   * Updates an organization's status
   * @param id - Organization ID
   * @param status - New status
   * @returns Updated organization
   */
  public async updateStatus(id: ID, status: OrganizationStatus): Promise<IOrganization> {
    return this.update(id, { status });
  }

  /**
   * Adds an integration to an organization
   * @param id - Organization ID
   * @param integration - Integration data
   * @returns Updated organization
   */
  public async addIntegration(
    id: ID, 
    integration: Omit<IOrganizationIntegration, 'id'>
  ): Promise<IOrganization> {
    const organization = await this.findByIdOrFail(id);
    
    // Generate a new integration ID
    const integrationId = `int_${Date.now().toString(36)}` as ID;
    
    // Create new integrations array
    const integrations = [
      ...(organization.integrations || []),
      { ...integration, id: integrationId }
    ];
    
    return this.update(id, { integrations });
  }

  /**
   * Updates an integration
   * @param id - Organization ID
   * @param integrationId - Integration ID
   * @param data - Update data
   * @returns Updated organization
   */
  public async updateIntegration(
    id: ID,
    integrationId: ID,
    data: Partial<IOrganizationIntegration>
  ): Promise<IOrganization> {
    const organization = await this.findByIdOrFail(id);
    
    if (!organization.integrations) {
      throw new NotFoundError(`Integration not found with id: ${integrationId}`);
    }
    
    // Find the integration index
    const integrationIndex = organization.integrations.findIndex(
      i => i.id.toString() === integrationId.toString()
    );
    
    if (integrationIndex === -1) {
      throw new NotFoundError(`Integration not found with id: ${integrationId}`);
    }
    
    // Update the integration
    const updatedIntegrations = [...organization.integrations];
    updatedIntegrations[integrationIndex] = {
      ...updatedIntegrations[integrationIndex],
      ...data,
      id: integrationId // Ensure ID doesn't change
    };
    
    return this.update(id, { integrations: updatedIntegrations });
  }

  /**
   * Removes an integration
   * @param id - Organization ID
   * @param integrationId - Integration ID
   * @returns Updated organization
   */
  public async removeIntegration(id: ID, integrationId: ID): Promise<IOrganization> {
    const organization = await this.findByIdOrFail(id);
    
    if (!organization.integrations) {
      return organization;
    }
    
    // Filter out the integration
    const updatedIntegrations = organization.integrations.filter(
      i => i.id.toString() !== integrationId.toString()
    );
    
    return this.update(id, { integrations: updatedIntegrations });
  }

  /**
   * Searches organizations by name or description
   * @param query - Search query
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async searchOrganizations(
    query: string,
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IOrganization>> {
    const filter: FilterQuery<IOrganizationDocument> = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
    
    return this.find(filter, options);
  }
}