/**
 * Base Repository Pattern Implementation
 * Provides type-safe database operations with MongoDB/Mongoose
 */
import mongoose, { 
  Document, 
  FilterQuery, 
  Model, 
  UpdateQuery, 
  QueryOptions as MongooseQueryOptions
} from 'mongoose';
import { 
  ID, 
  IBaseEntity, 
  IPaginatedResult, 
  IPaginationParams, 
  IQueryOptions 
} from '../types/base.types';
import { DatabaseError, NotFoundError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Base repository interface for MongoDB operations
 */
export interface IBaseRepository<T extends IBaseEntity, TDocument extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: ID, options?: IQueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<TDocument>, options?: IQueryOptions): Promise<T | null>;
  find(filter: FilterQuery<TDocument>, options?: IQueryOptions & IPaginationParams): Promise<IPaginatedResult<T>>;
  update(id: ID, data: Partial<T>, options?: IQueryOptions): Promise<T>;
  delete(id: ID): Promise<boolean>;
  exists(filter: FilterQuery<TDocument>): Promise<boolean>;
  count(filter: FilterQuery<TDocument>): Promise<number>;
}

/**
 * Base repository implementation for MongoDB using Mongoose
 */
export class BaseRepository<T extends IBaseEntity, TDocument extends Document> 
  implements IBaseRepository<T, TDocument> {
  
  protected model: Model<TDocument>;
  protected modelName: string;

  /**
   * Creates an instance of BaseRepository
   * @param model - Mongoose model
   */
  constructor(model: Model<TDocument>) {
    this.model = model;
    this.modelName = model.modelName;
  }

  /**
   * Creates a new document
   * @param data - Document data
   * @returns Created document
   */
  public async create(data: Partial<T>): Promise<T> {
    try {
      const created = await this.model.create(data);
      return this.documentToEntity(created);
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to create ${this.modelName}`);
    }
  }

  /**
   * Finds a document by ID
   * @param id - Document ID
   * @param options - Query options
   * @returns Found document or null
   */
  public async findById(id: ID, options: IQueryOptions = {}): Promise<T | null> {
    try {
      const query = this.model.findById(id);
      this.applyQueryOptions(query, options);
      const document = await query.exec();
      return document ? this.documentToEntity(document) : null;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName} by ID`);
    }
  }

  /**
   * Finds a document by filter
   * @param filter - Filter criteria
   * @param options - Query options
   * @returns Found document or null
   */
  public async findOne(
    filter: FilterQuery<TDocument>, 
    options: IQueryOptions = {}
  ): Promise<T | null> {
    try {
      const query = this.model.findOne(filter);
      this.applyQueryOptions(query, options);
      const document = await query.exec();
      return document ? this.documentToEntity(document) : null;
    } catch (error) {
      logger.error(`Error finding ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}`);
    }
  }

  /**
   * Finds documents by filter with pagination
   * @param filter - Filter criteria
   * @param options - Query options with pagination
   * @returns Paginated result
   */
  public async find(
    filter: FilterQuery<TDocument>,
    options: IQueryOptions & IPaginationParams = {}
  ): Promise<IPaginatedResult<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...queryOptions
      } = options;
      
      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = { 
        [sortBy]: sortOrder === 'asc' ? 1 : -1 
      };
      
      // Execute count and find queries in parallel
      const [total, documents] = await Promise.all([
        this.model.countDocuments(filter).exec(),
        this.model.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec()
          .then(docs => this.applyQueryOptions(docs, queryOptions))
      ]);
      
      const items = documents.map(doc => this.documentToEntity(doc));
      
      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error(`Error finding ${this.modelName} list:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName} list`);
    }
  }

  /**
   * Updates a document by ID
   * @param id - Document ID
   * @param data - Update data
   * @param options - Query options
   * @returns Updated document
   */
  public async update(id: ID, data: Partial<T>, options: IQueryOptions = {}): Promise<T> {
    try {
      const query = this.model.findByIdAndUpdate(
        id,
        { $set: data } as UpdateQuery<TDocument>,
        { 
          new: true,
          runValidators: true,
          ...this.convertQueryOptions(options)
        }
      );
      
      const document = await query.exec();
      
      if (!document) {
        throw new NotFoundError(`${this.modelName} not found with id: ${id}`);
      }
      
      return this.documentToEntity(document);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error updating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to update ${this.modelName}`);
    }
  }

  /**
   * Deletes a document by ID
   * @param id - Document ID
   * @returns Whether the document was deleted
   */
  public async delete(id: ID): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Checks if a document exists
   * @param filter - Filter criteria
   * @returns Whether the document exists
   */
  public async exists(filter: FilterQuery<TDocument>): Promise<boolean> {
    try {
      return !!(await this.model.exists(filter));
    } catch (error) {
      logger.error(`Error checking if ${this.modelName} exists:`, error);
      throw new DatabaseError(`Failed to check if ${this.modelName} exists`);
    }
  }

  /**
   * Counts documents by filter
   * @param filter - Filter criteria
   * @returns Count of matching documents
   */
  public async count(filter: FilterQuery<TDocument>): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      logger.error(`Error counting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to count ${this.modelName}`);
    }
  }

  /**
   * Converts a document to an entity
   * @param document - Mongoose document
   * @returns Plain entity object
   */
  protected documentToEntity(document: TDocument): T {
    const plainObject = document.toObject();
    
    // Convert _id to id
    plainObject.id = plainObject._id.toString() as ID;
    delete plainObject._id;
    delete plainObject.__v;
    
    return plainObject as unknown as T;
  }

  /**
   * Applies query options to a Mongoose query
   * @param query - Mongoose query
   * @param options - Query options
   * @returns Modified query
   */
  protected applyQueryOptions<Q>(
    query: Q, 
    options: IQueryOptions = {}
  ): Q {
    if (!query) return query;
    
    const mongooseQuery = query as any;
    
    if (options.select && typeof mongooseQuery.select === 'function') {
      mongooseQuery.select(options.select);
    }
    
    if (options.populate && typeof mongooseQuery.populate === 'function') {
      if (Array.isArray(options.populate)) {
        options.populate.forEach(field => mongooseQuery.populate(field));
      } else {
        mongooseQuery.populate(options.populate);
      }
    }
    
    if (options.lean && typeof mongooseQuery.lean === 'function') {
      mongooseQuery.lean();
    }
    
    return query;
  }

  /**
   * Converts query options to Mongoose query options
   * @param options - Query options
   * @returns Mongoose query options
   */
  protected convertQueryOptions(options: IQueryOptions = {}): MongooseQueryOptions {
    const mongooseOptions: MongooseQueryOptions = {};
    
    if (options.populate) {
      mongooseOptions.populate = options.populate;
    }
    
    return mongooseOptions;
  }
}