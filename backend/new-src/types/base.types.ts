/**
 * Base Types for the application
 * These types provide a foundation for strongly-typed domain entities
 */

/**
 * ID type using branded type pattern for type safety
 * This ensures IDs can't be confused with regular strings
 */
export type ID = string & { readonly _brand: unique symbol };

/**
 * Creates a typed ID from a string
 * @param id - String to convert to an ID
 * @returns Typed ID
 */
export function createID(id: string): ID {
  return id as ID;
}

/**
 * Base entity interface with common properties for all domain entities
 */
export interface IBaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Standard API response format with generic typing
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * Pagination parameters for list queries
 */
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base filter parameters with common fields for all entities
 */
export interface IBaseFilter extends IPaginationParams {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: unknown;
}

/**
 * Repository result with pagination metadata
 */
export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Common query options for repositories
 */
export interface IQueryOptions {
  lean?: boolean;
  populate?: string | string[];
  select?: string | string[];
  [key: string]: unknown;
}

/**
 * Status type for entity status tracking
 */
export type EntityStatus = 'active' | 'inactive' | 'archived' | 'deleted';

/**
 * Base entity with organization ownership
 */
export interface IOrganizationEntity extends IBaseEntity {
  organizationId: ID;
  status: EntityStatus;
}

/**
 * Base user entity
 */
export interface IBaseUser extends IBaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

/**
 * Type for user roles
 */
export type UserRole = 'admin' | 'user' | 'manager' | 'viewer';

/**
 * Base organization entity
 */
export interface IBaseOrganization extends IBaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
}