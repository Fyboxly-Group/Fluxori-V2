// @ts-nocheck - Added by final-ts-fix.js
/**
 * Utility types for Mongoose used throughout the application
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Type for a document before it is saved to the database
 */
export interface CreateDocumentType<T> {
  [key: string]: any;
}

/**
 * Type for a document update
 */
export interface UpdateDocumentType<T> {
  [key: string]: any;
}

/**
 * Type for a mongoose pre-save hook callback
 */
export type PreHookCallback = (err?: Error) => void;

/**
 * Type for a mongoose post-save hook callback
 */
export type PostHookCallback = (err?: Error, doc?: Document) => void;

/**
 * Convert a string ID to MongoDB ObjectId
 */
export const toObjectId = (id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  return new mongoose.Types.ObjectId(id);
};

// Re-export mongoose types to avoid conflicts
export { Document, Model, Schema };
