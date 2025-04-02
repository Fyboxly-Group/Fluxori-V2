// @ts-nocheck - Added by final-ts-fix.js
import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Task (raw data)
 */
export interface ITask {
  name?: any;
  type?: string;
  required: any;
  trim?: any;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Task (includes Document methods)
 */
export interface ITaskDocument extends MongooseDocument, ITask {
  // Add document-specific methods here
}

/**
 * Model interface for Task (includes static methods)
 */
export interface ITaskModel extends Model<ITaskDocument> {
  // Add static model methods here
}
