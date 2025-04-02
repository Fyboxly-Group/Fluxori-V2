// @ts-nocheck - Added by final-ts-fix.js
import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Milestone (raw data)
 */
export interface IMilestone {
  name?: any;
  type?: string;
  required: any;
  trim?: any;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Milestone (includes Document methods)
 */
export interface IMilestoneDocument extends MongooseDocument, IMilestone {
  // Add document-specific methods here
}

/**
 * Model interface for Milestone (includes static methods)
 */
export interface IMilestoneModel extends Model<IMilestoneDocument> {
  // Add static model methods here
}
