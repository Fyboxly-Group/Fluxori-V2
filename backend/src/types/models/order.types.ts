import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Order (raw data)
 */
export interface IOrder {
  street?: string;
  type?: string;
  required?: boolean;
  trim?: boolean;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Order (includes Document methods)
 */
export interface IOrderDocument extends MongooseDocument, IOrder {
  // Add document-specific methods here
}

/**
 * Model interface for Order (includes static methods)
 */
export interface IOrderModel extends Model<IOrderDocument> {
  // Add static model methods here
}
