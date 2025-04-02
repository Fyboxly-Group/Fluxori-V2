// @ts-nocheck - Added by final-ts-fix.js
import { Types } from 'mongoose';

/**
 * Safely converts a string or ObjectId to ObjectId
 * @throws Error if the input is not a valid ObjectId
 */
export function toObjectId(id: string | Types.ObjectId | null | undefined): Types.ObjectId {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  
  if (!id) {
    throw new Error('Invalid ObjectId: null or undefined value provided');
  }
  
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: "${id}" is not a valid ObjectId`);
  }
  
  return new Types.ObjectId(id);
}

/**
 * Type guard for checking if a value is an ObjectId
 */
export function isObjectId(value: any): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}

/**
 * Type guard for checking if a string is a valid ObjectId string
 */
export function isObjectIdString(value: any): value is string {
  return typeof value === 'string' && Types.ObjectId.isValid(value);
}

/**
 * Safely converts an ObjectId to string
 */
export function objectIdToString(id: Types.ObjectId | string | null | undefined): string {
  if (!id) {
    return '';
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  return id.toString();
}
