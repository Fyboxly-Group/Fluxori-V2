import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Project (raw data)
 */
export interface IProject {
  description?: string;
  type?: string;
  required?: boolean;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Project (includes Document methods)
 */
export interface IProjectDocument extends MongooseDocument, IProject {
  // Add document-specific methods here
}

/**
 * Model interface for Project (includes static methods)
 */
export interface IProjectModel extends Model<IProjectDocument> {
  // Add static model methods here
}
