/**
 * Type definitions for request and response validation
 */
import { Schema, ValidationOptions, ValidationError } from 'joi';
import { Request, Response } from 'express';

/**
 * Schema types for different parts of a request
 */
export type RequestSection = 'body' | 'query' | 'params' | 'headers' | 'cookies';

/**
 * Validation rule types for TypeScript integration
 */
export type ValidationRuleType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'object' 
  | 'array' 
  | 'date' 
  | 'any';

/**
 * Validation rule interface with constraints
 */
export interface ValidationRule<T = any> {
  type: ValidationRuleType;
  required?: boolean;
  enum?: readonly string[] | readonly number[];
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  default?: T;
  description?: string;
  example?: T;
  items?: ValidationRule; // For array items
  properties?: Record<string, ValidationRule>; // For object properties
}

/**
 * Type mapping for validation rule types to TypeScript types
 */
export interface TypeMapping {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, any>;
  array: any[];
  date: Date;
  any: any;
}

/**
 * Infer TypeScript type from a validation rule
 */
export type InferType<R extends ValidationRule> = 
  R extends ValidationRule<infer T> ? 
    (R['type'] extends keyof TypeMapping ? 
      (R['required'] extends false ? TypeMapping[R['type']] | undefined : TypeMapping[R['type']]) : 
      T) : 
    never;

/**
 * Infer TypeScript type from a validation schema
 */
export type InferSchemaType<T extends Record<string, ValidationRule>> = {
  [K in keyof T]: InferType<T[K]>;
};

/**
 * Request validation schema
 */
export interface RequestValidationSchema {
  body?: Schema | Record<string, ValidationRule>;
  query?: Schema | Record<string, ValidationRule>;
  params?: Schema | Record<string, ValidationRule>;
  headers?: Schema | Record<string, ValidationRule>;
  cookies?: Schema | Record<string, ValidationRule>;
  description?: string;
}

/**
 * Response validation schema
 */
export interface ResponseValidationSchema {
  [statusCode: number]: {
    schema: Schema | Record<string, ValidationRule>;
    description?: string;
  };
}

/**
 * Complete route validation schema
 */
export interface RouteValidationSchema {
  request?: RequestValidationSchema;
  response?: ResponseValidationSchema;
}

/**
 * Validation error object
 */
export interface ValidationErrorItem {
  message: string;
  path: string[];
  type: string;
  context?: Record<string, any>;
}

/**
 * Validation result with typed errors
 */
export interface ValidationResult {
  errors: Record<string, string[]>;
  hasErrors: boolean;
  value?: any;
}

/**
 * Type guard for validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error && error.name === 'ValidationError' && Array.isArray(error.details);
}

/**
 * Validated request with typed properties
 */
export interface ValidatedRequest<
  B = any,
  Q = any,
  P = any,
  H = any,
  C = any
> extends Request {
  /** Validated request body */
  validatedBody?: B;
  /** Validated query parameters */
  validatedQuery?: Q;
  /** Validated route parameters */
  validatedParams?: P;
  /** Validated headers */
  validatedHeaders?: H;
  /** Validated cookies */
  validatedCookies?: C;
}

/**
 * Validation options interface
 */
export interface ValidationMiddlewareOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  convert?: boolean;
  allowUnknown?: boolean;
}

/**
 * Default validation options
 */
export const DEFAULT_VALIDATION_OPTIONS: ValidationMiddlewareOptions = {
  abortEarly: false,
  stripUnknown: false,
  convert: true,
  allowUnknown: true
};