/**
 * Script to create base TypeScript definitions
 * These are core types used throughout the application
 */
const fs = require('fs');
const path = require('path');

// Ensure the types directory exists
const typesDir = path.join(__dirname, '../src/types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Create mongoose-utils.ts
const mongooseUtilsPath = path.join(typesDir, 'mongoose-utils.ts');
const mongooseUtilsContent = `/**
 * Mongoose utility types
 * Common types and interfaces for working with MongoDB and Mongoose
 */
import { Document, Model, Types } from 'mongoose';

/**
 * Convert string ID to ObjectId or keep as ObjectId
 */
export type ObjectIdOrString = Types.ObjectId | string;

/**
 * Make all properties in T optional that are not in K
 */
export type RequiredKeys<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Base document fields
 */
export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base document interface with organization
 */
export interface OrganizationDocument extends BaseDocument {
  organizationId: Types.ObjectId;
}

/**
 * Query options for pagination, sorting and filtering
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  filter?: Record<string, any>;
  search?: string;
  fields?: string[];
  lean?: boolean;
  populate?: string | string[] | Record<string, any>;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Helper type for Repository with Document and Model
 */
export type WithDocumentAndModel<T, TDoc = T & Document, TModel = Model<TDoc>> = {
  document: TDoc;
  model: TModel;
};

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

/**
 * Represents a lean document (plain object) with _id as string
 */
export type LeanDocument<T> = Omit<T, '_id' | 'id'> & {
  _id: string;
  id?: string;
};
`;

// Create api-response.ts
const apiResponsePath = path.join(typesDir, 'api-response.ts');
const apiResponseContent = `/**
 * API Response types
 * Common types for API responses
 */

/**
 * Standard API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

/**
 * API error information
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Metadata for API responses
 */
export interface ApiResponseMeta {
  timestamp?: string;
  requestId?: string;
  pagination?: ApiPagination;
}

/**
 * Pagination information
 */
export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(data: T, meta?: ApiResponseMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Error response helper
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  stack?: string
): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      stack
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}
`;

// Create express-extensions.ts
const expressExtensionsPath = path.join(typesDir, 'express-extensions.ts');
const expressExtensionsContent = `/**
 * Express extensions
 * Type extensions for Express Request and Response
 */
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IUserDocument } from '../models/user.model';

/**
 * Authenticated request with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: IUserDocument & {
    id: string;
    organizationId?: string;
    role?: string;
    permissions?: string[];
  };
  organizationId?: string | Types.ObjectId;
  requestId?: string;
  startTime?: number;
}

/**
 * Request with optional file data
 */
export interface RequestWithFile extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

/**
 * Request with authenticated user and file data
 */
export interface AuthenticatedRequestWithFile extends AuthenticatedRequest, RequestWithFile {}

/**
 * For generic API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

/**
 * Typed Response for better API design
 */
export type TypedResponse<T> = Response<ApiResponse<T>>;

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | undefined;
}

/**
 * Parsed pagination parameters
 */
export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
  search?: string;
}
`;

// Write the files
fs.writeFileSync(mongooseUtilsPath, mongooseUtilsContent);
console.log(`Created mongoose utility types at ${mongooseUtilsPath}`);

fs.writeFileSync(apiResponsePath, apiResponseContent);
console.log(`Created API response types at ${apiResponsePath}`);

fs.writeFileSync(expressExtensionsPath, expressExtensionsContent);
console.log(`Created Express extensions at ${expressExtensionsPath}`);

// Create index.ts file to export all types
const indexPath = path.join(typesDir, 'index.ts');
const indexContent = `/**
 * Central export for all common types
 */

export * from './mongoose-utils';
export * from './api-response';
export * from './express-extensions';

// Add new type exports here
`;

fs.writeFileSync(indexPath, indexContent);
console.log(`Created index file at ${indexPath}`);

console.log('Successfully created base TypeScript definitions');