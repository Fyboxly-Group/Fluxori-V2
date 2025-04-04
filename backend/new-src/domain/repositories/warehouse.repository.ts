/**
 * Warehouse Repository Implementation
 * Provides type-safe database operations for Warehouse entities
 */
import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '@/repositories/base.repository';
import { ID, EntityStatus, IPaginatedResult, IPaginationParams } from '@/types/base.types';
import { NotFoundError } from '@/types/error.types';
import { IWarehouse } from '../interfaces/inventory.interface';
import { WarehouseModel, IWarehouseDocument } from '../models/inventory.model';

/**
 * Warehouse repository interface
 */
export interface IWarehouseRepository {
  // Base repository methods
  create(data: Partial<IWarehouse>): Promise<IWarehouse>;
  findById(id: ID): Promise<IWarehouse | null>;
  update(id: ID, data: Partial<IWarehouse>): Promise<IWarehouse>;
  delete(id: ID): Promise<boolean>;
  
  // Warehouse specific methods
  findByIdOrFail(id: ID): Promise<IWarehouse>;
  findByCode(code: string, organizationId: ID): Promise<IWarehouse | null>;
  findByCodeOrFail(code: string, organizationId: ID): Promise<IWarehouse>;
  findDefaultWarehouse(organizationId: ID): Promise<IWarehouse | null>;
  findDefaultWarehouseOrFail(organizationId: ID): Promise<IWarehouse>;
  findByOrganization(organizationId: ID): Promise<IWarehouse[]>;
  setAsDefault(id: ID, organizationId: ID): Promise<IWarehouse>;
  updateStatus(id: ID, status: EntityStatus): Promise<IWarehouse>;
  searchWarehouses(query: string, organizationId: ID, options?: IPaginationParams): Promise<IPaginatedResult<IWarehouse>>;
}

/**
 * Warehouse repository implementation
 */
@injectable()
export class WarehouseRepository extends BaseRepository<IWarehouse, IWarehouseDocument> implements IWarehouseRepository {
  constructor() {
    super(WarehouseModel);
  }

  /**
   * Finds a warehouse by ID or throws NotFoundError
   * @param id - Warehouse ID
   * @returns Warehouse
   * @throws NotFoundError
   */
  public async findByIdOrFail(id: ID): Promise<IWarehouse> {
    const warehouse = await this.findById(id);
    if (!warehouse) {
      throw new NotFoundError(`Warehouse not found with id: ${id}`);
    }
    return warehouse;
  }

  /**
   * Finds a warehouse by code within an organization
   * @param code - Warehouse code
   * @param organizationId - Organization ID
   * @returns Warehouse or null
   */
  public async findByCode(code: string, organizationId: ID): Promise<IWarehouse | null> {
    return this.findOne({ 
      code, 
      organizationId: organizationId.toString() 
    });
  }

  /**
   * Finds a warehouse by code within an organization or throws NotFoundError
   * @param code - Warehouse code
   * @param organizationId - Organization ID
   * @returns Warehouse
   * @throws NotFoundError
   */
  public async findByCodeOrFail(code: string, organizationId: ID): Promise<IWarehouse> {
    const warehouse = await this.findByCode(code, organizationId);
    if (!warehouse) {
      throw new NotFoundError(`Warehouse not found with code: ${code}`);
    }
    return warehouse;
  }

  /**
   * Finds the default warehouse for an organization
   * @param organizationId - Organization ID
   * @returns Warehouse or null
   */
  public async findDefaultWarehouse(organizationId: ID): Promise<IWarehouse | null> {
    return this.findOne({ 
      organizationId: organizationId.toString(),
      isDefault: true
    });
  }

  /**
   * Finds the default warehouse for an organization or throws NotFoundError
   * @param organizationId - Organization ID
   * @returns Warehouse
   * @throws NotFoundError
   */
  public async findDefaultWarehouseOrFail(organizationId: ID): Promise<IWarehouse> {
    const warehouse = await this.findDefaultWarehouse(organizationId);
    if (!warehouse) {
      throw new NotFoundError(`Default warehouse not found for organization: ${organizationId}`);
    }
    return warehouse;
  }

  /**
   * Finds warehouses by organization
   * @param organizationId - Organization ID
   * @returns Array of warehouses
   */
  public async findByOrganization(organizationId: ID): Promise<IWarehouse[]> {
    const filter: FilterQuery<IWarehouseDocument> = { 
      organizationId: organizationId.toString() 
    };
    
    const result = await this.find(filter, {
      sortBy: 'name',
      sortOrder: 'asc'
    });
    
    return result.items;
  }

  /**
   * Sets a warehouse as the default for an organization
   * @param id - Warehouse ID
   * @param organizationId - Organization ID
   * @returns Updated warehouse
   */
  public async setAsDefault(id: ID, organizationId: ID): Promise<IWarehouse> {
    // First, unset isDefault flag for all warehouses in the organization
    const warehouses = await this.findByOrganization(organizationId);
    
    for (const warehouse of warehouses) {
      if (warehouse.id.toString() !== id.toString() && warehouse.isDefault) {
        await this.update(warehouse.id, { isDefault: false });
      }
    }
    
    // Then, set isDefault flag for the target warehouse
    return this.update(id, { isDefault: true });
  }

  /**
   * Updates a warehouse's status
   * @param id - Warehouse ID
   * @param status - New status
   * @returns Updated warehouse
   */
  public async updateStatus(id: ID, status: EntityStatus): Promise<IWarehouse> {
    return this.update(id, { status });
  }

  /**
   * Searches warehouses by name or code within an organization
   * @param query - Search query
   * @param organizationId - Organization ID
   * @param options - Pagination options
   * @returns Paginated result
   */
  public async searchWarehouses(
    query: string,
    organizationId: ID,
    options: IPaginationParams = {}
  ): Promise<IPaginatedResult<IWarehouse>> {
    const filter: FilterQuery<IWarehouseDocument> = {
      organizationId: organizationId.toString(),
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
    
    return this.find(filter, options);
  }
}