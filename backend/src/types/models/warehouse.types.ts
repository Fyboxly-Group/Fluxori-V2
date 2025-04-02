import { Types, Model } from 'mongoose';
import { MongooseDocument } from '../utils/mongoose-document';

/**
 * Base interface for Warehouse (raw data)
 */
export interface IWarehouse {
  street?: string;
  type?: string;
  required?: boolean;
  trim?: boolean;
  // _id is provided by MongooseDocument
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface for Warehouse (includes Document methods)
 */
export interface IWarehouseDocument extends MongooseDocument, IWarehouse {
  // Add document-specific methods here
}

/**
 * Model interface for Warehouse (includes static methods)
 */
export interface IWarehouseModel extends Model<IWarehouseDocument> {
  // Add static model methods here
}
