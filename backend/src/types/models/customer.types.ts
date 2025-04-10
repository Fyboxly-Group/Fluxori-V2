import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Customer (raw data)
 */
export interface ICustomer {
  street?: string;
  type?: string;
  trim?: string;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Customer (includes Document methods)
 */
export interface ICustomerDocument extends MongooseDocument, ICustomer {
  // Add document-specific methods here
}

/**
 * Model interface for Customer (includes static methods)
 */
export interface ICustomerModel extends Model<ICustomerDocument> {
  // Add static model methods here
}
