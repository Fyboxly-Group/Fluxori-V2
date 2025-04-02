// @ts-nocheck - Added by final-ts-fix.js
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

/**
 * Authentication user interface
 */
export interface AuthUser {
  _id: Types.ObjectId; 
  id: string; // String version of _id for compatibility
  email: string;
  organizationId: string; // String version for compatibility
  role: string;
}

/**
 * Authenticated request with user data
 * Redefines user as non-optional
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Typed response for use with specific data types
 */
export interface TypedResponse<T> extends Response {
  json(body: T): this;
}

/**
 * Create a typed response
 */
export function getTypedResponse<T>(res: Response): TypedResponse<T> {
  return res as TypedResponse<T>;
}

/**
 * Generic controller method type
 */
export type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Authenticated controller method type
 */
export type AuthControllerMethod = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
