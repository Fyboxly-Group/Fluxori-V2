import * as mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { injectable, inject } from 'inversify';
import { ApiError } from '../../middleware/error.middleware';
import EntityName, { IEntityName, IEntityNameDocument } from '../models/entityName.model';
import { LoggerService } from '../../services/logger.service';

/**
 * Service interface for dependency injection
 */
export interface IEntityNameService {
  getAll(organizationId: string, options: EntityNameQueryOptions): Promise<EntityNameListResult>;
  getById(id: string, organizationId: string): Promise<IEntityNameDocument>;
  create(data: Partial<IEntityName>, userId: string, organizationId: string): Promise<IEntityNameDocument>;
  update(id: string, data: Partial<IEntityName>, organizationId: string): Promise<IEntityNameDocument>;
  archive(id: string, organizationId: string): Promise<IEntityNameDocument>;
  delete(id: string, organizationId: string): Promise<boolean>;
}

/**
 * Interface for EntityName query options
 */
export interface EntityNameQueryOptions {
  limit?: number;
  page?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  // Add specific filters here
}

/**
 * Interface for EntityName list result
 */
export interface EntityNameListResult {
  items: IEntityNameDocument[];
  total: number;
  page: number;
  limit: number;
}

/**
 * EntityName Service
 * Handles business logic for entityName operations
 */
@injectable()
export class EntityNameService implements IEntityNameService {
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {}

  /**
   * Get all entityNames with pagination and filtering
   */
  async getAll(
    organizationId: string,
    options: EntityNameQueryOptions = {}
  ): Promise<EntityNameListResult> {
    try {
      const {
        limit = 10,
        page = 1,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query filters
      const query: any = {
        organizationId: new mongoose.Types.ObjectId(organizationId)
      };

      // Add status filter if specified
      if (status && status !== 'all') {
        query.status = status;
      }

      // Add search filter if specified
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const items = await EntityName
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await EntityName.countDocuments(query);

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error(`Error in EntityNameService.getAll: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to get entityName list: ${String(error)}`);
    }
  }

  /**
   * Get a entityName by ID
   */
  async getById(id: string, organizationId: string): Promise<IEntityNameDocument> {
    try {
      const item = await EntityName.findOne({
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (!item) {
        throw new ApiError(StatusCodes.NOT_FOUND, `EntityName not found with id: ${id}`);
      }

      return item;
    } catch (error) {
      this.logger.error(`Error in EntityNameService.getById: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to get entityName: ${String(error)}`);
    }
  }

  /**
   * Create a new entityName
   */
  async create(
    data: Partial<IEntityName>,
    userId: string,
    organizationId: string
  ): Promise<IEntityNameDocument> {
    try {
      const newItem = new EntityName({
        ...data,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: data.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return await newItem.save();
    } catch (error) {
      this.logger.error(`Error in EntityNameService.create: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to create entityName: ${String(error)}`);
    }
  }

  /**
   * Update an existing entityName
   */
  async update(
    id: string,
    data: Partial<IEntityName>,
    organizationId: string
  ): Promise<IEntityNameDocument> {
    try {
      const item = await this.getById(id, organizationId);

      // Update fields
      Object.assign(item, {
        ...data,
        updatedAt: new Date()
      });

      return await item.save();
    } catch (error) {
      this.logger.error(`Error in EntityNameService.update: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to update entityName: ${String(error)}`);
    }
  }

  /**
   * Archive a entityName (soft delete)
   */
  async archive(id: string, organizationId: string): Promise<IEntityNameDocument> {
    try {
      const item = await this.getById(id, organizationId);

      item.status = 'archived';
      item.updatedAt = new Date();

      return await item.save();
    } catch (error) {
      this.logger.error(`Error in EntityNameService.archive: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to archive entityName: ${String(error)}`);
    }
  }

  /**
   * Delete a entityName permanently
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    try {
      const result = await EntityName.deleteOne({
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      });

      if (result.deletedCount === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, `EntityName not found with id: ${id}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in EntityNameService.delete: ${error instanceof Error ? error.message : String(error)}`);
      throw error instanceof Error 
        ? error 
        : new Error(`Failed to delete entityName: ${String(error)}`);
    }
  }
}